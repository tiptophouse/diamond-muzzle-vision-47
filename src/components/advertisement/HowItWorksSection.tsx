
import React from 'react';
import { SectionTracker } from './SectionTracker';

export function HowItWorksSection() {
  return (
    <SectionTracker sectionId="how-it-works">
      <section id="how-it-works" className="py-20 px-6 bg-slate-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            איך זה עובד?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            הצטרפות ל-BrilliantBot היא פשוטה ומהירה. הנה איך זה עובד:
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-4 space-x-reverse">
              <div className="w-16 h-16 rounded-full bg-blue-500 text-white font-bold text-2xl flex items-center justify-center">1</div>
              <p className="text-xl text-slate-300">
                התחילו את הבוט בטלגרם
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4 space-x-reverse">
              <div className="w-16 h-16 rounded-full bg-green-500 text-white font-bold text-2xl flex items-center justify-center">2</div>
              <p className="text-xl text-slate-300">
                העלו את המלאי שלכם
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4 space-x-reverse">
              <div className="w-16 h-16 rounded-full bg-indigo-500 text-white font-bold text-2xl flex items-center justify-center">3</div>
              <p className="text-xl text-slate-300">
                קבלו המלצות תמחור חכמות
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4 space-x-reverse">
              <div className="w-16 h-16 rounded-full bg-red-500 text-white font-bold text-2xl flex items-center justify-center">4</div>
              <p className="text-xl text-slate-300">
                הגדילו את הרווחים שלכם
              </p>
            </div>
          </div>
        </div>
      </section>
    </SectionTracker>
  );
}
