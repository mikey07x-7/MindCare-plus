// frontend/src/pages/ChatbotPage.tsx
import React, { useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { chatGpt } from "../api";

type Props = { darkMode: boolean; chatMessages: { role: string; content: string }[]; setChatMessages: any };

export default function ChatbotPage({ darkMode, chatMessages, setChatMessages }: Props) {
  const [chatInput, setChatInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages, loading]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || loading) return;
    const msg = { role: "user", content: chatInput };
    setChatMessages((p: any) => [...p, msg]);
    const copy = chatInput;
    setChatInput("");
    setLoading(true);
    try {
      const res = await chatGpt(copy, {});
      let reply = "";
      if (typeof res.data === "string") reply = res.data;
      else if (res.data?.reply) reply = res.data.reply;
      else reply = JSON.stringify(res.data);
      setChatMessages((p: any) => [...p, { role: "assistant", content: reply }]);
    } catch (e) {
      setChatMessages((p: any) => [...p, { role: "assistant", content: "I'm having trouble connecting to the server right now. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-gray-900" : "bg-white"}`}>
      <div className="max-w-4xl mx-auto p-6 flex flex-col h-[calc(100vh-120px)]">
        <h1 className={`text-3xl mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>24/7 Groq Chatbot</h1>
        <div className={`flex-1 rounded-2xl p-6 ${darkMode ? "bg-gray-800" : "bg-white"} flex flex-col overflow-hidden`}>
          <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 space-y-4">
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] p-3 rounded-2xl whitespace-pre-wrap ${m.role === "user" ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white" : (darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-900")}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className={`max-w-[75%] p-3 rounded-2xl ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-900"}`}><Loader2 className="animate-spin" /> Typing...</div></div>}
          </div>

          <div className="mt-4 flex gap-2">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} placeholder="Type your message..." className="flex-1 p-3 rounded-xl outline-none" disabled={loading} />
            <button onClick={handleSendMessage} disabled={loading} className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-3 rounded-xl">
              {loading ? <Loader2 className="animate-spin" /> : <Send />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
