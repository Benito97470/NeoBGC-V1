import { useState, useCallback, useEffect, useRef } from 'react';
import { get, set, del } from 'idb-keyval';
import type { Message, MessagePart, Conversation, ModelType, ChatMode } from '../types';
import { generateResponse } from '../services/geminiService';

interface ImageFile {
  data: string;
  mimeType: string;
}

const CONVERSATIONS_STORAGE_KEY = 'neo-bgc-conversations';
const MODEL_STORAGE_KEY = 'neo-bgc-model';

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>('reflexion');
  const [chatMode, setChatMode] = useState<ChatMode>('text');
  const [withSound, setWithSound] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isLoaded = useRef(false);

  // Load from storage on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedConversations = await get<Conversation[]>(CONVERSATIONS_STORAGE_KEY);
        if (storedConversations && storedConversations.length > 0) {
          setConversations(storedConversations);
          // Set the most recent conversation as active by default
          setActiveConversationId(storedConversations[0].id);
        }

        const storedModel = await get<ModelType>(MODEL_STORAGE_KEY);
        if (storedModel) {
          setSelectedModel(storedModel);
        }
      } catch (e) {
        console.error("Failed to load data from IndexedDB", e);
        setError("Erreur : Impossible de charger l'historique des conversations.");
      } finally {
        isLoaded.current = true;
      }
    };
    loadData();
  }, []);

  // Save conversations to IndexedDB whenever they change
  useEffect(() => {
    // Don't save on the initial render before data has been loaded from IndexedDB
    if (!isLoaded.current) {
      return;
    }

    const saveData = async () => {
      try {
        if (conversations.length > 0) {
          // Store the full conversation object, including images.
          await set(CONVERSATIONS_STORAGE_KEY, conversations);
        } else {
          // If all conversations are deleted, remove the key from storage.
          await del(CONVERSATIONS_STORAGE_KEY);
        }
      } catch (e) {
        console.error("Failed to save conversations to IndexedDB", e);
        let errorMessage = "Erreur : Impossible de sauvegarder la conversation.";
        if (e instanceof Error && e.name === 'QuotaExceededError') {
          errorMessage += " Le stockage est plein.";
        }
        setError(errorMessage);
      }
    };

    saveData();
  }, [conversations]);


  // Save selected model to IndexedDB whenever it changes
  useEffect(() => {
    if (!isLoaded.current) {
        return;
    }
    const saveModel = async () => {
      try {
        await set(MODEL_STORAGE_KEY, selectedModel);
      } catch (e) {
        console.error("Failed to save model to IndexedDB", e);
      }
    };
    saveModel();
  }, [selectedModel]);


  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation ? activeConversation.messages : [];

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  const selectChat = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const sendMessage = useCallback(async (prompt: string, image?: ImageFile) => {
    if (!prompt && !image) return;

    setIsLoading(true);
    setError(null);

    const userMessageParts: MessagePart[] = [];
    if (prompt) userMessageParts.push({ text: prompt });
    if (image) userMessageParts.push({ image: `data:${image.mimeType};base64,${image.data}` });
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      parts: userMessageParts,
    };

    let currentConversationId = activeConversationId;
    let newConversation: Conversation | undefined;

    // If this is the first message of a new chat, create a new conversation
    if (!currentConversationId) {
        currentConversationId = `chat-${Date.now()}`;
        // Create a title from the first 30 chars of the prompt
        const title = prompt.length > 30 ? prompt.substring(0, 27) + '...' : prompt;
        newConversation = {
            id: currentConversationId,
            title: title || "New Chat",
            messages: [userMessage],
        };
        setActiveConversationId(currentConversationId);
    }

    setConversations(prev => {
        if (newConversation) {
            // Add the new conversation to the top of the list
            return [newConversation, ...prev];
        }
        // Add the user message to the existing active conversation
        return prev.map(c => 
            c.id === currentConversationId
                ? { ...c, messages: [...c.messages, userMessage] }
                : c
        );
    });

    try {
      const modelResponseParts = await generateResponse(prompt, image, selectedModel, chatMode, withSound);
      
      const modelMessage: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        parts: modelResponseParts,
      };
      
      // Add the model's response to the active conversation
      setConversations(prev => prev.map(c => 
          c.id === currentConversationId
              ? { ...c, messages: [...c.messages, modelMessage] }
              : c
      ));

    } catch (e) {
        const err = e as Error;
        setError(err.message || "An error occurred while fetching the response.");
        // On error, remove the user's message to allow them to try again
        setConversations(prev => prev.map(c => 
            c.id === currentConversationId
                ? { ...c, messages: c.messages.slice(0, -1) }
                : c
        ));
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, selectedModel, chatMode, withSound]);

  const regenerateResponse = useCallback(async () => {
    if (!activeConversation || isLoading) return;

    const originalMessages = activeConversation.messages;
    if (originalMessages.length < 1) return;

    let lastUserMessageIndex = -1;
    for (let i = originalMessages.length - 1; i >= 0; i--) {
        if (originalMessages[i].role === 'user') {
            lastUserMessageIndex = i;
            break;
        }
    }

    if (lastUserMessageIndex === -1) return; // No user message found

    setIsLoading(true);
    setError(null);

    const lastUserMessage = originalMessages[lastUserMessageIndex];
    const messagesToKeep = originalMessages.slice(0, lastUserMessageIndex + 1);

    // Temporarily truncate the conversation
    setConversations(prev => prev.map(c => 
        c.id === activeConversation.id ? { ...c, messages: messagesToKeep } : c
    ));

    const prompt = lastUserMessage.parts.find(p => p.text)?.text || '';
    const imagePart = lastUserMessage.parts.find(p => p.image);
    let image: ImageFile | undefined = undefined;
    if (imagePart?.image) {
        const [header, data] = imagePart.image.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
        image = { data, mimeType };
    }

    try {
        const modelResponseParts = await generateResponse(prompt, image, selectedModel, chatMode, withSound);
        const modelMessage: Message = {
            id: `model-${Date.now()}`,
            role: 'model',
            parts: modelResponseParts,
        };
        setConversations(prev => prev.map(c => 
            c.id === activeConversation.id ? { ...c, messages: [...messagesToKeep, modelMessage] } : c
        ));
    } catch (e) {
        const err = e as Error;
        setError(err.message || "An error occurred while regenerating.");
        // Restore original messages on error
        setConversations(prev => prev.map(c => 
            c.id === activeConversation.id ? { ...c, messages: originalMessages } : c
        ));
    } finally {
        setIsLoading(false);
    }
  }, [activeConversation, isLoading, selectedModel, chatMode, withSound]);

  return { 
    messages, 
    conversations,
    activeConversationId,
    sendMessage,
    startNewChat,
    selectChat,
    regenerateResponse,
    isLoading, 
    error,
    selectedModel,
    setSelectedModel,
    chatMode,
    setChatMode,
    withSound,
    setWithSound,
  };
};