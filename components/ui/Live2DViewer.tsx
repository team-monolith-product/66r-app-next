"use client"

import { useEffect, useRef } from "react"

type Size = "sm" | "md" | "lg"
type Mood = "neutral" | "happy" | "shy" | "sad"
type Focus = "upper" | "full"

const CANVAS_SIZES: Record<Size, { w: number; h: number }> = {
  sm: { w: 96,  h: 128 },
  md: { w: 160, h: 200 },
  lg: { w: 220, h: 280 },
}

const MOOD_EXPRESSION: Record<Mood, string | null> = {
  neutral: null,
  happy:   "3_redface",
  shy:     "3_redface",
  sad:     "5_tear",
}

const MODEL_URL = "/live2d/MyWaifuTeacher/4.model3.json"

interface Props {
  size: Size
  mood?: Mood
  focus?: Focus
}

const DPR = 2  // render at 2x for crisp CSS zoom

export default function Live2DViewer({ size, mood = "neutral", focus = "upper" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRef = useRef<any>(null)
  const { w, h } = CANVAS_SIZES[size]
  const rw = w * DPR  // actual pixel buffer width
  const rh = h * DPR  // actual pixel buffer height

  useEffect(() => {
    if (!canvasRef.current) return

    let destroyed = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let app: any = null

    const init = async () => {
      const PIXI = await import("pixi.js")
      const { Live2DModel } = await import("pixi-live2d-display/cubism4")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Live2DModel.registerTicker(PIXI.Ticker as any)

      if (destroyed || !canvasRef.current) return

      app = new PIXI.Application({
        view: canvasRef.current,
        width: rw,
        height: rh,
        backgroundAlpha: 0,
        antialias: true,
      })

      const model = await Live2DModel.from(MODEL_URL)

      if (destroyed) {
        if (app) app.destroy(false)
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const im = model.internalModel as any
      const originalWidth  = im.originalWidth  ?? model.width
      const originalHeight = im.originalHeight ?? model.height

      // Initial positioning (upper body default)
      const scale = rw / originalWidth
      model.scale.set(scale)
      model.anchor.set(0.5, 0)
      model.x = rw / 2
      model.y = rh * 0.05

      app.stage.addChild(model as unknown as import("pixi.js").DisplayObject)
      modelRef.current = model

      const expr = MOOD_EXPRESSION[mood]
      if (expr) model.expression(expr)
    }

    init().catch(console.error)

    return () => {
      destroyed = true
      modelRef.current = null
      if (app) {
        app.destroy(false)
        app = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rw, rh])

  // Reposition model when focus changes — no app recreation
  useEffect(() => {
    const model = modelRef.current
    if (!model) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const im = model.internalModel as any
    const ow = im.originalWidth  ?? model.width
    const oh = im.originalHeight ?? model.height

    if (focus === "full") {
      const s = Math.min(rw / ow, rh / oh)
      model.scale.set(s)
      model.anchor.set(0.5, 0.5)
      model.x = rw / 2
      model.y = rh / 2
    } else {
      const s = rw / ow
      model.scale.set(s)
      model.anchor.set(0.5, 0)
      model.x = rw / 2
      model.y = rh * 0.05
    }
  }, [focus, rw, rh])

  useEffect(() => {
    const model = modelRef.current
    if (!model) return
    const expr = MOOD_EXPRESSION[mood]
    if (expr) model.expression(expr)
    else model.expression()
  }, [mood])

  return (
    <canvas
      ref={canvasRef}
      width={rw}
      height={rh}
      style={{ display: "block", width: w, height: h }}
    />
  )
}
