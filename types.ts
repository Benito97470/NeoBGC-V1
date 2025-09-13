export type Role = 'user' | 'model';

export interface MessagePart {
  text?: string;
  image?: string; // base64 data URL
  video?: string; // blob URL
}

export interface Message {
  id: string;
  role: Role;
  parts: MessagePart[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export type ModelType = 'reflexion' | 'rapide' | 'lent' | 'nsfw';

export type ChatMode = 'text' | 'image' | 'video';

export interface UserProfile {
    name: string;
    email: string;
    picture: string;
}

// Add google to the window object for TypeScript
declare global {
    interface Window {
        google?: any;
    }
}