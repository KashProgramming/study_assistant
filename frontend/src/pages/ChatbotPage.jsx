import { useState, useRef, useEffect } from 'react';
import TabNavigation from '../components/TabNavigation';
import './ChatbotPage.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8000");

function ChatbotPage({ fileInfo, chatState, setChatState }) {
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const messagesEndRef = useRef(null);

    const messages = chatState.messages;
    const setMessages = (value) => setChatState({ ...chatState, messages: value });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        if (!fileInfo?.fileId) {
            setError("Please upload files first.");
            return;
        }

        const userMessage = {
            type: 'user',
            text: inputValue,
            timestamp: new Date().toLocaleTimeString()
        };

        // Append user message to existing messages
        setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, userMessage]
        }));

        setInputValue("");
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileId: fileInfo.fileId,
                    question: userMessage.text
                }),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to get response.");
            }

            const data = await response.json();

            const botMessage = {
                type: 'bot',
                text: data.answer,
                sources: data.sources,
                timestamp: new Date().toLocaleTimeString()
            };

            // Append bot message after user message
            setChatState(prev => ({
                ...prev,
                messages: [...prev.messages, botMessage]
            }));
        } catch (err) {
            setError(err.message || "Unable to get response.");
            const errorMessage = {
                type: 'bot',
                text: "Sorry, I encountered an error processing your question. Please try again.",
                timestamp: new Date().toLocaleTimeString()
            };
            // Append error bot message after user message
            setChatState(prev => ({
                ...prev,
                messages: [...prev.messages, errorMessage]
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!fileInfo) {
        return (
            <div className="page-container">
                <TabNavigation />
                <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    <h2>No Files Uploaded</h2>
                    <p>Please upload your documents first to start chatting.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <TabNavigation />

            <div className="page-content chatbot-content">
                <div className="page-header">
                    <h1>💬 Chatbot</h1>
                    <p>Ask questions about your uploaded documents</p>
                </div>

                <div className="chat-container">
                    <div className="messages-container">
                        {messages.length === 0 && (
                            <div className="welcome-message">
                                <div className="welcome-icon">👋</div>
                                <h3>Hello! I'm your study assistant</h3>
                                <p>Ask me anything about your uploaded documents and I'll help you understand the content better.</p>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div key={index} className={`message ${message.type}`}>
                                <div className="message-avatar">
                                    {message.type === 'user' ? '👤' : '🤖'}
                                </div>
                                <div className="message-content">
                                    <div className="message-text">{message.text}</div>
                                    {message.sources && (
                                        <div className="message-sources">
                                            <strong>Sources:</strong> {message.sources}
                                        </div>
                                    )}
                                    <div className="message-timestamp">{message.timestamp}</div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="message bot">
                                <div className="message-avatar">🤖</div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="input-container">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your question here..."
                            rows="2"
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatbotPage;
