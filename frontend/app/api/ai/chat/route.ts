import { OpenAI } from "openai";
import { createClient } from "@/utils/supabase/server";
import { getSystemContext, formatContextForPrompt } from "@/utils/ai/context";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    const supabase = createClient();

    // 1. Auth Check - get user specifically
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { messages } = await req.json(); // messages: { role, content }[]
        const userMessage = messages[messages.length - 1].content;

        // 2. Fetch Context
        const systemContext = await getSystemContext();
        const contextString = formatContextForPrompt(systemContext);

        // 3. Construct Prompt
        const systemMessage = {
            role: "system",
            content: `You are 'Boketto AI', an expert operations strategist for a premium travel company. 
            Your goal is to maximize trip success, ensuring captain performance, vendor reliability, and profit margins.
            
            ${contextString}
            
            GUIDELINES:
            - Be concise and actionable.
            - Prioritize high-risk items first.
            - If asking about a specific trip/captain, reference the IDs provided in context if matching.
            - Suggest concrete "Next Steps".
            `
        };

        // 4. Call OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // or gpt-3.5-turbo
            messages: [systemMessage, ...messages],
            temperature: 0.7,
        });

        const aiResponse = response.choices[0].message.content;

        // 5. Log Interaction (Fire and forget, or await)
        await supabase.from('ai_decision_logs').insert({
            user_id: user.id,
            request_type: 'chat',
            query_text: userMessage,
            ai_response_text: aiResponse,
            context_used: systemContext,
        });

        return NextResponse.json({
            response: aiResponse,
            contextUsed: systemContext // Optional: for debugging
        });

    } catch (error: any) {
        console.error("AI Error:", error);
        return NextResponse.json({ error: error.message || "AI Service Error" }, { status: 500 });
    }
}
