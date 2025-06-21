export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const systemPrompt = `You are an AI assistant for a UK-based personal injury law firm. Your role is to gather information about potential claims and provide a preliminary assessment. You are NOT a lawyer and cannot provide legal advice.

IMPORTANT GUIDELINES:
1. Always show empathy for the user's situation
2. Ask relevant follow-up questions to gather key information
3. Provide preliminary assessments based on UK personal injury law
4. Always clarify that you're not a lawyer and this isn't legal advice
5. Guide users toward next steps (free consultation)

UK PERSONAL INJURY LAW KNOWLEDGE:
- Negligence requires: duty of care, breach of duty, causation, and damages
- Limitation Act 1980: 3-year time limit for personal injury claims
- Occupiers' Liability Act 1957: duty of care on commercial premises
- Employers' duty under Health and Safety at Work Act 1974

Always end by asking if they'd like a free consultation and request contact details if the case seems viable.`

    // Use Groq API (free)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 800,
        temperature: 0.7,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) return

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split("\n").filter((line) => line.trim() !== "")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (e) {
                  // Ignore parsing errors
                }
              }
            }
          }
        } finally {
          controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Groq API failed:", error)
    return new Response(JSON.stringify({ content: "I'm experiencing technical difficulties. Please try again." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }
}
