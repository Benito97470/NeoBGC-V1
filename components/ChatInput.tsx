import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { SendIcon, PaperclipIcon, XIcon, TypeIcon, ImageIcon, VideoIcon, Volume2Icon } from './icons/Icons';
import type { ChatMode } from '../types';

interface ImageFile {
  data: string;
  mimeType: string;
  name: string;
  previewUrl: string;
}

interface ChatInputProps {
  onSendMessage: (prompt: string, image?: { data: string, mimeType: string }) => void;
  isLoading: boolean;
  chatMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  withSound: boolean;
  onWithSoundChange: (withSound: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, chatMode, onModeChange, withSound, onWithSoundChange }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const [header, base64Data] = result.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
        setImageFile({
            data: base64Data,
            mimeType: mimeType,
            name: file.name,
            previewUrl: result,
        });
        // Switching to text mode when an image is attached for editing, or video for video generation
        if (file.type.startsWith('video/')) {
            onModeChange('video');
        } else {
             onModeChange('text');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if ((!prompt.trim() && !imageFile) || isLoading) return;
    onSendMessage(prompt, imageFile ? { data: imageFile.data, mimeType: imageFile.mimeType } : undefined);
    setPrompt('');
    setImageFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const placeholderText = imageFile 
    ? "Décrivez ce que vous voulez faire avec ce média..."
    : chatMode === 'image' 
    ? 'Demandez-moi de dessiner quelque chose...'
    : chatMode === 'video'
    ? 'Décrivez la vidéo que vous voulez créer (son bientôt disponible)...'
    : 'Envoyer un message à NeoBGC...';

  return (
    <div className="relative">
      {imageFile && (
        <div className="absolute bottom-full left-0 w-full mb-2">
            <div className="bg-gray-800 p-2 rounded-lg max-w-xs flex items-center space-x-2">
                {imageFile.mimeType.startsWith('image/') ? (
                    <img src={imageFile.previewUrl} alt="Preview" className="w-12 h-12 rounded object-cover"/>
                ) : (
                    <div className="w-12 h-12 rounded bg-black flex items-center justify-center">
                        <VideoIcon className="w-6 h-6 text-white" />
                    </div>
                )}
                <span className="text-sm text-gray-300 truncate flex-1">{imageFile.name}</span>
                <button onClick={() => setImageFile(null)} className="p-1 rounded-full hover:bg-gray-700">
                    <XIcon className="w-4 h-4"/>
                </button>
            </div>
        </div>
      )}
      <div className="flex items-center p-2 rounded-lg bg-[#40414f] shadow-lg">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-white rounded-full transition-colors"
          aria-label="Joindre un fichier"
          title="Joindre une image ou une vidéo"
        >
          <PaperclipIcon className="w-5 h-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*"
        />
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholderText}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none px-2"
          style={{ maxHeight: '200px' }}
        />
        <button
          onClick={handleSend}
          disabled={(!prompt.trim() && !imageFile) || isLoading}
          className="p-2 rounded-md bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
          aria-label="Envoyer le message"
          title="Envoyer"
        >
          <SendIcon className="w-5 h-5 text-white" />
        </button>
      </div>
       {!imageFile && (
        <div className="flex flex-col items-center">
            <div className="flex justify-center items-center space-x-2 mt-3">
                <span className="text-xs text-gray-400">Mode :</span>
                <button
                    onClick={() => onModeChange('text')}
                    className={`flex items-center space-x-2 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        chatMode === 'text' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    <TypeIcon className="w-3 h-3" />
                    <span>Texte</span>
                </button>
                <button
                    onClick={() => onModeChange('image')}
                    className={`flex items-center space-x-2 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        chatMode === 'image' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    <ImageIcon className="w-3 h-3" />
                    <span>Image</span>
                </button>
                 <button
                    onClick={() => onModeChange('video')}
                    className={`flex items-center space-x-2 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        chatMode === 'video' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    <VideoIcon className="w-3 h-3" />
                    <span>Vidéo</span>
                </button>
            </div>
             {chatMode === 'video' && (
                <div className="flex justify-center items-center mt-3">
                    <label htmlFor="withSound" className="flex items-center text-xs text-gray-400 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            id="withSound"
                            checked={withSound}
                            onChange={(e) => onWithSoundChange(e.target.checked)}
                            className="w-4 h-4 text-green-600 bg-gray-900 border-gray-500 focus:ring-green-500 focus:ring-offset-0 rounded"
                        />
                        <Volume2Icon className="w-4 h-4 ml-2 mr-1" />
                        <span>Ajouter du son (Bientôt disponible)</span>
                    </label>
                </div>
            )}
        </div>
      )}
    </div>
  );
};