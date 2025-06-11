
import React from 'react';
import { FileText, Users, Target } from 'lucide-react';
import { SectionTracker } from './SectionTracker';

export function FeaturesSection() {
  return (
    <SectionTracker sectionId="features">
      <section id="features" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            יכולות המערכת
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            גלו את הפיצ'רים המתקדמים שהופכים את BrilliantBot לכלי חובה לכל סוחר יהלומים.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
              <FileText className="w-10 h-10 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-400 mb-2">דוחות מותאמים</h3>
              <p className="text-slate-300">
                צרו דוחות מותאמים אישית על המלאי והמכירות שלכם.
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
              <Users className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-400 mb-2">ניהול לקוחות</h3>
              <p className="text-slate-300">
                נהלו את הלקוחות שלכם בצורה חכמה ויעילה.
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
              <Target className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-indigo-400 mb-2">ניתוח שוק</h3>
              <p className="text-slate-300">
                קבלו ניתוח שוק מעמיק על טרנדים ומחירים.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SectionTracker>
  );
}
