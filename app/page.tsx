'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `chat_session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);

  const startNewConversation = () => {
    setMessages([]);
    setSessionId(`chat_session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const assistantMessage = await response.json();
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3 flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            AIコミュ TeamC
          </h1>
          <button
            onClick={startNewConversation}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>新しい会話</span>
          </button>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">AI</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">AIチャットへようこそ</h2>
                  <p className="text-gray-500">何でもお気軽にお聞きください</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-3 max-w-2xl ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* アバター */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        m.role === 'user' 
                          ? 'bg-gradient-to-r from-green-400 to-blue-500' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-600'
                      }`}>
                        <span className="text-white text-xs font-bold">
                          {m.role === 'user' ? 'U' : 'AI'}
                        </span>
                      </div>
                      
                      {/* メッセージバブル */}
                      <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' 
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                      }`}>
                        {m.role === 'user' ? (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                        ) : (
                          <div className="text-sm leading-relaxed markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3 max-w-2xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <div className="bg-white text-gray-800 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-sm text-gray-500">回答を生成中...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 入力エリア */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <input
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  value={input}
                  placeholder="メッセージを入力してください..."
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}