
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MobileFormSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  completedFields?: number;
  totalFields?: number;
}

export function MobileFormSection({ 
  title, 
  children, 
  defaultOpen = false,
  completedFields = 0,
  totalFields = 0
}: MobileFormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const progress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl"
      >
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          {totalFields > 0 && (
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {completedFields}/{totalFields}
              </span>
            </div>
          )}
        </div>
        <div className="ml-4">
          {isOpen ? (
            <ChevronUp className="h-6 w-6 text-gray-600" />
          ) : (
            <ChevronDown className="h-6 w-6 text-gray-600" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );
}
