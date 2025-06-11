
import React from 'react';
import { DollarSign, Shield, Globe, Bell } from 'lucide-react';
import { SectionTracker } from './SectionTracker';

export function BenefitsSection() {
  return (
    <SectionTracker sectionId="benefits">
      <section id="benefits" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            היתרונות שלכם
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            גלו איך BrilliantBot יכול לשנות את העסק שלכם ולעזור לכם להצליח יותר.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
              <DollarSign className="w-10 h-10 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-400 mb-2">הגדלת רווחים</h3>
              <p className="text-slate-300">
                המלצות תמחור חכמות שמגדילות את הרווחים שלכם.
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
              <Shield className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-400 mb-2">חיסכון בזמן</h3>
              <p className="text-slate-300">
                ניהול מלאי אוטומטי שחוסך לכם זמן יקר.
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
              <Globe className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-indigo-400 mb-2">יתרון תחרותי</h3>
              <p className="text-slate-300">
                הקדימו את המתחרים עם טכנולוגיית AI מתקדמת.
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
              <Bell className="w-10 h-10 text-red-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-red-400 mb-2">התראות חכמות</h3>
              <p className="text-slate-300">
                קבלו התראות על שינויים בשוק ובמלאי שלכם.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SectionTracker>
  );
}
