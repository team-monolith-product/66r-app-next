import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
        | { type: "image"; habitImages: ({ base64: string; mediaType: string } | null)[] };
    };

    const personalityDesc = PERSONALITY_DESCRIPTIONS[characterType] ?? PERSONALITY_DESCRIPTIONS.genki;

    // ── Step 1: 습관 판단 ──────────────────────────────────────────────────
    const judgmentSystemPrompt = `You are a habit verification judge.
The user submitted evidence for these habits:
${habits.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Judgment rules:
- Text submission: verified=true if there is a concrete description of the action (e.g. "ran for 30 minutes" → true, "did it" alone → false)
- Photo submission: be lenient (the goal is encouragement)
  - verified=true if the photo could plausibly relate to the habit
  - Examples: "running" → sneakers, outdoor scenery, running app screenshot, sweat photo → true
  - Examples: "drink water" → cup, bottle, beverage photo → true
  - Only verified=false if clearly unrelated, or no photo provided
  - When in doubt → true

Respond ONLY with valid JSON, no explanation:
{"habitResults": [{"habit": "habit name", "verified": true/false}, ...]}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let judgmentUserContent: any;

    if (input.type === "text") {
      judgmentUserContent = `Evidence submitted: ${input.content}\n\nJudge each habit individually.`;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parts: any[] = [];
      input.habitImages.forEach((img, i) => {
        parts.push({ type: "text", text: `[Habit ${i + 1}: ${habits[i]}]` });
        if (img) {
          parts.push({
            type: "image_url",
            image_url: { url: `data:${img.mediaType};base64,${img.base64}` },
          });
        } else {
          parts.push({ type: "text", text: "→ No photo provided (auto: false)" });
        }
      });
      parts.push({ type: "text", text: "Judge each habit based on its photo." });
      judgmentUserContent = parts;
    }

    const judgmentRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: judgmentSystemPrompt },
        { role: "user", content: judgmentUserContent },
      ],
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const judgmentRaw = judgmentRes.choices[0].message.content!;
    const parsed = JSON.parse(judgmentRaw) as {
      habitResults: { habit: string; verified: boolean }[];
    };
    // LLM이 한국어 habit 이름을 깨뜨릴 수 있으므로 원본 habits 배열 이름을 사용
    const habitResults = habits.map((habit, i) => ({
      habit,
      verified: parsed.habitResults[i]?.verified ?? false,
    }));

    const passCount = habitResults.filter((r) => r.verified).length;
    const overallVerified = passCount * 2 >= habits.length; // 반 이상

    // ── Step 2: 캐릭터 메시지 생성 ────────────────────────────────────────
    const passedHabits = habitResults.filter((r) => r.verified).map((r) => r.habit);
    const failedHabits = habitResults.filter((r) => !r.verified).map((r) => r.habit);

    const messageSystemPrompt = `당신은 ${characterName}입니다.
성격: ${personalityDesc}

사용자의 오늘 습관 인증 결과:
- 통과: ${passedHabits.length > 0 ? passedHabits.join(", ") : "없음"}
- 미통과: ${failedHabits.length > 0 ? failedHabits.join(", ") : "없음"}
- 전체 결과: ${overallVerified ? "인증 성공" : "인증 실패"}

위 결과에 대한 캐릭터 반응을 한국어로 1~2문장 작성하세요.
반드시 아래 JSON 형식으로만 응답하세요:
{"message": "캐릭터 반응"}`;

    const messageRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: messageSystemPrompt }],
      max_tokens: 150,
      response_format: { type: "json_object" },
    });

    const messageRaw = messageRes.choices[0].message.content!;
    const { message } = JSON.parse(messageRaw) as { message: string };

    return NextResponse.json({ habitResults, overallVerified, message });
  } catch (err) {
    console.error("verify route error:", err);
    return NextResponse.json({ error: "verification_failed" }, { status: 500 });
  }
}
