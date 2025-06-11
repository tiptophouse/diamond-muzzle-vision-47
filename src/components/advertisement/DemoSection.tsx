
import React from 'react';
import { Diamond, Bot } from 'lucide-react';

interface DemoSectionProps {
  onTryBot: () => void;
  isAuthenticated: boolean;
  leadCaptured: boolean;
}

export function DemoSection({ onTryBot, isAuthenticated, leadCaptured }: DemoSectionProps) {
  return (
    <section id="demo" className="py-20 px-6 bg-slate-800/30">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          מוכנים לנסות?
        </h2>
        
        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl p-12 border border-blue-500/30">
          <Diamond className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-6">
            נסו את BrilliantBot עכשיו - חינם!
          </h3>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            לא צריך להתקין כלום, לא צריך להירשם. פשוט תלחצו על הכפתור ותתחילו לעבוד עם הבוט הכי חכם בתחום היהלומים
          </p>
          
          <button 
            onClick={onTryBot}
            className="inline-flex items-center justify-center space-x-3 space-x-reverse bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg py-4 px-8 text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
          >
            <span>{isAuthenticated && leadCaptured ? 'כניסה למערכת - Diamond Muzzle' : 'התחל עכשיו - @diamondmazalbot'}</span>
            <Bot className="w-6 h-6" />
          </button>
          
          <div className="mt-8 text-slate-400 space-y-2">
            <p>✅ חינם לחלוטין לנסות</p>
            <p>⚡ תוצאות מיידיות</p>
            <p>🔒 מאובטח ופרטי</p>
            <p>🤝 תמיכה מלאה בעברית</p>
            {isAuthenticated && leadCaptured && (
              <p className="text-green-400 font-semibold">🎯 אתם כבר רשומים - לחצו כניסה למערכת!</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
