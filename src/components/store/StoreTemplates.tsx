
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Monitor, Moon, Sparkles, Crown } from "lucide-react";

export interface StoreTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  icon: React.ReactNode;
}

const templates: StoreTemplate[] = [
  {
    id: "modern-minimalist",
    name: "Modern Minimalist",
    description: "Clean, white space design with subtle accents",
    preview: "bg-gradient-to-br from-white to-gray-50",
    colors: {
      primary: "rgb(59, 130, 246)",
      secondary: "rgb(156, 163, 175)",
      background: "rgb(255, 255, 255)",
      accent: "rgb(16, 185, 129)",
    },
    icon: <Monitor className="h-6 w-6" />
  },
  {
    id: "luxury-dark",
    name: "Luxury Dark",
    description: "Premium dark theme with gold accents",
    preview: "bg-gradient-to-br from-gray-900 to-black",
    colors: {
      primary: "rgb(251, 191, 36)",
      secondary: "rgb(107, 114, 128)",
      background: "rgb(17, 24, 39)",
      accent: "rgb(245, 158, 11)",
    },
    icon: <Crown className="h-6 w-6 text-yellow-500" />
  },
  {
    id: "classic-elegant",
    name: "Classic Elegant",
    description: "Traditional jewelry store aesthetic",
    preview: "bg-gradient-to-br from-blue-50 to-indigo-100",
    colors: {
      primary: "rgb(79, 70, 229)",
      secondary: "rgb(148, 163, 184)",
      background: "rgb(248, 250, 252)",
      accent: "rgb(139, 69, 19)",
    },
    icon: <Sparkles className="h-6 w-6 text-indigo-600" />
  },
  {
    id: "contemporary-bold",
    name: "Contemporary Bold",
    description: "Vibrant colors and modern layouts",
    preview: "bg-gradient-to-br from-purple-400 to-pink-400",
    colors: {
      primary: "rgb(168, 85, 247)",
      secondary: "rgb(236, 72, 153)",
      background: "rgb(255, 255, 255)",
      accent: "rgb(34, 197, 94)",
    },
    icon: <Palette className="h-6 w-6 text-purple-600" />
  }
];

interface StoreTemplatesProps {
  onSelectTemplate: (template: StoreTemplate) => void;
  selectedTemplate?: string;
}

export function StoreTemplates({ onSelectTemplate, selectedTemplate }: StoreTemplatesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => (
        <Card 
          key={template.id} 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => onSelectTemplate(template)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                {template.icon}
                {template.name}
              </CardTitle>
              {selectedTemplate === template.id && (
                <Badge className="bg-blue-500 text-white">Selected</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`h-24 rounded-lg mb-3 ${template.preview} border`}>
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full mx-auto mb-1" 
                       style={{ backgroundColor: template.colors.primary }}></div>
                  <div className="text-xs font-medium">Preview</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">{template.description}</p>
            <div className="flex gap-2 mt-3">
              {Object.entries(template.colors).map(([key, color]) => (
                <div 
                  key={key}
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                  title={key}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { templates };
