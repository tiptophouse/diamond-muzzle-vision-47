
import React from 'react';
import { X, Diamond, ChevronLeft, Bot } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Array<{ id: string; label: string; icon: React.ComponentType<any> }>;
  activeSection: string;
  onScrollToSection: (sectionId: string) => void;
  onTryBot: () => void;
  isAuthenticated: boolean;
  leadCaptured: boolean;
}

export function Sidebar({ 
  isOpen, 
  onClose, 
  sections, 
  activeSection, 
  onScrollToSection, 
  onTryBot, 
  isAuthenticated, 
  leadCaptured 
}: SidebarProps) {
  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-slate-800/95 backdrop-blur-lg border-l border-slate-700 transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">BrilliantBot</span>
            <Diamond className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <nav className="space-y-2">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onScrollToSection(section.id)}
                className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-all duration-200 hover:bg-slate-700 group ${
                  activeSection === section.id ? 'bg-blue-600 text-white' : 'text-slate-300'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ChevronLeft className="w-4 h-4 mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-medium">{section.label}</span>
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-slate-700">
          <button 
            onClick={onTryBot}
            className="w-full flex items-center justify-center space-x-3 space-x-reverse bg-green-600 hover:bg-green-700 rounded-lg py-3 px-4 transition-all duration-300 transform hover:scale-105 font-medium"
          >
            <span>{isAuthenticated && leadCaptured ? 'כניסה למערכת' : 'נסה את הבוט'}</span>
            <Bot className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
