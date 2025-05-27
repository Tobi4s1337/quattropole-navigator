import Chat from '../models/chat.js';
import { getPlaceSuggestionsAndParking } from './helpers/handlePrompt.js';

class ChatHandler {
  constructor(emitEventCallback) {
    if (typeof emitEventCallback !== 'function') {
      throw new Error('ChatHandler constructor requires a valid emitEventCallback function.');
    }
    this.emitEvent = emitEventCallback;
  }

  /**
   * Creates a new chat.
   * @returns {Promise<Chat>} The newly created chat object.
   */
  async createChat() {
    const newChat = new Chat();
    await newChat.save();
    console.log(`Chat created with ID: ${newChat._id}`);
    return newChat;
  }

  /**
   * Adds a message to a specific chat.
   * @param {string} chatId - The ID of the chat.
   * @param {any} messageContent - The content of the message.
   * @param {boolean} fromBot - Whether the message is from the bot.
   * @param {string} type - The type of the message (e.g., 'text', 'Places').
   * @param {string} [clientId] - Optional client ID for tracking optimistic updates.
   * @returns {Promise<object>} The message that was added.
   */
  async addMessage(chatId, messageContent, fromBot, type = 'text', clientId) {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.error(`Chat not found with ID: ${chatId} when trying to add message.`);
      throw new Error('Chat not found');
    }

    const message = {
      content: messageContent,
      fromBot: fromBot,
      type: type,
      // Include clientId if provided to help with deduplication
      ...(clientId && { clientId }),
      // timestamp is handled by schema default
    };

    chat.messages.push(message);
    await chat.save();
    // The message object in chat.messages will have an _id and timestamp after saving.
    const savedMessage = chat.messages[chat.messages.length - 1];
    
    console.log(`Emitting message to chat room ${chatId}: ${JSON.stringify(savedMessage)}`);
    this.emitEvent(chatId, 'newMessage', savedMessage);
    console.log(`Message added to chat ${chatId} and event emitted.`);
    return savedMessage;
  }

  /**
   * Updates the mapDetails for a specific chat and emits an event.
   * @param {string} chatId - The ID of the chat.
   * @param {object} newMapDetails - The new map details object.
   * @returns {Promise<void>}
   */
  async updateChatMapDetails(chatId, newMapDetails) {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.error(`Chat not found with ID: ${chatId} when trying to update map details.`);
      return; 
    }

    chat.mapDetails = newMapDetails;
    await chat.save();
    
    console.log(`Map details updated for chat ${chatId}: ${JSON.stringify(newMapDetails)}`);
    this.emitEvent(chatId, 'mapDetailsUpdated', chat.mapDetails);
    console.log(`mapDetailsUpdated event emitted for chat ${chatId}.`);
  }

  /**
   * Handles incoming messages from a socket client.
   * @param {object} socket - The socket instance of the client.
   * @param {object} data - The data object from the client.
   *                        Expected: { chatId: string, content: any, type: string, clientId?: string }
   */
  async handleClientMessage(socket, data) {
    const { chatId, content, type, clientId } = data;

    if (!chatId || typeof content === 'undefined') {
      console.error('Missing chatId or content in client message:', data);
      socket.emit('errorMessage', { message: 'Chat ID and content are required.' });
      return;
    }

    console.log(`Handling client message type '${type}' for chat ID ${chatId} with content: "${content}"`);

    try {
      switch (type) {
        case 'userTextMessage':
          // Add user's message
          await this.addMessage(chatId, content, false, 'text', clientId);
          
          // Trigger Gemini processing
          try {
            console.log(`[ChatHandler] Getting suggestions for prompt: "${content}" in chat ${chatId}`);
            const { markdown, placesForMap } = await getPlaceSuggestionsAndParking(content, chatId);

            if (markdown) {
              await this.addMessage(chatId, markdown, true, 'text');
            } else {
              // This case should ideally be handled by getPlaceSuggestionsAndParking returning a default markdown.
              await this.addMessage(chatId, "I'm sorry, I couldn't come up with a suggestion right now.", true, 'text');
            }

            const allDisplayPlaces = [];
            let mapCenter = { latitude: 49.2336, longitude: 6.9929 }; // Default Saarbrücken center
            let mapZoom = 13;

            if (placesForMap && placesForMap.length > 0) {
              placesForMap.forEach(p => {
                // placesForMap items should already have .coordinates in {latitude, longitude} format
                // and other necessary fields like name, address, description, placeType, etc.
                const placeEntry = {
                  ...p, // Spread all properties from the processed place object from handlePrompt
                  _id: p._id, // Ensure _id is present
                  name: p.name || "Unnamed Place",
                  // Ensure coordinates is an object, not an array, for frontend map components
                  coordinates: p.coordinates ? { latitude: p.coordinates.latitude, longitude: p.coordinates.longitude } : undefined,
                };
                allDisplayPlaces.push(placeEntry);
              });

              if (allDisplayPlaces.length > 0) {
                 const firstPlaceWithLocation = allDisplayPlaces.find(p => p.coordinates);
                 if (firstPlaceWithLocation && firstPlaceWithLocation.coordinates) {
                    mapCenter = { 
                        latitude: firstPlaceWithLocation.coordinates.latitude, 
                        longitude: firstPlaceWithLocation.coordinates.longitude 
                    };
                    mapZoom = 14; 
                 }

                const newMapDetails = {
                  places: allDisplayPlaces,
                  center: mapCenter,
                  zoom: mapZoom,
                };
                await this.updateChatMapDetails(chatId, newMapDetails);
                
                await this.addMessage(chatId, allDisplayPlaces, true, 'Places');
                console.log(`[ChatHandler] Bot responded with Places data and updated map for chat ${chatId}`);
              }
            } else if (markdown) {
                // Markdown was sent, but no places (e.g., Gemini gave a text-only response or error message)
                console.log(`[ChatHandler] Gemini provided a text response without specific places for chat ${chatId}. No map update or 'Places' message.`);
            }

          } catch (error) {
            console.error(`[ChatHandler] Error processing user prompt with Gemini for chat ${chatId}: ${error.message}`, error.stack);
            await this.addMessage(chatId, "Sorry, I encountered an error trying to process your request. Please try again.", true, 'text');
            // Emitting to socket for client-side error display might be too verbose if markdown already contains an error.
            // socket.emit('errorMessage', { message: 'Error processing your request with AI: ' + error.message });
          }
          break;
        // Add more cases here for different message types
        default:
          console.warn(`Unhandled message type: ${type} for chat ${chatId}`);
          socket.emit('warningMessage', { message: `Message type '${type}' is not handled.` });
      }
    } catch (error) {
      console.error(`Error handling client message for chat ${chatId}:`, error.message, error.stack);
      socket.emit('errorMessage', { message: 'Error processing your message. ' + error.message });
    }
  }

  // Example placeholder methods for bot interaction (implement as needed)
  // async shouldTriggerBotResponse(userContent) { return true; }
  // async generateBotReply(chatId, userContent) { return \`Bot echoing: ${userContent}\`; }
}

export default ChatHandler;
