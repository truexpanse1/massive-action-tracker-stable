
import React, { useState, useRef, useEffect } from 'react';
import { generateResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your AI Coach. How can I help you improve your productivity today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateResponse(input, isThinkingMode);
      const modelMessage: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Gemini API error:', error);
      const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-brand-light-border dark:border-brand-gray">
          <h2 className="text-xl font-bold text-brand-light-text dark:text-white">AI Coach</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">&times;</button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-brand-blue text-white' : 'bg-gray-200 dark:bg-brand-gray text-brand-light-text dark:text-gray-200'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-md p-3 rounded-lg bg-gray-200 dark:bg-brand-gray text-brand-light-text dark:text-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Thinking Mode Toggle */}
        <div className="p-4 border-t border-brand-light-border dark:border-brand-gray flex items-center justify-end space-x-3 text-sm">
            <label htmlFor="thinking-mode" className="text-gray-500 dark:text-gray-400">Complex Query?</label>
             <div className="flex items-center cursor-pointer">
                <span className="mr-2 text-sm font-medium text-gray-600 dark:text-gray-300">Thinking Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="thinking-mode" checked={isThinkingMode} onChange={() => setIsThinkingMode(!isThinkingMode)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 dark:bg-brand-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
                </label>
            </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-brand-light-border dark:border-brand-gray flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your AI coach..."
            className="flex-1 bg-brand-light-bg dark:bg-brand-ink border border-brand-light-border dark:border-brand-gray rounded-full px-4 py-2 text-brand-light-text dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-brand-blue text-white rounded-full p-2 hover:bg-blue-600 disabled:bg-brand-gray disabled:cursor-not-allowed"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;