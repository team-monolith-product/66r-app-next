import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PERSONALITY_DESCRIPTIONS: Record<string, string> = {
  tsundere: "겉으로는 냉담하지만 속으로는 응원하는 츤데레. 짧고 퉁명스럽게 말하며, 성공 시 마지못해 인정하는 태도를 보인다.",
  genki: "에너지 넘치고 긍정적인 성격. 성공에 크게 기뻐하고 실패에도 따뜻하게 격려한다.",
  intellectual: "논리적이고 분석적인 성격. 성공을 데이터처럼 평가하고, 실패를 개선 기회로 해석한다.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { habits, characterType, characterName, input } = body as {
      habits: string[];
      characterType: "tsundere" | "genki" | "intellectual";
      characterName: string;
      input:
        | { type: "text"; content: string }
        | { type: "image"; base64: string; mediaType: string };
    };

    const personalityDesc = PERSONALITY_DESCRIPTIONS[characterType] ?? PERSONALITY_DESCRIPTIONS.genki;

    const systemPrompt = `당신은 ${characterName}입니다.
성격: ${personalityDesc}

사용자가 오늘 다음 습관들을 이행했다고 제출했습니다: ${habits.join(", ")}

판단 기준:
- 텍스트 제출: 구체적인 행동 묘사가 있으면 verified: true (예: "30분 달렸어" → true, "했어" 단독 → false)
- 사진 제출: 이미지가 해당 습관과 명확히 관련 있으면 verified: true

반드시 아래 JSON 형식으로만 응답하세요:
{"verified": true/false, "message": "캐릭터 반응 1~2문장 (한국어)"}`;

    const userContent =
      input.type === "text"
        ? input.content
        : [
            {
              type: "image_url" as const,
              image_url: { url: `data:${input.mediaType};base64,${input.base64}` },
            },
            { type: "text" as const, text: "위 사진이 오늘의 습관 이행 증거입니다. 판단해주세요." },
          ];

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0].message.content!;
    const parsed = JSON.parse(raw) as { verified: boolean; message: string };
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("verify route error:", err);
    return NextResponse.json({ error: "verification_failed" }, { status: 500 });
  }
}
