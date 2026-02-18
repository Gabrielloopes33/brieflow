
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { MOCK_CHAT_HISTORY } from "@/lib/mockData";

export function ChatInterface() {
    const [messages, setMessages] = useState(MOCK_CHAT_HISTORY);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: "user", content: input }];
        setMessages(newMessages);
        setInput("");
        setIsThinking(true);

        // Simulate AI response
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                        content: "Esta é uma resposta simulada. Em um app real, eu processaria sua solicitação dinamicamente."
                }
            ]);
            setIsThinking(false);
        }, 1500);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden rounded-2xl border border-border/40">

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                            }`}>
                            {msg.role === "assistant" ? <Sparkles size={16} /> : <User size={16} />}
                        </div>

                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "assistant"
                                ? "bg-card border border-border text-foreground rounded-tl-none"
                                : "bg-primary text-primary-foreground rounded-tr-none"
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div className="flex items-start gap-3 fade-in">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <Bot size={16} className="text-primary-foreground animate-pulse" />
                        </div>
                        <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        className="w-full bg-secondary/50 border border-border hover:border-primary/50 focus:border-primary rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
                        placeholder="Pergunte qualquer coisa sobre seu conteúdo..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button
                        onClick={sendMessage}
                        className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                        disabled={!input.trim()}
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">Assistente de Conteúdo IA</span>
                </div>
            </div>
        </div>
    );
}
