"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "@/components/ui/chat-input";
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from "@/components/ui/chat-message";
import { ChatMessageArea } from "@/components/ui/chat-message-area";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import { Globe, MessageSquare, Send, Bot, User, Loader2, LogOut, Map } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "../ModeToggle";
import LanguageSwitcher from "../LanguageSwitcher";
import { useSearchParams, useRouter } from 'next/navigation';
import { Place, MapDetails } from "@/types";
import CardListView from "../CardListView";
import MapView from "../MapView";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Message {
  _id?: string;
  id: string; 
  content: string | Place[];
  fromBot: boolean;
  timestamp?: Date;
  clientId?: string;
  type?: 'text' | 'Places';
}

const QuattropoleLoader = () => {
  const colors = ["#FFEEB6", "#EAEAEA", "#BECFBD", "#C2C8E1"];
  return (
    <div className="flex w-full justify-center items-center my-12 min-h-[100px]">
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loader-container {
          position: relative; width: 60px; height: 60px;
          animation: spin 3s linear infinite;
        }
        .dot {
          position: absolute; width: 15px; height: 15px; border-radius: 50%;
        }
        .dot1 { top: 0; left: 50%; transform: translateX(-50%); }
        .dot2 { top: 50%; right: 0; transform: translateY(-50%); }
        .dot3 { bottom: 0; left: 50%; transform: translateX(-50%); }
        .dot4 { top: 50%; left: 0; transform: translateY(-50%); }
      `}</style>
      <div className="loader-container">
        <div className="dot dot1" style={{ backgroundColor: colors[0] }}></div>
        <div className="dot dot2" style={{ backgroundColor: colors[1] }}></div>
        <div className="dot dot3" style={{ backgroundColor: colors[2] }}></div>
        <div className="dot dot4" style={{ backgroundColor: colors[3] }}></div>
      </div>
    </div>
  );
};

// Inner component that uses useSearchParams
function HomeIndexContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [showQuattropoleLoader, setShowQuattropoleLoader] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [mobileView, setMobileView] = useState<'chat' | 'map'>('chat');
  
  const [mapDetails, setMapDetails] = useState<MapDetails | null>(null);
  const [selectedChatPlace, setSelectedChatPlace] = useState<Place | null>(null);

  const [routePlanningMessageId, setRoutePlanningMessageId] = useState<string | null>(null);
  const [routePlanningPlaces, setRoutePlanningPlaces] = useState<Place[] | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  const chatColumnMessageAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Setting up Socket.IO connection...');
    const newSocket = io('https://quattropole.saartech.io', { 
      path: '/socket.io/',
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log("Connected to Socket.IO server", newSocket.id);
      toast.success("Realtime connection established!");
      setSocketInitialized(true);
      
      if (chatId) {
        console.log(`Joining chat room: ${chatId} on connect`);
        newSocket.emit("joinChat", chatId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log("Disconnected from Socket.IO server");
      toast.error("Realtime connection lost");
    });

    newSocket.on('joinedChat', (joinedChatId) => {
      console.log(`Successfully joined chat room: ${joinedChatId}`);
      toast.success(`Joined chat room: ${joinedChatId.substring(0, 8)}...`);
    });

    newSocket.on("newMessage", (message: Message) => {
      console.log("newMessage received", message);
      
      if (message.fromBot) {
        console.log('Setting showQuattropoleLoader to false after receiving bot message');
        setShowQuattropoleLoader(false);
        setIsLoading(false);
      }
      
      setMessages((prevMessages) => {
        if (message._id && prevMessages.some(m => m._id === message._id)) {
          return prevMessages;
        }
        
        const optimisticIndex = prevMessages.findIndex(m => 
          !m.fromBot && !message.fromBot &&
          m.content === message.content &&
          !m._id
        );
        
        if (optimisticIndex !== -1) {
          const newMessages = [...prevMessages];
          newMessages[optimisticIndex] = {
            ...message,
            id: message._id || prevMessages[optimisticIndex].id
          };
          return newMessages;
        }
        
        return [...prevMessages, { 
          ...message, 
          id: message._id || message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
        }];
      });
      
      scrollToBottom();
    });

    newSocket.on("mapDetailsUpdated", (updatedMapDetails: MapDetails) => {
      console.log("mapDetailsUpdated received", updatedMapDetails);
      setMapDetails(updatedMapDetails);
      const currentMessages = messages;
      const currentRoutePlanningMessageId = routePlanningMessageId;
      
      if (currentRoutePlanningMessageId && updatedMapDetails.route) {
        const messageWithRoute = currentMessages.find(m => (m._id || m.id) === currentRoutePlanningMessageId);
        if(messageWithRoute) {
            console.log("Clearing client-side route planning state as map was updated by bot for message:", currentRoutePlanningMessageId);
            setRoutePlanningMessageId(null);
            setRoutePlanningPlaces(null);
        }
      }
      toast.info("Map has been updated!");
    });

    newSocket.on("errorMessage", (error: { message: string }) => {
      console.error("Socket Error:", error.message);
      toast.error(`Error: ${error.message}`);
      setIsLoading(false);
      setShowQuattropoleLoader(false);
      setIsRouteLoading(false);
    });
    
    newSocket.on("warningMessage", (warning: { message: string }) => {
      console.warn("Socket Warning:", warning.message);
      toast.warning(`Warning: ${warning.message}`);
    });

    return () => {
      console.log('Closing Socket.IO connection...');
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('newMessage');
      newSocket.off('mapDetailsUpdated');
      newSocket.off('errorMessage');
      newSocket.off('warningMessage');
      newSocket.off('joinedChat');
      newSocket.close();
      setSocketInitialized(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Process URL parameters after socket is initialized
  useEffect(() => {
    if (!socketInitialized) return;
    
    const chatIdFromQuery = searchParams.get('chatId');
    const promptFromQuery = searchParams.get('prompt');
    
    console.log('Processing URL parameters:', { chatIdFromQuery, promptFromQuery, socketInitialized });
    
    if (chatIdFromQuery) {
      if (chatId !== chatIdFromQuery) {
        loadExistingChat(chatIdFromQuery);
      }
    } else if (promptFromQuery) {
      // If we have a prompt but no chat ID, create a new chat
      if (!chatId && !isChatLoading) {
        console.log('Setting pending prompt and creating chat');
        setPendingPrompt(promptFromQuery);
        handleCreateChat();
      }
    } else {
      setIsChatLoading(false);
      setIsChatting(false);
      setChatId(null);
      setMessages([]);
      setMapDetails(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, socketInitialized, chatId]);
  
  // Effect to send pending prompt once chat is created and socket connected
  useEffect(() => {
    if (pendingPrompt && chatId && socket && socket.connected && isChatting) {
      console.log("Sending pending prompt:", pendingPrompt);
      handleSendMessage(pendingPrompt);
      setPendingPrompt(null);
      
      // Remove the prompt parameter from URL while keeping chatId
      const newUrl = `?chatId=${chatId}`;
      router.replace(newUrl, { scroll: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt, chatId, socket?.connected, isChatting]);
  
  const scrollToBottom = () => {
    if (chatColumnMessageAreaRef.current) {
      chatColumnMessageAreaRef.current.scrollTop = chatColumnMessageAreaRef.current.scrollHeight;
    }
  };

  useEffect(scrollToBottom, [messages]);

  const loadExistingChat = async (idToLoad: string) => {
    setIsChatLoading(true);
    setIsLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/chat/${idToLoad}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Chat not found.");
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load chat");
      }
      const chatData = await response.json();
      setChatId(chatData._id);
      setMessages(chatData.messages.map((m: any) => ({...m, id: m._id })));
      setMapDetails(chatData.mapDetails || {});
      connectAndJoinChat(chatData._id);
      setIsChatting(true);
      toast.success("Chat loaded successfully!");
    } catch (error: any) {
      console.error("Error loading chat:", error);
      toast.error(`Error loading chat: ${error.message}`);
      router.replace(window.location.pathname, { scroll: false });
      setChatId(null);
      setMessages([]);
      setMapDetails(null);
      setIsChatting(false);
      if (socket && !socket.connected) socket.connect();
    } finally {
      setIsChatLoading(false);
      setIsLoading(false);
    }
  };

  const handleCreateChat = async () => {
    setIsChatLoading(true);
    setIsLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/chat`, { method: "POST" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create chat");
      }
      const data = await response.json();
      setChatId(data.id);
      setMessages([]); 
      setMapDetails(data.mapDetails || {});
      connectAndJoinChat(data.id);
      setIsChatting(true);
      
      // Keep the prompt parameter if it exists
      const promptParam = searchParams.get('prompt');
      const newUrl = promptParam ? `?chatId=${data.id}&prompt=${encodeURIComponent(promptParam)}` : `?chatId=${data.id}`;
      router.push(newUrl, { scroll: false });
      
      toast.success("Chat created!", { description: `Chat ID: ${data.id}` });
    } catch (error: any) {
      console.error("Error creating chat:", error);
      toast.error(`Error creating chat: ${error.message}`);
      if (socket && !socket.connected) socket.connect();
      setPendingPrompt(null); // Clear pending prompt on error
    } finally {
      setIsChatLoading(false);
      setIsLoading(false);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!socket || !chatId || !content.trim()) {
      if (!content.trim() && isLoading) {
        setIsLoading(false);
        setShowQuattropoleLoader(false);
      }
      return;
    }
    
    setIsLoading(true);
    setShowQuattropoleLoader(true);

    const clientId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: Message = {
        id: clientId,
        clientId: clientId,
        content: content,
        fromBot: false,
        timestamp: new Date(),
        type: 'text'
    };
    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    const messageData = {
      chatId: chatId,
      content: content,
      type: "userTextMessage",
      clientId: clientId
    };
    
    socket.emit("clientMessage", messageData);
    setInputValue("");
  };

  const handleExamplePromptClick = (prompt: string) => {
    setInputValue(prompt);
    handleSendMessage(prompt);
  };

  const handleEndChat = () => {
    router.replace('/', { scroll: false });
    setIsChatting(false);
    setChatId(null);
    setMessages([]);
    setMapDetails(null);
    toast.info("Chat session ended.");
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedChatPlace(place);
    setMobileView('map'); // Switch to map view on mobile when a place is selected
    setTimeout(scrollToBottom, 100);
  };

  const handlePlanRouteRequest = async (placesToRoute: Place[], profile: 'driving-traffic' | 'cycling' | 'walking') => {
    if (!MAPBOX_ACCESS_TOKEN) {
      toast.error("Mapbox token not configured. Cannot plan route.");
      setRoutePlanningMessageId(null);
      return;
    }
    if (!placesToRoute || placesToRoute.length < 2) {
      toast.warning("Please select at least two places to plan a route.");
      return;
    }

    setIsRouteLoading(true);
    setMobileView('map'); // Switch to map view on mobile when planning route

    const coordinates = placesToRoute.map(p => `${p.coordinates.longitude},${p.coordinates.latitude}`).join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?geometries=geojson&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeGeoJSON = route.geometry;
        const routeDistance = route.distance;
        const routeDuration = route.duration;

        const firstPlace = placesToRoute[0];
        const lastPlace = placesToRoute[placesToRoute.length - 1];
        
        const newCenter = {
            longitude: (firstPlace.coordinates.longitude + lastPlace.coordinates.longitude) / 2,
            latitude: (firstPlace.coordinates.latitude + lastPlace.coordinates.latitude) / 2,
        };

        const roughZoom = 7;
        
        setMapDetails(prev => ({
          ...(prev || { places: [], center: {longitude: 0, latitude: 0}, zoom: 1 }),
          route: routeGeoJSON,
          places: placesToRoute,
          center: newCenter,
          zoom: prev?.zoom && prev.route ? prev.zoom : roughZoom,
        }));

        const successMessage = `Route for ${profile.replace('-', ' ')}: ${(routeDistance / 1000).toFixed(1)} km, ${(routeDuration / 60).toFixed(0)} mins.`;
        toast.success(successMessage);
        console.log(successMessage, "Route GeoJSON:", routeGeoJSON);

        setRoutePlanningMessageId(null); 
        setRoutePlanningPlaces(null);
      } else {
        throw new Error(data.message || "No route found.");
      }
    } catch (error: any) {
      console.error("Error planning route:", error);
      toast.error(`Failed to plan route: ${error.message}`);
    } finally {
      setIsRouteLoading(false);
    }
  };

  const connectAndJoinChat = (currentChatId: string) => {
    console.log(`Attempting to join chat room: ${currentChatId}`);
    
    if (!socket) {
      console.error("Socket not initialized yet");
      toast.error("Connection not available. Please refresh the page.");
      return;
    }
    
    if (!socket.connected) {
      console.log("Socket not connected, will join after connection");
      
      socket.once('connect', () => {
        console.log(`Socket now connected, joining chat: ${currentChatId}`);
        socket.emit("joinChat", currentChatId);
      });
      
      socket.connect();
    } else {
      console.log(`Socket already connected, joining chat: ${currentChatId}`);
      socket.emit("joinChat", currentChatId);
    }
  };

  if (isChatLoading) {
    return (
      <div className="flex flex-col min-h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Chat...</p>
      </div>
    );
  }

  if (!isChatting) {
    return (
      <div className="flex flex-col min-h-screen w-full">
        <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
          <Link className="flex items-center justify-center" href="#">
            <img src="/quattropole_navigator_logo.jpg" alt="QuattroPole Navigator Logo" className="h-8 w-auto mr-2" /> 
            <span className="font-bold text-xl">QuattroPole Navigator</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6">
            <ModeToggle />
          </nav>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-6">
            <img src="/quattropole_navigator_logo.jpg" alt="QuattroPole Navigator Logo" className="mx-auto h-24 w-24" />
            <h1 className="text-4xl font-bold">Welcome to QuattroPole Navigator</h1>
            <p className="text-xl text-muted-foreground">
              Plan your next adventure in the QuattroPole cities with our AI assistant!
            </p>
            <Button size="lg" onClick={handleCreateChat} disabled={isLoading || isChatLoading}>
              {(isLoading || isChatLoading) ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting Chat...</>) : "Start New Journey"}
            </Button>
          </div>
        </main>
         <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © QuattroPole Navigator
            </p>
         </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background overflow-hidden">
      {/* Mobile View Toggle */}
      <div className="md:hidden sticky top-0 z-10 flex items-center justify-center p-2 border-b bg-background shadow-sm">
        <div className="flex rounded-lg border bg-background p-1">
          <Button 
            variant={mobileView === 'chat' ? 'default' : 'outline'} 
            size="sm"
            className="flex-1"
            onClick={() => setMobileView('chat')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Button 
            variant={mobileView === 'map' ? 'default' : 'outline'} 
            size="sm"
            className="flex-1"
            onClick={() => setMobileView('map')}
          >
            <Map className="h-4 w-4 mr-2" />
            Map
          </Button>
        </div>
      </div>

      {/* Chat Column */}
      <div 
        className={`
          ${mobileView === 'map' ? 'hidden' : 'flex'} md:flex
          md:w-1/3 flex-col border-r h-[calc(100vh-40px)] md:h-screen overflow-hidden
          ${mobileView === 'chat' ? 'w-full' : 'w-0'}
        `}
      >
        <header className="p-4 border-b flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
                <img src="/quattropole_navigator_logo.jpg" alt="QuattroPole Navigator Logo" className="h-7 w-auto" /> 
                <span className="font-bold text-lg">QuattroPole Navigator</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">ID: {chatId?.substring(0,8)}...</span>
                <Button variant="outline" size="icon" onClick={handleEndChat} title="End Chat Session">
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </header>
        
        <div 
          ref={chatColumnMessageAreaRef} 
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10" 
          style={{ 
            maxHeight: 'calc(100% - 184px)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent',
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar { width: 6px; }
            div::-webkit-scrollbar-track { background: transparent; }
            div::-webkit-scrollbar-thumb { background-color: rgba(155, 155, 155, 0.5); border-radius: 6px; border: 2px solid transparent; }
            div::-webkit-scrollbar-thumb:hover { background-color: rgba(155, 155, 155, 0.7); }
          `}</style>
          
          {/* Add global styles to fix table display issues */}
          <style jsx global>{`
            /* Fix for table display issues */
            table {
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              min-width: unset !important;
              overflow-x: auto !important;
            }
            
            /* Fix for any elements with display:table */
            [style*="display:table"], [style*="display: table"] {
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              min-width: unset !important;
            }
            
            /* Handle long words and links */
            .w-full * {
              overflow-wrap: break-word;
              word-wrap: break-word;
              word-break: break-word;
              max-width: 100%;
            }
            
            pre, code {
              white-space: pre-wrap !important;
              max-width: 100% !important;
            }
          `}</style>
          
          <ChatMessageArea>
          {messages.length === 0 && !showQuattropoleLoader && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
              <img src="/quattropole_navigator_logo.jpg" alt="QuattroPole Navigator Logo" className="w-32 h-32 mb-8" />
              <p className="mb-6 text-lg">How can I help you plan your trip in the QuattroPole cities?</p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => handleExamplePromptClick("Find local restaurants in Saarbrücken.")}>
                  "Find local restaurants in Saarbrücken."
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleExamplePromptClick("Quelles sont les attractions touristiques à Sarrebruck?")}>
                  "Quelles sont les attractions touristiques à Sarrebruck?"
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleExamplePromptClick("Wo kann ich in Saarbrücken gut einkaufen?")}>
                  "Wo kann ich in Saarbrücken gut einkaufen?"
                </Button>
              </div>
            </div>
          )}
          {messages.map((msg, index) => (
            <ChatMessage
              key={msg._id || msg.id} 
              id={msg._id || msg.id}
              type={msg.fromBot ? "incoming" : "outgoing"}
              variant={msg.fromBot ? undefined : "bubble"}
              className={`${index > 0 ? 'mt-3' : ''}`}
            >
              {msg.fromBot && (
                <ChatMessageAvatar><Bot className="h-6 w-6" /></ChatMessageAvatar>
              )}
              {!msg.fromBot && (
                <ChatMessageAvatar className="ml-auto flex items-center justify-center"><User className="h-6 w-6" /></ChatMessageAvatar>
              )}
              
              {msg.type === 'Places' && msg.fromBot && Array.isArray(msg.content) && msg.content.length > 0 ? (
                <div className="w-full mt-1">
                  <CardListView places={msg.content as Place[]} onPlaceSelect={handlePlaceSelect} />
                  {(msg.content as Place[]).length > 1 && (
                    <div className="mt-3 pt-2 border-t border-border/50">
                      {routePlanningMessageId === (msg._id || msg.id) ? (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Select transport mode:</p>
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline" onClick={() => handlePlanRouteRequest(routePlanningPlaces!, 'driving-traffic')} disabled={isRouteLoading}>
                                    {isRouteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-xs" /> : null} Car
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handlePlanRouteRequest(routePlanningPlaces!, 'cycling')} disabled={isRouteLoading}>
                                    {isRouteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-xs" /> : null} Bicycle
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handlePlanRouteRequest(routePlanningPlaces!, 'walking')} disabled={isRouteLoading}>
                                    {isRouteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-xs" /> : null} Walking
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setRoutePlanningMessageId(null); setRoutePlanningPlaces(null); }} disabled={isRouteLoading}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                      ) : (
                        <Button 
                            size="sm" 
                            variant="default" 
                            className="w-full mt-2" 
                            onClick={() => { 
                                setRoutePlanningMessageId(msg._id || msg.id); 
                                setRoutePlanningPlaces(msg.content as Place[]); 
                            }}
                            disabled={isRouteLoading || (!!routePlanningMessageId && routePlanningMessageId !== (msg._id || msg.id))}
                        >
                          {isRouteLoading && routePlanningMessageId === (msg._id || msg.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Plan Route
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <ChatMessageContent content={typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)} />
              )}
            </ChatMessage>
          ))}
          
          {(showQuattropoleLoader || isRouteLoading) && (
            <div className="flex justify-center items-center w-full">
              <QuattropoleLoader />
            </div>
          )}
          
          </ChatMessageArea>
        </div>

        <div className="p-4 border-t shrink-0 bg-background">
          <ChatInput
              variant="default"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSubmit={() => handleSendMessage(inputValue)} 
              loading={isLoading} 
              onStop={() => {
                setIsLoading(false);
                setShowQuattropoleLoader(false);
              }}
          >
              <ChatInputTextArea placeholder="Describe your desired journey..." />
              <ChatInputSubmit disabled={isLoading || !chatId} > 
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4"/>} 
              </ChatInputSubmit>
          </ChatInput>
        </div>
      </div>

      {/* Map Column */}
      <div 
        className={`
          ${mobileView === 'chat' ? 'hidden' : 'flex'} md:flex
          md:w-2/3 flex-1 h-[calc(100vh-40px)] md:h-full relative
          ${mobileView === 'map' ? 'w-full' : 'w-0'}
        `}
      >
        <MapView 
          places={mapDetails?.places}
          center={mapDetails?.center}
          zoom={mapDetails?.zoom}
          route={mapDetails?.route}
          selectedPlace={selectedChatPlace}
        />
        {!mapDetails && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-50">
                <p className="text-muted-foreground">Map will update based on your chat.</p>
            </div>
        )}
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function HomeIndex() {
  return (
    <Suspense fallback={<QuattropoleLoader />}>
      <HomeIndexContent />
    </Suspense>
  );
}
