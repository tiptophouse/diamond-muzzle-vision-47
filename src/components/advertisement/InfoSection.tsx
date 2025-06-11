
import React from 'react';
import { BarChart3, Eye } from 'lucide-react';
import { SectionTracker } from './SectionTracker';

export function InfoSection() {
  return (
    <SectionTracker sectionId="what-is">
      <section id="what-is" className="py-20 px-6 bg-slate-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            מה זה BrilliantBot?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            BrilliantBot הוא בוט טלגרם חדשני שמביא את הכוח של AI ישירות לעסק היהלומים שלכם.
            הוא עוזר לכם לנהל את המלאי, לקבל החלטות תמחור חכמות ולשפר את היעילות העסקית - הכל במקום אחד.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
              <BarChart3 className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-400 mb-2">תחזיות חכמות</h3>
              <p className="text-slate-300">
                קבלו תחזיות שוק מדויקות והמלצות תמחור מבוססות AI.
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
              <Eye className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-indigo-400 mb-2">ניהול מלאי</h3>
              <p className="text-slate-300">
                נהלו את המלאי שלכם בקלות, עם עדכונים אוטומטיים ותזכורות חכמות.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SectionTracker>
  );
}
