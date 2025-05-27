import Chat from '../models/chat.js';

// Create a new chat
export const createChat = async (req, res) => {
  try {
    const newChat = new Chat();
    await newChat.save();
    res.status(201).json({ id: newChat._id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating chat', error: error.message });
  }
};

// Get a chat by ID
export const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat', error: error.message });
  }
}; 