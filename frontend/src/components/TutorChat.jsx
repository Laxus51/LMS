import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '../services/chatApi';
import { Send, MessageSquare, Trash2, Plus } from 'lucide-react';

const TutorChat = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accessStatus, setAccessStatus] = useState(null);
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check access status and load conversations on component mount
  useEffect(() => {
    checkAccessStatus();
  }, []);

  const checkAccessStatus = async () => {
    try {
      setIsLoadingAccess(true);
      const status = await chatApi.getAccessStatus();
      setAccessStatus(status);
      
      // Only load conversations if user has access
      if (status.has_access) {
        await loadConversations();
      }
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
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await chatApi.deleteConversation(conversationId);
      setConversations(conversations.filter(conv => conv.id !== conversationId));
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
      // Add user message to UI immediately
      const newUserMessage = {
        role: 'USER',
        content: userMessage,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newUserMessage]);

      // Send message to API
      const response = await chatApi.sendMessage(userMessage, currentConversation?.id);
      
      // Update current conversation if it was created
      if (!currentConversation && response.conversation) {
        setCurrentConversation(response.conversation);
        await loadConversations(); // Refresh conversations list
      }

      // Add AI response to messages
      const aiMessage = {
        role: 'ASSISTANT',
        content: response.message.content,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Refresh access status after sending message (for free users)
      if (accessStatus?.role === 'free') {
        await checkAccessStatus();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the user message if sending failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Just now';
    }
    
    return date.toLocaleString();
  };

  // Loading state
  if (isLoadingAccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Mentor role restriction - hide chat completely
  if (accessStatus?.role === 'mentor') {
    return null;
  }

  // No access (unknown role or error)
  if (!accessStatus || !accessStatus.has_access) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <MessageSquare className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">{accessStatus?.message || 'You do not have access to the tutor chat.'}</p>
          {accessStatus?.role === 'free' && (
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Upgrade to Premium
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin indicator */}
      {accessStatus?.role === 'admin' && (
        <div className="absolute top-4 right-4 z-10 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
          Admin View
        </div>
      )}
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewConversation}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                currentConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
              onClick={() => loadConversation(conversation.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {conversation.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(conversation.created_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                  className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">AI Tutor Chat</h1>
          </div>
          {currentConversation && (
            <span className="text-sm text-gray-500">
              {currentConversation.title}
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Welcome to AI Tutor Chat</p>
              <p className="text-sm mt-2">Ask me anything about Microsoft certifications like AZ-900, SC-900, or AZ-104!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' || message.role === 'USER' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-3xl px-4 py-2 rounded-lg ${
                    message.role === 'user' || message.role === 'USER'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user' || message.role === 'USER' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTimestamp(message.timestamp || message.created_at)}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 text-gray-900 max-w-3xl px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>AI Tutor is typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          {/* Free user status indicator */}
          {accessStatus?.role === 'free' && accessStatus.remaining_messages >= 0 && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {accessStatus.remaining_messages > 0 
                  ? `${accessStatus.remaining_messages} message${accessStatus.remaining_messages === 1 ? '' : 's'} remaining today`
                  : 'Daily limit reached. Upgrade to Premium for unlimited access.'
                }
              </p>
            </div>
          )}
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about Microsoft certifications..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TutorChat;