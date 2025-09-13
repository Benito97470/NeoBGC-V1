import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useChat } from './hooks/useChat';
import { useAuth } from './hooks/useAuth';
import type { Message } from './types';
import { SettingsModal } from './components/SettingsModal';

const App: React.FC = () => {
  const { 
    messages, 
    conversations, 
    activeConversationId, 
    sendMessage, 
    startNewChat, 
    selectChat, 
    isLoading, 
    error,
    selectedModel,
    setSelectedModel,
    regenerateResponse,
    chatMode,
    setChatMode,
    withSound,
    setWithSound
  } = useChat();
  
  const { userProfile, signIn, signOut, isAuthEnabled } = useAuth();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const showWelcomeScreen = !activeConversationId;

  return (
    <div className="flex h-screen text-white bg-[#343541]">
      <Sidebar 
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={startNewChat}
        onSelectChat={selectChat}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        userProfile={userProfile}
        onSignIn={signIn}
        onSignOut={signOut}
        isAuthEnabled={isAuthEnabled}
      />
      <main className="flex flex-col flex-1 h-full">
        <div className="flex-1 overflow-y-auto relative">
          {showWelcomeScreen ? (
            <WelcomeScreen />
          ) : (
            <div className="w-full max-w-3xl mx-auto px-4 py-8">
              {messages.map((msg: Message, index: number) => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg}
                  onRegenerate={
                    index === messages.length - 1 && msg.role === 'model' && !isLoading
                      ? regenerateResponse
                      : undefined
                  }
                />
              ))}
              {isLoading && (
                <ChatMessage 
                  message={{ id: 'loading', role: 'model', parts: [{ text: '' }] }} 
                  isLoading={true}
                  loadingText={chatMode === 'video' ? "Génération de la vidéo avec VEO3 en cours... Cela peut prendre quelques minutes." : undefined}
                />
              )}
               <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <div className="w-full bg-[#343541] border-t border-gray-700">
           <div className="w-full max-w-3xl mx-auto px-4 py-4">
              {error && <p className="text-red-400 text-center text-sm mb-2">{error}</p>}
              <ChatInput 
                onSendMessage={sendMessage} 
                isLoading={isLoading}
                chatMode={chatMode}
                onModeChange={setChatMode}
                withSound={withSound}
                onWithSoundChange={setWithSound}
              />
              <p className="text-xs text-center text-gray-500 mt-2">
                NeoBGC V1. Un assistant IA puissant avec génération de texte et d'image.
              </p>
           </div>
        </div>
      </main>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />
    </div>
  );
};

export default App;