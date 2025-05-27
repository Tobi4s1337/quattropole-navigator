import express from 'express';
import mongoose from 'mongoose';
import * as chatController from './controllers/chatController.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import ChatHandler from './lib/ChatHandler.js';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// CORS configuration for Express
// Option 1: Allow all origins (simplest for development)
app.use(cors());

// Option 2: More specific CORS configuration (better for production)
// const corsOptions = {
//   origin: 'http://localhost:3001', // Replace with your client's actual origin
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// };
// app.use(cors(corsOptions));

// Determine client origin for CORS - replace with your actual client domain in production
const clientOrigin = process.env.CLIENT_ORIGIN || "https://quattropole.saartech.io"; // Example: https://www.yourdomain.com

const io = new Server(httpServer, {
  cors: {
    origin: clientOrigin, 
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Database Connection (replace with your MongoDB connection string)
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_assistant_chat';
mongoose.connect(dbURI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to emit events to a specific chat room (will be passed to ChatHandler)
const emitChatEvent = (chatId, eventName, data) => {
  io.to(chatId).emit(eventName, data);
};

// Initialize ChatHandler with the emitter function
const chatHandlerInstance = new ChatHandler(emitChatEvent);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined room ${chatId}`);
    // Send confirmation back to the client
    socket.emit('joinedChat', chatId);
  });

  // Listen for client messages and pass to ChatHandler
  socket.on('clientMessage', (data) => {
    chatHandlerInstance.handleClientMessage(socket, data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });
});

// Update chat controller to use ChatHandler for creating chats
const createChatWithHandler = async (req, res) => {
  try {
    const newChat = await chatHandlerInstance.createChat();
    res.status(201).json({ id: newChat._id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating chat', error: error.message });
  }
}

// Routes
app.post('/chat', createChatWithHandler);
app.get('/chat/:id', chatController.getChat);

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 