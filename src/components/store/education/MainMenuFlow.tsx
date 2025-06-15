
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Gem, Search, GraduationCap, ArrowLeft } from "lucide-react";
import { DiamondEducationFlow } from "./DiamondEducationFlow";

interface MainMenuFlowProps {
  onClose?: () => void;
}

type MenuState = 'main' | 'design_ring' | 'search_diamonds' | 'education' | 'upload_quote';

export function MainMenuFlow({ onClose }: MainMenuFlowProps) {
  const [currentState, setCurrentState] = useState<MenuState>('main');

  const renderMainMenu = () => (
    <div className="space-y-4 p-6">
      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">👋</div>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Hello, I am MAZAL</span>, and I'm here to assist you in finding the perfect diamond.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                💎 Using our service, you can easily search for diamonds that match your criteria by simply typing your requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Options */}
      <div className="space-y-3">
        <Button
          onClick={() => setCurrentState('upload_quote')}
          className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-left justify-start px-4"
          size="lg"
        >
          <Upload className="h-5 w-5 mr-3" />
          <span className="text-base">Upload Existing Jewelry to Get Quote</span>
        </Button>

        <Button
          onClick={() => setCurrentState('design_ring')}
          className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-left justify-start px-4"
          size="lg"
        >
          <div className="text-lg mr-3">💍</div>
          <span className="text-base">Design Ring with AI</span>
        </Button>

        <Button
          onClick={() => setCurrentState('search_diamonds')}
          className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-left justify-start px-4"
          size="lg"
        >
          <Search className="h-5 w-5 mr-3" />
          <span className="text-base">Just Search for Diamond</span>
        </Button>

        <Button
          onClick={() => setCurrentState('education')}
          className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-left justify-start px-4"
          size="lg"
        >
          <GraduationCap className="h-5 w-5 mr-3" />
          <span className="text-base">Education - The 4 Cs</span>
        </Button>
      </div>
    </div>
  );

  const renderUploadQuote = () => (
    <div className="space-y-4 p-6">
      <Button
        onClick={() => setCurrentState('main')}
        variant="outline"
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Main Menu
      </Button>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Upload Your Jewelry</h3>
          <p className="text-sm text-blue-700">
            Take a photo of your existing jewelry to get an instant quote and professional appraisal.
          </p>
        </CardContent>
      </Card>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Click to upload or drag and drop your jewelry photo</p>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Choose Photo
        </Button>
      </div>
    </div>
  );

  const renderSearchDiamonds = () => (
    <div className="space-y-4 p-6">
      <Button
        onClick={() => setCurrentState('main')}
        variant="outline"
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Main Menu
      </Button>
      
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-xl">🔍</div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Search Diamonds</h3>
              <p className="text-sm text-green-700">
                Here you can write the diamond you're looking for. 💎
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button
        onClick={() => setCurrentState('main')}
        className="w-full h-12 bg-green-600 hover:bg-green-700"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Main Menu
      </Button>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-700">
            Now you can look for diamonds 💎 in natural language 🌐. You can type whatever you want ✍️.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-4 p-6">
      <Button
        onClick={() => setCurrentState('main')}
        variant="outline"
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Main Menu
      </Button>
      
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-xl">🎓</div>
            <div>
              <h3 className="font-semibold text-purple-900 mb-1">Education Section</h3>
              <p className="text-sm text-purple-700">
                Choose a category to learn more: 🎓
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white justify-start px-4">
          <div className="text-lg mr-3">🖼️</div>
          <span>Image</span>
        </Button>
        
        <Button className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-white justify-start px-4">
          <div className="text-lg mr-3">✨</div>
          <span>Clarity</span>
        </Button>
        
        <Button className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white justify-start px-4">
          <div className="text-lg mr-3">💎</div>
          <span>Cuts</span>
        </Button>
        
        <Button className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white justify-start px-4">
          <div className="text-lg mr-3">🌸</div>
          <span>Ct</span>
        </Button>
        
        <Button className="w-full h-12 bg-gray-600 hover:bg-gray-700 text-white justify-start px-4">
          <div className="text-lg mr-3">➕</div>
          <span>Additional</span>
        </Button>
      </div>
      
      <Button
        onClick={() => setCurrentState('main')}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 mt-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Main Menu
      </Button>
    </div>
  );

  // Render based on current state
  switch (currentState) {
    case 'design_ring':
      return <DiamondEducationFlow />;
    case 'upload_quote':
      return renderUploadQuote();
    case 'search_diamonds':
      return renderSearchDiamonds();
    case 'education':
      return renderEducation();
    default:
      return renderMainMenu();
  }
}
