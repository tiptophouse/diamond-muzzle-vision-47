
import React from 'react';
import { Diamond, Bot, Zap, MessageCircle } from 'lucide-react';

interface HeroSectionProps {
  scrollY: number;
  onTryBot: () => void;
  onScrollToSection: (sectionId: string) => void;
  isAuthenticated: boolean;
  leadCaptured: boolean;
}

export function HeroSection({ 
  scrollY, 
  onTryBot, 
  onScrollToSection, 
  isAuthenticated, 
  leadCaptured 
}: HeroSectionProps) {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-6 relative">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-8" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
          <Diamond className="w-20 h-20 mx-auto mb-6 text-blue-400 animate-pulse" />
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
            BrilliantBot
          </h1>
          <p className="text-xl lg:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            הבוט החכם שמשנה את הדרך שבה אתם מנהלים את עסק היהלומים שלכם
          </p>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            AI מתקדם, ניהול מלאי אוטומטי ותמחור חכם - הכל בטלגרם
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
            <Bot className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-400 mb-2">חכם</h3>
            <p className="text-slate-300">AI מתקדם להמלצות תמחור</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
            <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-blue-400 mb-2">מהיר</h3>
            <p className="text-slate-300">עיבוד מיידי של המלאי</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
            <MessageCircle className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-indigo-400 mb-2">נוח</h3>
            <p className="text-slate-300">הכל בטלגרם שאתם כבר מכירים</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onTryBot}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 flex items-center justify-center space-x-2 space-x-reverse"
          >
            <span>{isAuthenticated && leadCaptured ? 'כניסה למערכת' : 'נסה את הבוט עכשיו'}</span>
            <Bot className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onScrollToSection('what-is')}
            className="px-8 py-4 border border-slate-600 rounded-lg font-semibold hover:bg-slate-800 transition-all duration-300 transform hover:scale-105"
          >
            למד עוד
          </button>
        </div>
      </div>
    </section>
  );
}
