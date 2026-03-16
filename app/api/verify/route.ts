import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PERSONALITY_DESCRIPTIONS: Record<string, string> = {
  tsundere: "겉으로는 냉담하지만 속으로는 응원하는 츤데레. 짧고 퉁명스럽게 말하며, 성공 시 마지못해 인정하는 태도를 보인다.",
  genki: "에너지 넘치고 긍정적인 성격. 성공에 크게 기뻐하고 실패에도 따뜻하게 격려한다.",
  intellectual: "논리적이고 분석적인 성격. 성공을 데이터처럼 평가하고, 실패를 개선 기회로 해석한다.",
};

type ConversationMessage = {
  role: "user" | "assistant";
  text: string;
  imageBase64?: string;
  imageMediaType?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { habit, characterType, characterName, dayCount, streak, messages, habitTurnCount } = body as {
      habit: string;
      characterType: "tsundere" | "genki" | "intellectual";
      characterName: string;
      dayCount: number;
      streak: number;
      messages: ConversationMessage[];
      habitTurnCount: number;
    };

    const personalityDesc = PERSONALITY_DESCRIPTIONS[characterType] ?? PERSONALITY_DESCRIPTIONS.genki;
    const forceEnd = habitTurnCount >= 2;

    const systemPrompt = `당신은 ${characterName}입니다.
성격: ${personalityDesc}

검증 중인 습관: ${habit}
맥락: ${dayCount}일차, 현재 스트릭 ${streak}일

역할: 유저가 제출한 증거(텍스트 + 사진)를 평가한다.

판단 기준:
- "photo_check": 텍스트와 사진이 모두 있고 해당 습관과 맥락이 맞음
                 (사진만 있어도 내용이 충분히 관련성 있으면 photo_check 가능)
- "follow_up":   증거가 불충분하거나 텍스트/사진 중 하나만 있을 때 구체적인 추가 질문
                 (habitTurnCount >= 2이면 반드시 photo_check 또는 irrelevant 반환)
- "irrelevant":  해당 습관과 전혀 관련 없는 내용 → 즉시 irrelevant 반환

${forceEnd ? "⚠️ habitTurnCount가 2 이상입니다. 반드시 photo_check 또는 irrelevant만 반환해야 합니다. follow_up은 절대 반환하지 마세요." : ""}

응답 형식 (JSON only):
{ "action": "photo_check" | "follow_up" | "irrelevant", "message": "캐릭터 한국어 반응 (1~2문장)" }`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const openaiMessages: any[] = [];

    for (const msg of messages) {
      if (msg.role === "assistant") {
        openaiMessages.push({ role: "assistant", content: msg.text });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parts: any[] = [{ type: "text", text: msg.text || "(텍스트 없음)" }];
        if (msg.imageBase64 && msg.imageMediaType) {
          parts.push({
            type: "image_url",
            image_url: { url: `data:${msg.imageMediaType};base64,${msg.imageBase64}` },
          });
        }
        openaiMessages.push({ role: "user", content: parts });
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...openaiMessages,
      ],
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content ?? "";
    if (!raw.trim()) throw new Error("Empty response from LLM");

    const parsed = JSON.parse(raw) as {
      action: "photo_check" | "follow_up" | "irrelevant";
      message: string;
    };

    // forceEnd인데 follow_up이 왔으면 irrelevant로 강제 전환
    if (forceEnd && parsed.action === "follow_up") {
      parsed.action = "irrelevant";
      parsed.message = "증거가 부족해서 인정할 수 없어.";
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("verify route error:", err);
    return NextResponse.json({ error: "verification_failed" }, { status: 500 });
  }
}
