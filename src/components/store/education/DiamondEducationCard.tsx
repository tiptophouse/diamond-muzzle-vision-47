
import { useState } from "react";
import { BookOpen, Gem, Eye, Heart, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Diamond } from "@/components/inventory/InventoryTable";

interface DiamondEducationCardProps {
  diamond: Diamond;
}

// Define the education content with proper typing
const educationContent = {
  color: {
    D: "Colorless - The highest grade, completely colorless and very rare",
    E: "Colorless - Extremely rare, no color visible to the naked eye", 
    F: "Colorless - Rare, no color visible to the naked eye",
    G: "Near Colorless - Excellent value, slight color only visible when compared to higher grades",
    H: "Near Colorless - Good value, slight warmth may be visible in larger stones",
    I: "Near Colorless - Noticeable color in larger stones, good for smaller diamonds",
    J: "Near Colorless - Noticeable warm color, best in yellow gold settings"
  } as Record<string, string>,
  clarity: {
    FL: "Flawless - No inclusions or blemishes visible under 10x magnification",
    IF: "Internally Flawless - No inclusions visible under 10x magnification",
    VVS1: "Very Very Slightly Included - Minute inclusions very difficult to see under 10x",
    VVS2: "Very Very Slightly Included - Minute inclusions difficult to see under 10x", 
    VS1: "Very Slightly Included - Minor inclusions visible under 10x magnification",
    VS2: "Very Slightly Included - Minor inclusions somewhat easily visible under 10x",
    SI1: "Slightly Included - Inclusions visible under 10x, may be visible to naked eye",
    SI2: "Slightly Included - Inclusions easily visible under 10x, often visible to naked eye"
  } as Record<string, string>
};

export function DiamondEducationCard({ diamond }: DiamondEducationCardProps) {
  const [imageError, setImageError] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<{type: string, content: string} | null>(null);

  const diamondImageUrl = diamond.imageUrl || 
    `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center`;

  const getEducationContent = (type: 'color' | 'clarity', value: string) => {
    return educationContent[type][value] || `Learn about ${value} grade diamonds`;
  };

  return (
    <div className="bg-white border border-purple-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group relative">
      {/* Educational Badge */}
      <div className="absolute top-2 left-2 z-20">
        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1">
          LEARN
        </Badge>
      </div>

      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
        {!imageError ? (
          <img
            src={diamondImageUrl}
            alt={`${diamond.shape} Diamond`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <Gem className="h-12 w-12 text-purple-600" />
            </div>
          </div>
        )}
        
        {/* Educational Action Icons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-purple-600"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-purple-600"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-purple-600"
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>

        {/* Educational Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-900">Educational</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          Learn: {diamond.carat} Carat {diamond.color}-{diamond.clarity} {diamond.cut} Cut {diamond.shape} Diamond
        </h3>

        {/* Educational Price Placeholder */}
        <div className="text-lg font-bold text-purple-600">
          Educational Sample
        </div>

        {/* Interactive Learning Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Dialog>
            <DialogTrigger asChild>
              <button 
                className="text-center p-2 bg-purple-50 hover:bg-purple-100 rounded transition-colors cursor-pointer"
                onClick={() => setSelectedEducation({
                  type: 'Carat Weight',
                  content: `${diamond.carat} carats represents the weight of this diamond. One carat equals 200 milligrams. Larger carats are rarer and more valuable.`
                })}
              >
                <div className="text-purple-600">Carat</div>
                <div className="font-medium">{diamond.carat}</div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Understanding Carat Weight</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>{diamond.carat} carats represents the weight of this diamond. One carat equals 200 milligrams.</p>
                <p>Larger carats are rarer and more valuable, but remember that carat is just one of the 4 C's that determine a diamond's beauty and value.</p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <button 
                className="text-center p-2 bg-pink-50 hover:bg-pink-100 rounded transition-colors cursor-pointer"
                onClick={() => setSelectedEducation({
                  type: 'Color Grade',
                  content: getEducationContent('color', diamond.color)
                })}
              >
                <div className="text-pink-600">Color</div>
                <div className="font-medium">{diamond.color}</div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Color Grade: {diamond.color}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>{getEducationContent('color', diamond.color)}</p>
                <p>Diamond color is graded from D (colorless) to Z (light yellow or brown). The closer to colorless, the rarer and more valuable the diamond.</p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <button 
                className="text-center p-2 bg-purple-50 hover:bg-purple-100 rounded transition-colors cursor-pointer"
                onClick={() => setSelectedEducation({
                  type: 'Clarity Grade',
                  content: getEducationContent('clarity', diamond.clarity)
                })}
              >
                <div className="text-purple-600">Clarity</div>
                <div className="font-medium">{diamond.clarity}</div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clarity Grade: {diamond.clarity}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>{getEducationContent('clarity', diamond.clarity)}</p>
                <p>Clarity refers to the absence of inclusions and blemishes. Most inclusions are not visible to the naked eye unless magnified.</p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <button 
                className="text-center p-2 bg-pink-50 hover:bg-pink-100 rounded transition-colors cursor-pointer"
                onClick={() => setSelectedEducation({
                  type: 'Cut Quality',
                  content: `${diamond.cut} cut determines how well the diamond reflects light. A well-cut diamond will have superior brightness, fire, and scintillation.`
                })}
              >
                <div className="text-pink-600">Cut</div>
                <div className="font-medium text-xs">{diamond.cut.slice(0, 4)}</div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cut Quality: {diamond.cut}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>{diamond.cut} cut determines how well the diamond reflects light.</p>
                <p>Cut is often considered the most important of the 4 C's because it has the greatest impact on a diamond's beauty and sparkle.</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stock Number */}
        <div className="text-xs text-gray-500 border-t pt-2">
          Sample #{diamond.stockNumber}
        </div>

        {/* Educational CTA */}
        <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
          💡 Tap any attribute above to learn more about diamond grading
        </div>

        {/* Upgrade CTA */}
        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
          See Pricing & Buy Similar
        </Button>
      </div>
    </div>
  );
}
