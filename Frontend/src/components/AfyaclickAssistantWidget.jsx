/**
 * AfyaclickAssistantWidget.jsx - AI Guided Chatbot Widget
 *
 * Floating chatbot widget for Afyaclick users.
 * Provides role-aware guidance and doesn't diagnose.
 *
 * Features:
 * - Fixed position floating button
 * - Multi-turn conversation
 * - Suggested actions (navigation buttons)
 * - Medical disclaimer
 * - Loading states
 * - Responsive design
 * - Accessibility (ARIA labels, keyboard support)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, MessageSquare, X, Minimize2, Maximize2, AlertCircle, ArrowRight } from 'lucide-react';

const AfyaclickAssistantWidget = ({ userRole = 'patient', userId = null }) => {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: 'Hello! 👋 I\'m the Afyaclick Assistant. I can help with system navigation, appointments, and FAQ. How can I assist you?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId] = useState(`conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Focus input when widget opens
   */
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  /**
   * Get auth token
   */
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token') || '';
  }, []);

  /**
   * Send message to chatbot
   */
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to display
    const userMsg = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
          ...(userId && { 'X-User-ID': userId }),
          'X-User-Role': userRole
        },
        body: JSON.stringify({
          user_role: userRole,
          user_id: userId,
          message: inputMessage,
          conversation_id: conversationId
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }
      
      // Add assistant response
      const assistantMsg = {
        type: 'assistant',
        content: data.reply,
        actions: data.suggested_actions || [],
        disclaimer: data.disclaimer,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setError(err.message);
      
      // Add error message
      const errorMsg = {
        type: 'error',
        content: `Error: ${err.message}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [inputMessage, userRole, userId, conversationId, getAuthToken]);

  /**
   * Handle suggested action click
   */
  const handleActionClick = useCallback((action) => {
    if (action.action_type === 'navigate') {
      window.location.href = action.target;
    } else if (action.action_type === 'link') {
      window.open(action.target, '_blank');
    }
  }, []);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback((e) => {
    // Ctrl/Cmd + Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSendMessage(e);
    }
    // Escape to close
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, [handleSendMessage]);

  // ===== RENDER =====

  const messageCount = messages.length;
  const userMessageCount = messages.filter(m => m.type === 'user').length;

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-40 flex items-center justify-center group"
        aria-label={isOpen ? 'Close Afyaclick Assistant' : 'Open Afyaclick Assistant'}
        aria-expanded={isOpen}
      >
        <div className="relative">
          <MessageSquare size={28} />
          {userMessageCount > 0 && !isOpen && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {userMessageCount}
            </span>
          )}
        </div>
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Afyaclick Assistant
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 transition-all ${
            isMinimized ? 'h-16' : 'h-[600px]'
          }`}
          role="region"
          aria-label="Chat assistant"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg shadow-sm">
            <div>
              <h3 className="font-bold text-lg">🤖 Afyaclick Assistant</h3>
              <p className="text-xs text-blue-100">Always here to help</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-blue-700 p-2 rounded transition-colors"
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-700 p-2 rounded transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
                    <p>Hi! Ask me anything about Afyaclick.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <ChatMessage
                      key={idx}
                      message={msg}
                      onActionClick={handleActionClick}
                    />
                  ))
                )}

                {/* Loading Indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white px-4 py-2 rounded-lg text-gray-600 text-sm shadow-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="border-t border-gray-200 p-3 bg-white rounded-b-lg"
              >
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a question..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={loading}
                    aria-label="Message input"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Press <kbd className="bg-gray-100 px-1 rounded">Ctrl+Enter</kbd> to send
                </p>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

/**
 * Helper Component: Individual Chat Message
 */
const ChatMessage = ({ message, onActionClick }) => {
  const { type, content, actions, disclaimer, timestamp } = message;

  if (type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-100 text-blue-900 px-3 py-2 rounded-lg max-w-xs break-words shadow-sm">
          {content}
        </div>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="flex justify-start">
        <div className="bg-red-100 text-red-900 px-3 py-2 rounded-lg max-w-xs border border-red-300 flex gap-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span className="text-sm">{content}</span>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="space-y-2">
      {/* Main Reply */}
      <div className="bg-white text-gray-900 px-3 py-2 rounded-lg max-w-xs break-words border border-gray-200 shadow-sm">
        <p className="text-sm leading-relaxed white-space-pre-wrap">{content}</p>
      </div>

      {/* Disclaimer (if medical question) */}
      {disclaimer && disclaimer.includes('⚠') && (
        <div className="bg-yellow-50 border-l-2 border-yellow-400 pl-2 pr-3 py-2 rounded text-xs text-yellow-800 italic">
          {disclaimer}
        </div>
      )}

      {/* Suggested Actions */}
      {actions && actions.length > 0 && (
        <div className="space-y-1 pt-1">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onActionClick(action)}
              className="w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded border border-blue-200 flex items-center gap-2 transition-colors group"
            >
              <span>{action.label}</span>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AfyaclickAssistantWidget;
