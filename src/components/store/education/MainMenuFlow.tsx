
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Search, GraduationCap, ArrowLeft } from "lucide-react";
import { DiamondEducationFlow } from "./DiamondEducationFlow";
import { SearchDiamondsFlow } from "./SearchDiamondsFlow";
import { EducationFlow } from "./EducationFlow";

interface MainMenuFlowProps {
  onClose?: () => void;
}

type MenuState = 'main' | 'design_ring' | 'search_diamonds' | 'education' | 'upload_quote';

export function MainMenuFlow({ onClose }: MainMenuFlowProps) {
  const [currentState, setCurrentState] = useState<MenuState>('main');

  const renderMainMenu = () => (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6 max-w-2xl mx-auto">
      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="text-xl sm:text-2xl flex-shrink-0">👋</div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base text-gray-700">
                <span className="font-medium">Hello, I am MAZAL</span>, and I'm here to assist you in finding the perfect diamond.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                💎 Using our service, you can easily search for diamonds that match your criteria by simply typing your requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Options */}
      <div className="space-y-3 sm:space-y-4">
        <Button
          onClick={() => setCurrentState('upload_quote')}
          className="w-full h-12 sm:h-14 bg-green-600 hover:bg-green-700 text-white text-left justify-start px-3 sm:px-4"
          size="lg"
        >
          <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
          <span className="text-sm sm:text-base">Upload Existing Jewelry to Get Quote</span>
        </Button>

        <Button
          onClick={() => setCurrentState('design_ring')}
          className="w-full h-12 sm:h-14 bg-green-600 hover:bg-green-700 text-white text-left justify-start px-3 sm:px-4"
          size="lg"
        >
          <div className="text-base sm:text-lg mr-2 sm:mr-3 flex-shrink-0">💍</div>
          <span className="text-sm sm:text-base">Design Ring with AI</span>
        </Button>

        <Button
          onClick={() => setCurrentState('search_diamonds')}
          className="w-full h-12 sm:h-14 bg-green-600 hover:bg-green-700 text-white text-left justify-start px-3 sm:px-4"
          size="lg"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
          <span className="text-sm sm:text-base">Search Query</span>
        </Button>

        <Button
          onClick={() => setCurrentState('education')}
          className="w-full h-12 sm:h-14 bg-green-600 hover:bg-green-700 text-white text-left justify-start px-3 sm:px-4"
          size="lg"
        >
          <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
          <span className="text-sm sm:text-base">Education - The 4 Cs</span>
        </Button>
      </div>
    </div>
  );

  const renderUploadQuote = () => (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6 max-w-2xl mx-auto">
      <Button
        onClick={() => setCurrentState('main')}
        variant="outline"
        className="mb-4"
        size="sm"
      >
        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="text-xs sm:text-sm">Back to Main Menu</span>
      </Button>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3 sm:p-4">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Upload Your Jewelry</h3>
          <p className="text-xs sm:text-sm text-blue-700">
            Take a photo of your existing jewelry to get an instant quote and professional appraisal.
          </p>
        </CardContent>
      </Card>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
        <Upload className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
        <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Click to upload or drag and drop your jewelry photo</p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-4 sm:px-6">
          Choose Photo
        </Button>
      </div>
    </div>
  );

  // Render based on current state
  switch (currentState) {
    case 'design_ring':
      return <DiamondEducationFlow onBack={() => setCurrentState('main')} />;
    case 'search_diamonds':
      return <SearchDiamondsFlow onBack={() => setCurrentState('main')} />;
    case 'education':
      return <EducationFlow onBack={() => setCurrentState('main')} />;
    case 'upload_quote':
      return renderUploadQuote();
    default:
      return renderMainMenu();
  }
}
