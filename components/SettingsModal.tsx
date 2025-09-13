import React from 'react';
import type { ModelType } from '../types';
import { XIcon } from './icons/Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

const modelOptions: { id: ModelType; label: string; description: string; disabled?: boolean }[] = [
    { id: 'reflexion', label: 'NeoBGC V1 Reflexion', description: 'Le modèle standard, équilibré pour la plupart des tâches.' },
    { id: 'rapide', label: 'NeoBGC V1 Rapide', description: 'Optimisé pour des réponses rapides, avec moins de temps de réflexion.' },
    { id: 'lent', label: 'NeoBGC V1 Lent', description: 'Prend plus de temps pour penser pour des réponses potentiellement plus approfondies.' },
    { id: 'nsfw', label: 'NeoBGC V1 NSFW', description: 'Contenu non censuré. (Indisponible)', disabled: true },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, selectedModel, onModelChange }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" 
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-[#343541] rounded-lg shadow-xl w-full max-w-md m-4 text-white p-6 relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h2 className="text-xl font-semibold">Paramètres</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div>
            <h3 className="text-lg font-medium mb-3 text-gray-300">Choix du Modèle</h3>
            <fieldset className="space-y-4">
                <legend className="sr-only">Choisissez un modèle NeoBGC</legend>
                {modelOptions.map((option) => (
                    <div 
                        key={option.id} 
                        className={`relative flex items-start p-4 rounded-lg border transition-colors ${
                            selectedModel === option.id ? 'bg-gray-700 border-green-500' : 'bg-gray-800 border-gray-600'
                        } ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700'}`}
                    >
                         <div className="flex items-center h-5">
                            <input
                                id={option.id}
                                name="model-selection"
                                type="radio"
                                checked={selectedModel === option.id}
                                onChange={() => !option.disabled && onModelChange(option.id)}
                                disabled={option.disabled}
                                className="focus:ring-green-500 h-4 w-4 text-green-600 bg-gray-900 border-gray-500"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor={option.id} className={`font-medium ${option.disabled ? 'text-gray-500' : 'text-gray-200'}`}>
                                {option.label}
                            </label>
                            <p className="text-gray-400">{option.description}</p>
                        </div>
                    </div>
                ))}
            </fieldset>
        </div>
        
        <div className="mt-6 text-right">
             <button 
                onClick={onClose} 
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
                Fermer
            </button>
        </div>
      </div>
    </div>
  );
};