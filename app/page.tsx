"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Scale, Zap } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")

      if (contentType?.includes("text/plain")) {
        // Handle streaming response
        const reader = response.body?.getReader()
        if (!reader) throw new Error("No response body")

        const assistantMessage: Message = {
          role: "assistant",
          content: "",
        }

        setMessages((prev) => [...prev, assistantMessage])

        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim()
              if (data === "[DONE]") continue
              if (!data) continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  setMessages((prev) =>
                    prev.map((m, i) =>
                      i === prev.length - 1 && m.role === "assistant"
                        ? { ...m, content: m.content + parsed.content }
                        : m,
                    ),
                  )
                }
              } catch (parseError) {
                // Ignore parsing errors for partial chunks
              }
            }
          }
        }
      } else {
        // Handle JSON response (fallback)
        const data = await response.json()
        const assistantMessage: Message = {
          role: "assistant",
          content: data.content || "I apologize, but I couldn't process your request.",
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (err) {
      console.error("Chat error:", err)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble responding right now. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container flex items-center h-16 px-4 mx-auto">
          <Scale className="h-6 w-6 mr-2 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Legal Claims Assistant</h1>
          <div className="ml-2 flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
            <Zap className="h-3 w-3" />
            AI Powered by Groq
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container px-4 mx-auto max-w-4xl">
          {messages.length === 0 && (
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-600" />
                  AI-Powered Legal Claims Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  I'm an AI assistant trained in UK personal injury law, powered by Groq's lightning-fast AI. I can help
                  assess your potential claim and guide you toward the right legal support.
                </p>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">I can help with:</h3>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Road traffic accidents</li>
                    <li>• Slips, trips and falls</li>
                    <li>• Workplace injuries</li>
                    <li>• Medical negligence</li>
                    <li>• Other personal injury claims</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Your AI Consultation</CardTitle>
            </CardHeader>
            <CardContent className="h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Scale className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Describe your accident or injury to get started</p>
                    <p className="text-sm mt-2 text-gray-400">
                      The AI will analyze your case and provide personalized guidance
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, i) => (
                    <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          {message.role === "user" ? (
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                              You
                            </AvatarFallback>
                          ) : (
                            <AvatarFallback className="bg-green-100 text-green-600">
                              <Zap className="h-4 w-4" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div
                          className={`rounded-lg px-4 py-3 ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-900 border border-green-200"
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[85%]">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-green-100 text-green-600">
                            <Zap className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white rounded-lg px-4 py-3 border border-green-200">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>

            <CardFooter>
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <Input
                  placeholder="Describe your accident or injury..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="py-4 border-t bg-white">
        <div className="container px-4 mx-auto text-center text-sm text-gray-500">
          <p>This AI assistant is for informational purposes only and does not constitute legal advice.</p>
          <p>© {new Date().getFullYear()} UK Personal Injury Law Firm. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
