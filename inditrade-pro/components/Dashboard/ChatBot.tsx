import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Minimize2, X } from 'lucide-react';
import { createChatSession } from '../../services/geminiService';
import { ChatMessage } from '../../types';
import { GenerateContentResponse } from "@google/genai";
import { auth, db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface ChatBotProps {
    theme?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ theme = 'slate' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatSessionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isLight = theme === 'light';
    const bgMain = isLight ? 'bg-white' : `bg-${theme}-900`;
    const bgHeader = isLight ? 'bg-slate-100' : `bg-${theme}-800`;
    const bgInput = isLight ? 'bg-slate-50' : `bg-${theme}-950`;
    const borderCol = isLight ? 'border-slate-200' : `border-${theme}-700`;
    const textMain = isLight ? 'text-slate-900' : 'text-white';
    const textMuted = isLight ? 'text-slate-500' : `text-${theme}-400`;
    const accentCol = 'blue-600';
    const accentHover = 'blue-500';

    // ... (existing useEffects)
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, 'users', user.uid, 'chatHistory'),
            orderBy('timestamp', 'asc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const history = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    role: data.role,
                    text: data.content,
                    timestamp: data.timestamp?.toDate() || new Date()
                } as ChatMessage;
            });
            
            if (history.length === 0) {
                setMessages([{ role: 'model', text: 'Hello! I am your IndiTrade AI assistant. How can I help you with your trading today?', timestamp: new Date() }]);
            } else {
                setMessages(history);
            }
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/chatHistory`);
        });

        return () => unsubscribe();
    }, []);

    // Initialize chat session with history
    useEffect(() => {
        if (isOpen && !chatSessionRef.current) {
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));
            chatSessionRef.current = createChatSession(history);
        }
    }, [isOpen, messages]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const user = auth.currentUser;
        if (!user) return;

        const userMsgText = input;
        setInput('');
        setIsTyping(true);

        try {
            // Save user message to Firestore
            await addDoc(collection(db, 'users', user.uid, 'chatHistory'), {
                userId: user.uid,
                role: 'user',
                content: userMsgText,
                timestamp: serverTimestamp()
            });

            if (!chatSessionRef.current) {
                chatSessionRef.current = createChatSession();
            }

            if (!chatSessionRef.current) throw new Error("AI Session failed");

            const result = await chatSessionRef.current.sendMessageStream({ message: userMsgText });
            
            let fullText = '';
            for await (const chunk of result) {
                const c = chunk as GenerateContentResponse;
                fullText += c.text || '';
            }

            // Save model response to Firestore
            await addDoc(collection(db, 'users', user.uid, 'chatHistory'), {
                userId: user.uid,
                role: 'model',
                content: fullText,
                timestamp: serverTimestamp()
            });

        } catch (error) {
            console.error("Chat Error", error);
            handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/chatHistory`);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className={`fixed bottom-6 right-6 w-14 h-14 bg-${accentCol} hover:bg-${accentHover} rounded-full flex items-center justify-center shadow-lg shadow-blue-900/40 transition-all hover:scale-110 z-50 text-white group`}
                >
                    <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className={`fixed bottom-6 right-6 w-80 md:w-96 transition-all duration-300 ease-in-out ${isMinimized ? 'h-14' : 'h-[500px]'} ${bgMain} border ${borderCol} rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-10`}>
                    {/* Header */}
                    <div className={`${bgHeader} p-4 flex justify-between items-center border-b ${borderCol} cursor-pointer`} onClick={() => isMinimized && setIsMinimized(false)}>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                            </div>
                            <h3 className={`font-bold ${textMain} text-sm tracking-tight`}>IndiTrade AI <span className={`text-[10px] ${textMuted} font-normal ml-1`}>v2.0</span></h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} 
                                className={`${textMuted} hover:${textMain} p-1 rounded transition-colors`}
                                title={isMinimized ? "Expand" : "Minimize"}
                            >
                                <Minimize2 size={16} className={isMinimized ? 'rotate-180' : ''} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
                                className={`${textMuted} hover:text-red-500 p-1 rounded transition-colors`}
                                title="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${isLight ? 'bg-slate-50/50' : `bg-${theme}-950/30`}`}>
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            msg.role === 'user' 
                                            ? `bg-${accentCol} text-white rounded-tr-none` 
                                            : `${isLight ? 'bg-white' : `bg-${theme}-800`} ${textMain} rounded-tl-none border ${borderCol}`
                                        }`}>
                                            <div className="whitespace-pre-wrap">{msg.text}</div>
                                            <div className={`text-[9px] mt-1.5 font-mono opacity-60 ${msg.role === 'user' ? 'text-blue-100' : textMuted}`}>
                                                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start animate-in fade-in duration-300">
                                        <div className={`${isLight ? 'bg-white' : `bg-${theme}-800`} border ${borderCol} p-3 rounded-2xl rounded-tl-none flex gap-1.5`}>
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className={`p-3 ${bgHeader} border-t ${borderCol}`}>
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Ask about markets, trends, or orders..."
                                        className={`flex-1 ${bgInput} border ${borderCol} rounded-xl px-4 py-2.5 text-sm ${textMain} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-${isLight ? 'slate-400' : `${theme}-600`}`}
                                    />
                                    <button 
                                        onClick={handleSend}
                                        disabled={isTyping || !input.trim()}
                                        className={`p-2.5 bg-${accentCol} hover:bg-${accentHover} text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95`}
                                    >
                                        {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                    </button>
                                </div>
                                <div className={`text-[9px] ${textMuted} mt-2 text-center font-medium uppercase tracking-wider opacity-50`}>
                                    Powered by Gemini 1.5 Pro
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default ChatBot;
