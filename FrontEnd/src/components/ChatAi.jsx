import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Sparkles, Loader2, AlertCircle } from 'lucide-react';

function ChatAi({problem}) {
    const [messages, setMessages] = useState([
        { 
            role: 'model', 
            parts:[{text: "👋 Hi! I'm your AI coding assistant. I'm here to help you understand and solve this problem. Feel free to ask me anything about the problem, approach, or concepts!"}]
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, formState: {errors} } = useForm();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        if (!data.message.trim()) return;

        const userMessage = data.message.trim();
        setMessages(prev => [...prev, { role: 'user', parts:[{text: userMessage}] }]);
        reset();
        setIsLoading(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: messages,
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode
            });

            setMessages(prev => [...prev, { 
                role: 'model', 
                parts:[{text: response.data.message}] 
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts:[{text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment."}]
            }]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const formatMessage = (text) => {
        // Basic markdown-like formatting
        return text
            .split('\n')
            .map((line, i) => {
                // Code blocks
                if (line.startsWith('```')) {
                    return null; // Handle separately
                }
                // Bold
                line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
                // Inline code
                line = line.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-slate-700/50 rounded text-sm font-mono text-cyan-400">$1</code>');
                
                return <p key={i} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: line }} />;
            });
    };

    return (
        <div className="flex flex-col h-full max-h-[80vh] min-h-[500px] bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <Bot className="text-white" size={20} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                            AI Assistant
                            <Sparkles size={14} className="text-yellow-400" />
                        </h3>
                        <p className="text-xs text-slate-400">Always here to help</p>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex gap-3 animate-fade-in ${
                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                    >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.role === "user" 
                                ? "bg-gradient-to-br from-cyan-500 to-blue-600" 
                                : "bg-gradient-to-br from-blue-500 to-purple-600"
                        }`}>
                            {msg.role === "user" ? (
                                <User size={16} className="text-white" />
                            ) : (
                                <Bot size={16} className="text-white" />
                            )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`flex-1 max-w-[85%] ${
                            msg.role === "user" ? "flex justify-end" : ""
                        }`}>
                            <div className={`rounded-2xl px-4 py-3 ${
                                msg.role === "user"
                                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm"
                                    : "bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-tl-sm"
                            }`}>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {formatMessage(msg.parts[0].text)}
                                </div>
                            </div>
                            <div className={`text-xs text-slate-500 mt-1 px-2 ${
                                msg.role === "user" ? "text-right" : "text-left"
                            }`}>
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex gap-3 animate-fade-in">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Loader2 size={16} className="text-blue-400 animate-spin" />
                                <span className="text-sm text-slate-400">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="p-4 border-t border-slate-700/50 bg-slate-900/30"
            >
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <div className="relative">
                            <textarea
                                ref={inputRef}
                                placeholder="Ask me anything about this problem..."
                                rows="1"
                                className={`w-full px-4 py-3 bg-slate-800/50 border ${
                                    errors.message ? 'border-red-500' : 'border-slate-700/50'
                                } rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none min-h-[48px] max-h-32`}
                                {...register("message", { 
                                    required: true, 
                                    minLength: 1,
                                    validate: value => value.trim().length > 0 
                                })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(onSubmit)();
                                    }
                                }}
                            />
                            {errors.message && (
                                <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-400 text-xs">
                                    <AlertCircle size={12} />
                                    <span>Please enter a message</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading || errors.message}
                        className={`p-3 rounded-xl font-medium transition-all flex items-center justify-center ${
                            isLoading || errors.message
                                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25'
                        }`}
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-xs">Shift + Enter</kbd> for new line
                </p>
            </form>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(30, 41, 59, 0.3);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(71, 85, 105, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(100, 116, 139, 0.7);
                }
            `}</style>
        </div>
    );
}

export default ChatAi;