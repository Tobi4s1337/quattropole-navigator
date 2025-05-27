import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  fromBot: {
    type: Boolean,
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Allows for any data type
    required: true,
  },
  type: {
    type: String,
    required: false, // Or true if every message must have a type
    default: 'text', // Default to text if not provided
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema({
  messages: [messageSchema],
  mapDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat; 