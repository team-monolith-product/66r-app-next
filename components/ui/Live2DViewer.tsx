"use client"

import { useEffect, useRef } from "react"

type Size = "sm" | "md" | "lg"
type Mood = "neutral" | "happy" | "shy" | "sad"

const CANVAS_SIZES: Record<Size, { w: number; h: number }> = {
  sm: { w: 96, h: 128 },
  md: { w: 160, h: 200 },
  lg: { w: 220, h: 280 },
}

const MOOD_EXPRESSION: Record<Mood, string | null> = {
  neutral: null,
  happy: "3_redface",
  shy: "3_redface",
  sad: "5_tear",
}

const MODEL_URL = "/live2d/MyWaifuTeacher/4.model3.json"

// Module-level singletons (outside component)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _modelCache: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _modelLoadPromise: Promise<any> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOrLoadModel(Live2DModel: any): Promise<any> {
  if (_modelCache) return _modelCache
  if (!_modelLoadPromise) {
    _modelLoadPromise = Live2DModel.from(MODEL_URL).then((m: any) => {
      _modelCache = m
      return m
    })
  }
  return _modelLoadPromise
}

interface Props {
  size: Size
  mood?: Mood
}

export default function Live2DViewer({ size, mood = "neutral" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRef = useRef<any>(null)
  const { w, h } = CANVAS_SIZES[size]

  useEffect(() => {
    if (!canvasRef.current) return

    let destroyed = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let app: any = null

    const init = async () => {
      const PIXI = await import("pixi.js")
      const { Live2DModel } = await import("pixi-live2d-display/cubism4")

      // Register PIXI ticker for Live2D animation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Live2DModel.registerTicker(PIXI.Ticker as any)

      if (destroyed || !canvasRef.current) return

      app = new PIXI.Application({
        view: canvasRef.current,
        width: w,
        height: h,
        backgroundAlpha: 0,
        antialias: true,
      })

      const model = await getOrLoadModel(Live2DModel)

      if (destroyed) {
        if (app) app.destroy(false, { children: false })
        return
      }

      // If model already has a parent (from a previous mount), remove it
      if (model.parent) {
        model.parent.removeChild(model)
      }

      // Scale model to fit inside canvas (fit-inside, centered)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const im = model.internalModel as any
      const originalWidth = im.originalWidth ?? model.width
      const originalHeight = im.originalHeight ?? model.height
      const scale = Math.min(w / originalWidth, h / originalHeight)
      model.scale.set(scale)
      model.anchor.set(0.5, 0.5)
      model.x = w / 2
      model.y = h / 2

      app.stage.addChild(model as unknown as import("pixi.js").DisplayObject)
      modelRef.current = model

      // Apply initial mood expression
      const expr = MOOD_EXPRESSION[mood]
      if (expr) {
        model.expression(expr)
      }
    }

    init().catch(console.error)

    return () => {
      destroyed = true
      if (modelRef.current && app) {
        app.stage.removeChild(modelRef.current)
      }
      modelRef.current = null
      if (app) {
        app.destroy(false, { children: false })
        app = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h])

  // Handle mood changes after mount
  useEffect(() => {
    const model = modelRef.current
    if (!model) return
    const expr = MOOD_EXPRESSION[mood]
    if (expr) {
      model.expression(expr)
    } else {
      model.expression()
    }
  }, [mood])

  return (
    <canvas
      ref={canvasRef}
      width={w}
      height={h}
      style={{ display: "block" }}
    />
  )
}
