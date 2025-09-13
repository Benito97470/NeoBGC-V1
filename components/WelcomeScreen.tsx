import React from 'react';
import { NeoBgcIcon, SunIcon, ZapIcon } from './icons/Icons';

export const WelcomeScreen: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="text-center">
                <div className="inline-block p-2 bg-gray-800 rounded-full mb-4">
                    <NeoBgcIcon className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold mb-8">Comment puis-je vous aider aujourd'hui?</h1>
            </div>
            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                <div className="text-center">
                    <div className="flex justify-center items-center mb-2">
                        <SunIcon className="w-6 h-6 mr-2" />
                        <h2 className="text-lg">Exemples</h2>
                    </div>
                    <ul className="space-y-2">
                         <li className="bg-gray-800/50 p-3 rounded-lg text-sm">Génère une image d'un astronaute chevauchant une licorne</li>
                         <li className="bg-gray-800/50 p-3 rounded-lg text-sm">Crée une vidéo d'un robot dansant sous la pluie</li>
                         <li className="bg-gray-800/50 p-3 rounded-lg text-sm">Explique l'informatique quantique en termes simples</li>
                    </ul>
                </div>
                <div className="text-center">
                     <div className="flex justify-center items-center mb-2">
                        <ZapIcon className="w-6 h-6 mr-2" />
                        <h2 className="text-lg">Capacités</h2>
                    </div>
                     <ul className="space-y-2">
                        <li className="bg-gray-800/50 p-3 rounded-lg text-sm">Générer du texte, des poèmes, du code et plus encore</li>
                        <li className="bg-gray-800/50 p-3 rounded-lg text-sm">Créer des images et vidéos de haute qualité avec le modèle VEO3</li>
                        <li className="bg-gray-800/50 p-3 rounded-lg text-sm">Modifier des images en utilisant des instructions textuelles</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};