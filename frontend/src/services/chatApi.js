import api from './api';

// Chat API service functions
export const chatApi = {
  // Send a message to the AI tutor
  sendMessage: async (message, conversationId = null) => {
    try {
      const response = await api.post('/chat/send', {
        message,
        conversation_id: conversationId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get all conversations for the current user
  getConversations: async () => {
    try {
      const response = await api.get('/chat/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get a specific conversation with all messages
  getConversation: async (conversationId) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  // Create a new conversation
  createConversation: async (title = 'New Conversation') => {
    try {
      const response = await api.post('/chat/conversations', null, {
        params: { title }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Delete a conversation
  deleteConversation: async (conversationId) => {
    try {
      const response = await api.delete(`/chat/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  // Get user's chat access status
  getAccessStatus: async () => {
    try {
      const response = await api.get('/chat/access-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching access status:', error);
      throw error;
    }
  }
};

export default chatApi;