import React from 'react';
import { PlusIcon, MessageSquareIcon, SettingsIcon, LogOutIcon, GoogleIcon, NeoBgcIcon } from './icons/Icons';
import type { Conversation, UserProfile } from '../types';

interface SidebarProps {
    conversations: Conversation[];
    activeConversationId: string | null;
    onNewChat: () => void;
    onSelectChat: (id: string) => void;
    onOpenSettings: () => void;
    userProfile: UserProfile | null;
    onSignIn: () => void;
    onSignOut: () => void;
    isAuthEnabled: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    conversations, 
    activeConversationId, 
    onNewChat, 
    onSelectChat, 
    onOpenSettings,
    userProfile,
    onSignIn,
    onSignOut,
    isAuthEnabled
}) => {
    
  return (
    <div className="w-64 bg-[#202123] p-2 flex flex-col h-full">
       <div className="flex items-center justify-between p-2 mb-2 flex-shrink-0">
         <div className="flex items-center space-x-2">
            <NeoBgcIcon className="w-8 h-8 text-white" />
            <span className="font-bold text-lg">NeoBGC V1</span>
         </div>
         <button 
            onClick={onNewChat} 
            title="Nouveau Chat" 
            className="p-2 rounded-md text-white hover:bg-gray-700 transition-colors"
         >
            <PlusIcon className="w-5 h-5" />
         </button>
      </div>
      <div className="flex-grow mt-2 overflow-y-auto pr-1">
        <div className="flex flex-col space-y-1">
            {conversations.map((convo) => (
                <button 
                    key={convo.id}
                    onClick={() => onSelectChat(convo.id)}
                    title={convo.title}
                    className={`flex items-center w-full p-3 rounded-md text-sm text-left truncate transition-colors ${
                        activeConversationId === convo.id 
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                    <MessageSquareIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="flex-1 truncate">{convo.title}</span>
                </button>
            ))}
        </div>
      </div>
      <div className="border-t border-gray-700 mt-auto pt-2 flex-shrink-0">
         <button onClick={onOpenSettings} className="flex items-center w-full p-3 rounded-md text-sm text-white hover:bg-gray-700 transition-colors">
            <SettingsIcon className="w-4 h-4 mr-3" />
            Paramètres
         </button>
         
         {/* Auth Section */}
         {isAuthEnabled && (
            <div className="border-t border-gray-700 mt-2 pt-2">
                {userProfile ? (
                    <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-3 p-2">
                            <img src={userProfile.picture} alt={userProfile.name} className="w-8 h-8 rounded-full" />
                            <div className="flex-1 truncate">
                                <p className="text-sm font-medium text-white truncate">{userProfile.name}</p>
                                <p className="text-xs text-gray-400 truncate">{userProfile.email}</p>
                            </div>
                        </div>
                        <button
                           onClick={onSignOut}
                           className="flex items-center w-full p-3 rounded-md text-sm text-white hover:bg-gray-700 transition-colors"
                        >
                            <LogOutIcon className="w-4 h-4 mr-3" />
                            Se déconnecter
                        </button>
                    </div>
                ) : (
                    <button
                       onClick={onSignIn}
                       className="flex items-center justify-center w-full p-3 rounded-md text-sm text-white bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                        <GoogleIcon className="w-4 h-4 mr-2"/>
                        Se connecter avec Google
                    </button>
                )}
            </div>
         )}
      </div>
    </div>
  );
};