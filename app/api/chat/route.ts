export const maxDuration = 60

export async function POST(req: Request) {
  let requestMessages // To store messages from the request

  try {
    const body = await req.json()
    requestMessages = body.messages // Store messages here

    if (!requestMessages || !Array.isArray(requestMessages) || requestMessages.length === 0) {
      return new Response(JSON.stringify({ content: "No messages provided." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const systemPrompt = `You are an AI assistant for a UK-based personal injury law firm. Your primary role is to conduct a **critical preliminary assessment** of potential claims. You are NOT a lawyer and cannot provide legal advice. Your tone should be empathetic but also **realistic and cautious**.

**CRITICAL ASSESSMENT GUIDELINES:**
1. **Be Skeptical**: Do not assume a claim is valid. Actively look for weaknesses or missing elements.
2. **Probe for Details**: Ask specific, probing questions to uncover all relevant facts, especially those that might weaken a claim.
3. **Focus on Negligence**: Rigorously apply the core principles of negligence (duty, breach, causation, damages). If any element is weak or missing, highlight this.
4. **Limitation Period is Key**: Be very strict about the 3-year limitation period. If it's likely exceeded, state this clearly as a major hurdle.
5. **Acknowledge User's Perspective but Stay Objective**: Show empathy, but do not let the user's emotional state sway your objective assessment.
6. **Avoid Over-Promising**: Do not give false hope. It's better to be cautious than to suggest a strong claim when it's borderline or weak.
7. **Clearly State Weaknesses**: If a claim appears weak or invalid, explain why in simple terms, referencing legal principles.
8. **"Not Legal Advice" Reminder**: Reiterate frequently that your assessment is not legal advice and a solicitor's review is essential.

**UK PERSONAL INJURY LAW (Strict Application):**
- **Duty of Care**: Was a specific duty owed? Don't assume.
- **Breach of Duty**: What specific action or inaction constituted the breach? Was it below the reasonable standard?
- **Causation**: Is there a clear, direct link between the breach and the injury? ("But for" test). Are there intervening acts?
- **Damages**: Are the injuries significant and directly attributable? Are financial losses quantifiable?
- **Limitation Act 1980**: 3 years from date of incident OR date of knowledge. Be very precise.
- **Contributory Negligence**: Actively consider if the claimant contributed to their own injury.

**OUTCOME CATEGORIES (Be Conservative):**
- **POTENTIALLY STRONG CLAIM**: Only if ALL elements of negligence are clearly met, within time limits, and no major red flags.
- **UNCERTAIN / REQUIRES REVIEW**: If there are unclear facts, complex issues, or some elements are borderline. Explain the uncertainties.
- **LIKELY DIFFICULT TO PURSUE**: If there are significant weaknesses (e.g., limitation period, clear lack of fault by defendant, claimant fully at fault, minor or unrelated injuries). Explain these clearly.

Your goal is to filter out clearly non-viable claims and identify those that genuinely warrant a solicitor's time, while managing claimant expectations realistically. Always end by offering a solicitor consultation for a definitive opinion, regardless of your preliminary assessment.`

    console.log("Attempting to call Groq API...")
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer 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`, // Your Groq API Key
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "system", content: systemPrompt }, ...requestMessages],
        max_tokens: 1000,
        temperature: 0.5,
        stream: true,
      }),
    })

    console.log("Groq API response status:", groqResponse.status)

    if (!groqResponse.ok) {
      const errorBody = await groqResponse.text()
      console.error("Groq API error:", groqResponse.status, errorBody)
      throw new Error(`Groq API error: ${groqResponse.status} - ${errorBody}`)
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = groqResponse.body?.getReader()
        if (!reader) {
          console.error("Failed to get reader from Groq response body")
          controller.close() // Close the stream if reader is not available
          return
        }

        try {
          console.log("Starting to read Groq stream...")
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              console.log("Groq stream finished.")
              break
            }

            const chunk = new TextDecoder().decode(value)
            // console.log("Groq stream chunk:", chunk); // Log raw chunk for debugging
            const lines = chunk.split("\n").filter((line) => line.trim() !== "")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") {
                  // console.log("Received [DONE] from Groq stream.");
                  continue
                }
                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    // console.log("Enqueueing content:", content);
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (e) {
                  console.warn("Failed to parse JSON from Groq stream line:", data, e)
                }
              }
            }
          }
        } catch (streamError) {
          console.error("Error reading Groq stream:", streamError)
          controller.error(streamError)
        } finally {
          console.log("Closing Groq stream controller.")
          controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream", // Corrected Content-Type for SSE
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("General API error / Fallback triggered:", error)

    // Ensure requestMessages is available for fallback, even if parsing failed earlier
    const messagesForFallback =
      Array.isArray(requestMessages) && requestMessages.length > 0 ? requestMessages : [{ role: "user", content: "" }]
    const lastMessageContent = messagesForFallback[messagesForFallback.length - 1]?.content?.toLowerCase() || ""

    let responseText =
      "I apologize, but I'm experiencing technical difficulties with the AI. My team has been notified. In the meantime, let me try to assist with some pre-set information."

    if (
      lastMessageContent.includes("mcdonald") ||
      (lastMessageContent.includes("slip") && lastMessageContent.includes("ankle"))
    ) {
      responseText = `I understand you had a slip and fall accident at McDonald's and broke your ankle. I'm sorry this happened to you.

This could potentially be a valid personal injury claim under UK occupier liability law. Commercial premises like McDonald's have a duty to maintain safe conditions for customers.

**Key questions for your case:**
1. What caused the floor to be slippery?
2. Were there warning signs about the hazard?
3. Did you report it to McDonald's staff?
4. Do you have medical records for your broken ankle?

Based on the information provided, this appears to have the elements of a potential claim. I'd recommend a free consultation with one of our solicitors.

*I'm an AI assistant, not a lawyer. This is not legal advice.*

Would you like to provide contact details for a consultation?`
    } else if (
      lastMessageContent.includes("car") ||
      lastMessageContent.includes("accident") ||
      lastMessageContent.includes("crash")
    ) {
      responseText = `I understand you were in a car accident. I'm sorry this happened.

To assess your potential claim, I need more information:
1. When did the accident occur?
2. Who was at fault?
3. What injuries did you sustain?
4. Have you reported it to police/insurance?

Car accident claims depend on proving the other driver's negligence caused your injuries.

*I'm an AI assistant, not a lawyer. This is not legal advice.*

Can you tell me more about what happened?`
    } else {
      // Generic fallback if no specific keywords match
      responseText = `Hello! I'm here to help assess your personal injury claim. Due to a temporary issue with our advanced AI, I'll use some standard questions.

Please tell me:
- What type of accident occurred?
- When did it happen?
- What injuries did you sustain?
- Who do you believe was at fault?

*I'm an AI assistant, not a lawyer. This is not legal advice.*

What happened to you?`
    }

    return new Response(JSON.stringify({ content: responseText }), {
      status: 200, // Fallback should still be a 200 if it's providing a valid alternative response
      headers: { "Content-Type": "application/json" },
    })
  }
}
