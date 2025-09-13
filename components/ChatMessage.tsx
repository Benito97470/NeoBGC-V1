import React, { useState } from 'react';
import type { Message, MessagePart } from '../types';
import { UserIcon, NeoBgcIcon, DownloadIcon, ClipboardIcon, Share2Icon, RefreshCwIcon, CheckIcon } from './icons/Icons';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  onRegenerate?: () => void;
  loadingText?: string;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
    </div>
);

interface MessageContentProps {
    parts: MessagePart[];
    isUser: boolean;
}

const MessageContent: React.FC<MessageContentProps> = ({ parts, isUser }) => {
    const handleDownload = (url: string, isVideo: boolean, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const link = document.createElement('a');
        link.href = url;
        const extension = isVideo ? 'mp4' : (url.split(';')[0].split('/')[1] || 'jpeg');
        link.download = `neobgc-${isVideo ? 'video' : 'image'}-${Date.now()}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div className="text-white space-y-4">
            {parts.map((part, index) => {
                if (part.text) {
                    return <p key={`text-${index}`} className="whitespace-pre-wrap">{part.text}</p>;
                }
                if (part.image) {
                    return (
                        <div key={`image-${index}`} className="relative group max-w-sm">
                            <img src={part.image} alt="Generated content" className="rounded-lg" />
                            {!isUser && (
                                <button
                                    onClick={(e) => handleDownload(part.image!, false, e)}
                                    className="absolute top-2 right-2 p-2 bg-gray-900 bg-opacity-60 rounded-full text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-300"
                                    aria-label="Download image"
                                    title="Download image"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    );
                }
                 if (part.video) {
                    return (
                        <div key={`video-${index}`} className="relative group max-w-sm">
                            <video 
                                src={part.video} 
                                controls 
                                autoPlay 
                                muted 
                                loop 
                                className="rounded-lg"
                            />
                            {!isUser && (
                                <button
                                    onClick={(e) => handleDownload(part.video!, true, e)}
                                    className="absolute top-2 right-2 p-2 bg-gray-900 bg-opacity-60 rounded-full text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-300"
                                    aria-label="Download video"
                                    title="Download video"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false, onRegenerate, loadingText }) => {
  const isUser = message.role === 'user';
  const bgColor = isUser ? 'bg-transparent' : 'bg-[#444654]';
  const Icon = isUser ? UserIcon : NeoBgcIcon;
  const authorName = isUser ? 'You' : 'NeoBGC V1';

  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const getTextToCopy = () => {
    return message.parts
        .filter(p => p.text)
        .map(p => p.text)
        .join('\n\n');
  };

  const handleCopy = () => {
    const textToCopy = getTextToCopy();
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
      }).catch(err => console.error('Failed to copy text: ', err));
    }
  };

  const handleShare = () => {
    const textToShare = getTextToCopy();
    if (navigator.share && textToShare) {
        navigator.share({
            title: 'Réponse de NeoBGC V1',
            text: textToShare,
        }).catch(error => console.error('Error sharing:', error));
    } else {
        handleCopy();
    }
  };


  return (
    <div className={`p-4 ${bgColor} rounded-lg flex items-start space-x-4 mb-4`}>
      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 pt-1">
        <p className="font-bold text-gray-300 mb-2">{authorName}</p>
        {isLoading ? (
            <div>
                 <LoadingIndicator/>
                 {loadingText && <p className="text-sm text-gray-400 mt-2">{loadingText}</p>}
            </div>
        ) : <MessageContent parts={message.parts} isUser={isUser} />}
        {!isUser && !isLoading && (
            <div className="mt-3 flex items-center space-x-3 text-gray-400">
                <button onClick={handleCopy} title="Copier" className="flex items-center space-x-1 hover:text-white transition-colors p-1">
                   {copyStatus === 'copied' ? <CheckIcon className="w-4 h-4 text-green-500"/> : <ClipboardIcon className="w-4 h-4"/>}
                   {copyStatus === 'copied' && <span className="text-xs text-green-500">Copié!</span>}
                </button>
                <button onClick={handleShare} title="Partager" className="hover:text-white transition-colors p-1">
                    <Share2Icon className="w-4 h-4"/>
                </button>
                {onRegenerate && (
                    <button onClick={onRegenerate} title="Régénérer la réponse" className="hover:text-white transition-colors p-1">
                        <RefreshCwIcon className="w-4 h-4"/>
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};