import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '../services/chatApi';
import { Send, MessageSquare, Trash2, Plus, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const TutorChat = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [accessStatus, setAccessStatus] = useState(null);
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => { checkAccessStatus(); }, []);

  const checkAccessStatus = async () => {
    try {
      setIsLoadingAccess(true);
      const status = await chatApi.getAccessStatus();
      setAccessStatus(status);
      if (status.role !== 'mentor') await loadConversations();
    } catch (error) {
      console.error('Failed to check access status:', error);
    } finally {
      setIsLoadingAccess(false);
    }
  };

  const loadConversations = async () => {
    try {
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const data = await chatApi.getConversation(conversationId);
      setCurrentConversation(data);
      setMessages(data.messages || []);
      setHistoryOpen(false); // auto-close on mobile after selection
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const newConversation = await chatApi.createConversation();
      setConversations([newConversation, ...conversations]);
      setCurrentConversation(newConversation);
      setMessages([]);
      setHistoryOpen(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await chatApi.deleteConversation(conversationId);
      setConversations(conversations.filter(c => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      const newUserMessage = { role: 'USER', content: userMessage, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, newUserMessage]);

      const response = await chatApi.sendMessage(userMessage, currentConversation?.id);

      if (!currentConversation && response.conversation) {
        setCurrentConversation(response.conversation);
        await loadConversations();
      }

      const aiMessage = { role: 'ASSISTANT', content: response.message.content, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, aiMessage]);

      if (accessStatus?.role === 'free') await checkAccessStatus();
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? 'Just now' : date.toLocaleString();
  };

  if (isLoadingAccess) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F9FAFB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2563EB] border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-[#6B7280]">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (accessStatus?.role === 'mentor') return null;

  if (!accessStatus || (!accessStatus.has_access && accessStatus?.role !== 'free')) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F9FAFB]">
        <div className="card max-w-sm text-center">
          <MessageSquare className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-[#111827] mb-1">Access Restricted</h2>
          <p className="text-xs text-[#6B7280]">{accessStatus?.message || 'You do not have access to the tutor chat.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#F9FAFB] relative">
      {/* Chat History Panel — overlay on mobile, side panel on desktop */}
      {historyOpen && (
        <div className="md:hidden fixed inset-0 bg-black/30 z-30" onClick={() => setHistoryOpen(false)} />
      )}
      <div
        className={`
          ${historyOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full'}
          fixed md:relative z-40 md:z-auto
          w-64 h-full bg-white border-r border-[#E5E7EB] flex flex-col
          transition-transform duration-200 ease-in-out
          ${historyOpen ? 'md:translate-x-0 md:w-64' : 'md:w-0 md:overflow-hidden'}
        `}
      >
        <div className="p-3 border-b border-[#E5E7EB] flex items-center gap-2">
          <button
            onClick={createNewConversation}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> New Chat
          </button>
          <button onClick={() => setHistoryOpen(false)} className="p-1.5 text-[#9CA3AF] hover:text-[#111827] rounded-md hover:bg-[#F9FAFB]">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-xs text-[#9CA3AF] text-center py-6">No conversations yet</p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`px-3 py-2.5 border-b border-[#F3F4F6] cursor-pointer hover:bg-[#F9FAFB] text-left ${currentConversation?.id === conversation.id
                    ? 'bg-[#EFF6FF] border-l-[3px] border-l-[#2563EB]'
                    : ''
                  }`}
                onClick={() => loadConversation(conversation.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-[#111827] truncate">{conversation.title}</h3>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">{formatTimestamp(conversation.created_at)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conversation.id); }}
                    className="ml-1.5 p-1 text-[#D1D5DB] hover:text-[#DC2626] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area — takes full remaining width */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="h-12 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="p-1.5 text-[#6B7280] hover:text-[#111827] rounded-md hover:bg-[#F9FAFB]"
              title={historyOpen ? 'Close history' : 'Show history'}
            >
              {historyOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
            <h2 className="text-sm font-semibold text-[#111827]">AI Tutor</h2>
          </div>
          {currentConversation && (
            <span className="text-xs text-[#9CA3AF] truncate ml-2 max-w-[200px]">{currentConversation.title}</span>
          )}
          {accessStatus?.role === 'admin' && (
            <span className="badge badge-error text-[10px]">Admin</span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center mt-12">
              <MessageSquare className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#111827] mb-1">Welcome to AI Tutor</p>
              <p className="text-xs text-[#6B7280]">Ask me anything about Microsoft certifications like AZ-900, SC-900, or AZ-104!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isUser = message.role === 'user' || message.role === 'USER';
              return (
                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] lg:max-w-[70%] px-3.5 py-2.5 rounded-lg text-sm ${isUser
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-white border border-[#E5E7EB] text-[#111827]'
                    }`}>
                    <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                    <div className={`text-[10px] mt-1 ${isUser ? 'text-blue-200' : 'text-[#9CA3AF]'}`}>
                      {formatTimestamp(message.timestamp || message.created_at)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#E5E7EB] text-[#111827] px-3.5 py-2.5 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#2563EB] border-t-transparent" />
                  <span className="text-[#6B7280]">Typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-white border-t border-[#E5E7EB] p-3 shrink-0">
          {accessStatus?.role === 'free' && accessStatus.remaining_messages > 0 && (
            <div className="mb-2 px-3 py-1.5 bg-[#FFFBEB] border border-[#D97706]/20 rounded-md">
              <p className="text-xs text-[#D97706]">
                {accessStatus.remaining_messages} message{accessStatus.remaining_messages === 1 ? '' : 's'} remaining today
              </p>
            </div>
          )}
          {accessStatus?.role === 'free' && !accessStatus.has_access && (
            <div className="mb-2 px-3 py-1.5 bg-[#FEF2F2] border border-[#DC2626]/20 rounded-md">
              <p className="text-xs text-[#DC2626]">
                Daily limit reached.{' '}
                <button className="text-[#2563EB] hover:underline font-medium" onClick={() => window.location.href = '/pricing'}>
                  Upgrade to Premium
                </button>{' '}
                for unlimited access.
              </p>
            </div>
          )}
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about Microsoft certifications..."
              className="input flex-1"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || (accessStatus?.role === 'free' && !accessStatus.has_access)}
              className="btn-primary px-4 flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-sm">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TutorChat;