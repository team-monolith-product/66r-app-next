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
    const { habits, characterType, characterName, dayCount, streak, messages, turnCount } = body as {
      habits: string[];
      characterType: "tsundere" | "genki" | "intellectual";
      characterName: string;
      dayCount: number;
      streak: number;
      messages: ConversationMessage[];
      turnCount: number;
    };

    const personalityDesc = PERSONALITY_DESCRIPTIONS[characterType] ?? PERSONALITY_DESCRIPTIONS.genki;
    const habitList = habits.map((h, i) => `${i + 1}. ${h}`).join("\n");
    const forceVerdict = turnCount >= 3;

    const systemPrompt = `당신은 ${characterName}입니다.
성격: ${personalityDesc}

오늘 검증할 습관 목록:
${habitList}

맥락: ${dayCount}일차, 현재 스트릭 ${streak}일

당신의 역할:
1. 유저가 습관 증거(텍스트 설명 + 사진)를 제출하도록 유도한다.
2. 증거가 불충분하면 구체적인 추가 질문을 한다.
   - 텍스트만 있으면: 사진도 요청한다 ("사진도 보내줘", "증거가 필요해" 등 캐릭터 말투로)
   - 사진만 있으면: 텍스트 설명도 요청한다
   - "했어요" 한 줄처럼 너무 짧으면: 더 구체적인 내용 요청
3. 사진이 의심스러우면 (너무 완벽한 구도, 전문가 스타일, 워터마크, 습관과 맥락 불일치):
   캐릭터 말투로 자연스럽게 의심 표현 ("이 사진 오늘 직접 찍은 거야?", "인터넷에서 퍼온 거 아니야?" 등)
4. 텍스트 + 사진 둘 다 있고 내용이 일치할 때 긍정 판정을 고려한다.
5. turnCount >= 3이면 반드시 지금까지 모인 증거로 최종 verdict를 내려야 한다.

엄격한 검증 기준:
- 텍스트만: "30분 달렸어" 수준의 구체성 필요. 사진도 요청할 것.
- 사진만: 텍스트 설명도 요청할 것.
- 둘 다 있을 때: 내용이 서로 일치하는지 확인.
- 사진 위조 의심 기준: 너무 완벽한 구도, 전문가 사진 스타일, 습관과 맥락 불일치.

${forceVerdict ? "⚠️ turnCount가 3에 도달했습니다. 반드시 지금 verdict를 반환해야 합니다." : ""}

응답은 반드시 아래 JSON 형식으로만:
{
  "action": "follow_up" | "verdict",
  "message": "캐릭터 반응 한국어 (1~2문장)",
  "habitResults": [{"habit": "습관명", "verified": true/false}, ...],  // verdict일 때만
  "overallVerified": true/false  // verdict일 때만
}

follow_up일 때는 habitResults, overallVerified 필드를 포함하지 않는다.`;

    // 대화 히스토리를 OpenAI messages 형식으로 변환
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
      max_tokens: 700,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content ?? "";
    if (!raw.trim()) throw new Error("Empty response from LLM");
    const parsed = JSON.parse(raw) as {
      action: "follow_up" | "verdict";
      message: string;
      habitResults?: { habit: string; verified: boolean }[];
      overallVerified?: boolean;
    };

    // verdict일 때 원본 habits 배열 이름 사용 (LLM이 이름을 깨뜨릴 수 있음)
    if (parsed.action === "verdict" && parsed.habitResults) {
      parsed.habitResults = habits.map((habit, i) => ({
        habit,
        verified: parsed.habitResults![i]?.verified ?? false,
      }));
      const passCount = parsed.habitResults.filter((r) => r.verified).length;
      parsed.overallVerified = passCount * 2 >= habits.length;
    }

    // forceVerdict인데 follow_up이 왔으면 강제로 verdict 처리
    if (forceVerdict && parsed.action === "follow_up") {
      parsed.action = "verdict";
      parsed.habitResults = habits.map((habit) => ({ habit, verified: false }));
      parsed.overallVerified = false;
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("verify route error:", err);
    return NextResponse.json({ error: "verification_failed" }, { status: 500 });
  }
}
