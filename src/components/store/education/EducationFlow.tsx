
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface EducationFlowProps {
  onBack: () => void;
}

type EducationTopic = 'main' | 'image' | 'clarity' | 'cut' | 'carat';

export function EducationFlow({ onBack }: EducationFlowProps) {
  const [currentTopic, setCurrentTopic] = useState<EducationTopic>('main');

  const renderMainEducation = () => (
    <div className="space-y-4 p-6">
      <Button
        onClick={onBack}
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
              <h3 className="font-semibold text-purple-900 mb-1">Education - The 4 Cs</h3>
              <p className="text-sm text-purple-700">
                Learn about diamond quality and characteristics. Choose a category to learn more: 🎓
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education Categories in the specified order */}
      <div className="space-y-3">
        <Button 
          onClick={() => setCurrentTopic('image')}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white justify-start px-4"
        >
          <div className="text-lg mr-3">🖼️</div>
          <span>Image (Shape)</span>
        </Button>
        
        <Button 
          onClick={() => setCurrentTopic('carat')}
          className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white justify-start px-4"
        >
          <div className="text-lg mr-3">🌸</div>
          <span>Carat (Weight)</span>
        </Button>
        
        <Button 
          onClick={() => setCurrentTopic('clarity')}
          className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-white justify-start px-4"
        >
          <div className="text-lg mr-3">✨</div>
          <span>Clarity</span>
        </Button>
        
        <Button 
          onClick={() => setCurrentTopic('cut')}
          className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white justify-start px-4"
        >
          <div className="text-lg mr-3">💎</div>
          <span>Cut</span>
        </Button>
      </div>

      {/* Business Contact Information */}
      <Card className="bg-gray-50 border-gray-200 mt-6">
        <CardContent className="p-4">
          <p className="text-sm text-gray-700 mb-3">
            *Please list in the order given in the example (left to right) – shape, weight, color, clarity. The shape must be in English. Once you have selected the diamond details, the message will be sent only to exchange members who have this diamond.
          </p>
          <p className="text-sm text-gray-700 mb-3">
            *Please note that we only trust GIA certificates that truly reflect what is inside the diamonds and provide the actual data.
          </p>
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">For any questions, feel free to contact us:</p>
            <p>📞 Phone: +972548081663</p>
            <p>🕒 Business hours: Sunday-Thursday between 9:00-17:00</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTopicContent = (topic: EducationTopic) => {
    const topicData = {
      image: {
        title: "Diamond Shape (Image)",
        icon: "🖼️",
        color: "orange",
        content: `The shape of a diamond refers to its outline when viewed from above. Popular shapes include:

• Round Brilliant - The most popular and brilliant cut
• Princess - Square shape with pointed corners  
• Emerald - Rectangular with step cuts
• Oval - Elongated round shape
• Marquise - Boat-shaped with pointed ends
• Pear - Teardrop shape
• Cushion - Square/rectangular with rounded corners
• Asscher - Square emerald cut
• Radiant - Square/rectangular with brilliant facets
• Heart - Heart-shaped romantic cut

Each shape has its own character and brilliance characteristics.`
      },
      carat: {
        title: "Carat Weight",
        icon: "🌸", 
        color: "purple",
        content: `Carat refers to the weight of a diamond. One carat equals 200 milligrams.

Key points about carat weight:
• Larger diamonds are rarer and more valuable
• Carat weight is measured to the hundredth of a carat
• A 1.00 carat diamond is significantly more valuable than two 0.50 carat diamonds
• Popular sizes: 0.25ct, 0.50ct, 0.75ct, 1.00ct, 1.50ct, 2.00ct+
• Price increases exponentially with carat weight
• Consider the finger size when choosing carat weight

Remember: Bigger isn't always better - balance size with quality.`
      },
      clarity: {
        title: "Diamond Clarity", 
        icon: "✨",
        color: "yellow",
        content: `Clarity measures the presence of inclusions and blemishes in a diamond.

Clarity grades from best to least:
• FL (Flawless) - No inclusions or blemishes visible under 10x magnification
• IF (Internally Flawless) - No inclusions, only minor surface blemishes
• VVS1, VVS2 (Very Very Slightly Included) - Minute inclusions very difficult to see
• VS1, VS2 (Very Slightly Included) - Minor inclusions visible under 10x magnification  
• SI1, SI2 (Slightly Included) - Inclusions visible under 10x magnification
• I1, I2, I3 (Included) - Inclusions visible to the naked eye

Most diamonds have small natural birthmarks called inclusions.`
      },
      cut: {
        title: "Diamond Cut",
        icon: "💎",
        color: "pink", 
        content: `Cut refers to how well a diamond's facets interact with light. It's the most important factor affecting brilliance.

Cut grades:
• Excellent - Maximum brilliance and fire
• Very Good - Superior light performance  
• Good - Above average light performance
• Fair - Below average light performance
• Poor - Minimal light performance

Cut quality factors:
• Proportions - Relationship between size, angle and shape of each facet
• Symmetry - Precision of the facet arrangement
• Polish - Smoothness of the diamond's surface

A well-cut diamond will sparkle more than a poorly cut one of higher color or clarity.`
      }
    };

    const data = topicData[topic];
    if (!data) return null;

    return (
      <div className="space-y-4 p-6">
        <Button
          onClick={() => setCurrentTopic('main')}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Education Menu
        </Button>
        
        <Card className={`bg-${data.color}-50 border-${data.color}-200`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-xl">{data.icon}</div>
              <div>
                <h3 className={`font-semibold text-${data.color}-900 mb-1`}>{data.title}</h3>
                <p className={`text-sm text-${data.color}-700 whitespace-pre-wrap`}>{data.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (currentTopic !== 'main') {
    return (
      <div className="h-full bg-gradient-to-br from-purple-50 via-white to-purple-50">
        {renderTopicContent(currentTopic)}
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {renderMainEducation()}
    </div>
  );
}
