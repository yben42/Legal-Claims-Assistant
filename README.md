# Legal Claims Chatbot

## 🇬🇧 AI-Powered UK Personal Injury Claims Assistant

This project is a Next.js web application that provides an AI-powered chatbot to assist users with preliminary assessments of potential personal injury claims in the UK. It's designed to gather initial information, offer a basic evaluation based on UK legal principles, and guide users towards a consultation with a legal professional.

The chatbot leverages the Groq API for fast LLM responses and provides a streaming interface for a smooth user experience.

## ✨ Features

*   **Interactive Chat Interface**: Clean and user-friendly chat UI for users to describe their situation.
*   **AI-Powered Assessment**: Utilizes a Large Language Model (LLM) via Groq to understand user input and provide relevant information.
*   **Streaming Responses**: AI responses are streamed to the user for a real-time feel.
*   **System Prompt Engineering**: The LLM is guided by a detailed system prompt to act as a skeptical, empathetic, and informative legal assistant.
*   **Focus on UK Personal Injury Law**: The system prompt includes key principles of UK personal injury law (negligence, limitation periods, etc.).
*   **Disclaimer**: Clearly states that the AI is not a lawyer and its responses do not constitute legal advice.
*   **Fallback Mechanism**: Basic rule-based fallback responses if the LLM API encounters issues.
*   **Responsive Design**: Built with Tailwind CSS for responsiveness across devices.

## 🛠️ Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (implicitly, as v0 uses it)
*   **AI Integration**:
    *   [Groq API](https://groq.com/) for LLM access (using `llama3-8b-8192` model)
    *   Vercel AI SDK (`@ai-sdk/react` for `useChat` hook - though current frontend is custom)
*   **Deployment**: [Vercel](https://vercel.com/)

## 📂 Project Structure

**Key Directory Explanations:**

*   **`app/`**: The heart of the Next.js application using the App Router.
    *   **`app/api/`**: Contains backend API route handlers. `app/api/chat/route.ts` is crucial for the chatbot's functionality.
    *   **`app/page.tsx`**: The entry point for the main chat interface visible to users.
*   **`components/`**: Houses reusable React components. `components/ui/` would typically contain components from shadcn/ui.
*   **`lib/`**: For helper functions, shared logic, and potentially data sources like `knowledge-base.ts`.
*   **`public/`**: Stores static files accessible directly via URL (e.g., images).
*   **`scripts/`**: Contains scripts for various tasks, like database schema setup.

This structure should give a clear overview of where to find different parts of the application.
## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18.x or later recommended)
*   [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)
*   A Groq API Key (see [GroqCloud Console](https://console.groq.com/keys))

### Installation

1.  **Clone the repository (example):**
    ```bash
    git clone https://your-repository-url/legal-claims-chatbot.git
    cd legal-claims-chatbot
2. **Install dependencies:** 
    npm install
    or
    yarn install
    or
    pnpm install
3. **Set up environment variables:**
Create a `.env.local` file in the root of your project and add your Groq API key:

```plaintext
GROQ_API_KEY=your_groq_api_key_here
```
*Note: The API route `app/api/chat/route.ts` currently has the Groq API key hardcoded. For production, it's crucial to use the environment variable `process.env.GROQ_API_KEY` as intended*
