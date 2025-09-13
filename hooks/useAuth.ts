import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types';

// A simple JWT decoder for client-side use
function decodeJwt(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error("Failed to decode JWT", e);
    return null;
  }
}

// Gracefully handle missing GOOGLE_CLIENT_ID. Auth will be disabled if it's not set.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || null;

export const useAuth = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const isAuthEnabled = !!GOOGLE_CLIENT_ID;

    const handleCredentialResponse = useCallback((response: any) => {
        if (response.credential) {
            const decodedToken = decodeJwt(response.credential);
            if (decodedToken) {
                const profile: UserProfile = {
                    name: decodedToken.name,
                    email: decodedToken.email,
                    picture: decodedToken.picture,
                };
                setUserProfile(profile);
                sessionStorage.setItem('userProfile', JSON.stringify(profile));
            }
        }
    }, []);

    const initializeGsi = useCallback(() => {
        if (!isAuthEnabled) {
            console.warn("Google Client ID is not configured. Google Sign-In is disabled.");
            return;
        }

        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: true
            });
            // Only prompt if not already logged in from session storage
            if (!sessionStorage.getItem('userProfile')) {
                window.google.accounts.id.prompt();
            }
        } else {
            console.error("Google Identity Services library not loaded.");
        }
    }, [handleCredentialResponse, isAuthEnabled]);

    useEffect(() => {
        // We only need to run initialization logic if auth is enabled.
        if (!isAuthEnabled) return;

        const storedProfile = sessionStorage.getItem('userProfile');
        if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
        }

        const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (script instanceof HTMLScriptElement) {
            script.onload = initializeGsi;
        } else if (window.google) {
            // If script is already loaded
            initializeGsi();
        }
    }, [initializeGsi, isAuthEnabled]);

    const signIn = useCallback(() => {
        if (!isAuthEnabled) {
             alert("La fonctionnalité de connexion Google n'est pas configurée pour cette application.");
             return;
        }
        if (window.google) {
            window.google.accounts.id.prompt();
        } else {
            console.error("Google sign-in not initialized.");
            alert("La connexion Google n'est pas encore prête, veuillez réessayer dans un instant.");
        }
    }, [isAuthEnabled]);

    const signOut = useCallback(() => {
        if (window.google && isAuthEnabled) {
            window.google.accounts.id.disableAutoSelect();
        }
        setUserProfile(null);
        sessionStorage.removeItem('userProfile');
    }, [isAuthEnabled]);

    return { userProfile, signIn, signOut, isAuthEnabled };
};
