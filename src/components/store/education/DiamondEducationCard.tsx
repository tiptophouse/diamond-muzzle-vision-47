
import { useState } from "react";
import { Heart, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Diamond } from "@/components/inventory/InventoryTable";

interface DiamondEducationCardProps {
  diamond: Diamond;
}

const EDUCATIONAL_TIPS = {
  carat: "Carat refers to the weight of the diamond. One carat equals 200 milligrams. Larger diamonds are rarer and more valuable.",
  color: "Diamond color grades from D (colorless) to Z (light yellow). Colorless diamonds are most rare and valuable.",
  clarity: "Clarity measures internal inclusions and external blemishes. FL (Flawless) is the highest grade.",
  cut: "Cut affects how light reflects through the diamond, determining its brilliance and sparkle."
};

export function DiamondEducationCard({ diamond }: DiamondEducationCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedTip, setSelectedTip] = useState<keyof typeof EDUCATIONAL_TIPS | null>(null);

  const diamondImageUrl = diamond.imageUrl || 
    `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center`;

  const getGradeExplanation = (category: string, grade: string) => {
    const explanations = {
      color: {
        'D': 'Absolutely colorless - the highest grade',
        'E': 'Colorless - traces not visible to trained eye',
        'F': 'Colorless - slight traces detectable by expert',
        'G': 'Near colorless - color noticeable when compared',
        'H': 'Near colorless - slightly detectable color',
        'I': 'Near colorless - color slightly detectable',
        'J': 'Near colorless - color easily detectable'
      },
      clarity: {
        'FL': 'Flawless - no inclusions or blemishes',
        'IF': 'Internally Flawless - no inclusions visible',
        'VVS1': 'Very Very Slightly Included - extremely difficult to see',
        'VVS2': 'Very Very Slightly Included - very difficult to see',
        'VS1': 'Very Slightly Included - difficult to see',
        'VS2': 'Very Slightly Included - somewhat difficult to see',
        'SI1': 'Slightly Included - easy to see under magnification',
        'SI2': 'Slightly Included - very easy to see under magnification'
      }
    };
    
    return explanations[category as keyof typeof explanations]?.[grade as keyof typeof explanations[typeof category]] || 
           `${grade} grade in ${category}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group relative">
      {/* Educational Badge */}
      <div className="absolute top-2 left-2 z-10">
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1">
          <BookOpen className="h-3 w-3 mr-1" />
          Learn
        </Badge>
      </div>

      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {!imageError ? (
          <img
            src={diamondImageUrl}
            alt={`${diamond.shape} Diamond - Educational`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        )}
        
        {/* Action Icons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className={`w-8 h-8 rounded-full bg-white/90 hover:bg-white ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Educational Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="text-xs font-medium text-gray-900 mb-1">
              🎓 Learning Opportunity
            </div>
            <div className="text-xs text-gray-600">
              Discover the 4 C's of this {diamond.shape} diamond
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          Learn About: {diamond.carat} Carat {diamond.color}-{diamond.clarity} {diamond.shape} Diamond
        </h3>

        {/* Educational Quick Facts */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <Dialog open={selectedTip === 'carat'} onOpenChange={(open) => setSelectedTip(open ? 'carat' : null)}>
            <DialogTrigger asChild>
              <button className="text-left p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="text-gray-500 mb-1">Carat Weight</div>
                <div className="font-medium text-blue-700">{diamond.carat} ct</div>
                <div className="text-xs text-blue-600 mt-1">Learn more →</div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Understanding Carat Weight</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-gray-600">{EDUCATIONAL_TIPS.carat}</p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-blue-900">This Diamond: {diamond.carat} Carats</div>
                  <div className="text-sm text-blue-700">
                    Weight: {(diamond.carat * 200).toFixed(0)} milligrams
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={selectedTip === 'color'} onOpenChange={(open) => setSelectedTip(open ? 'color' : null)}>
            <DialogTrigger asChild>
              <button className="text-left p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="text-gray-500 mb-1">Color Grade</div>
                <div className="font-medium text-green-700">{diamond.color}</div>
                <div className="text-xs text-green-600 mt-1">Learn more →</div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Understanding Color Grades</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-gray-600">{EDUCATIONAL_TIPS.color}</p>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-green-900">This Diamond: Grade {diamond.color}</div>
                  <div className="text-sm text-green-700">
                    {getGradeExplanation('color', diamond.color)}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={selectedTip === 'clarity'} onOpenChange={(open) => setSelectedTip(open ? 'clarity' : null)}>
            <DialogTrigger asChild>
              <button className="text-left p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="text-gray-500 mb-1">Clarity</div>
                <div className="font-medium text-purple-700">{diamond.clarity}</div>
                <div className="text-xs text-purple-600 mt-1">Learn more →</div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Understanding Clarity Grades</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-gray-600">{EDUCATIONAL_TIPS.clarity}</p>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="font-medium text-purple-900">This Diamond: {diamond.clarity}</div>
                  <div className="text-sm text-purple-700">
                    {getGradeExplanation('clarity', diamond.clarity)}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={selectedTip === 'cut'} onOpenChange={(open) => setSelectedTip(open ? 'cut' : null)}>
            <DialogTrigger asChild>
              <button className="text-left p-2 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="text-gray-500 mb-1">Cut Quality</div>
                <div className="font-medium text-orange-700">{diamond.cut}</div>
                <div className="text-xs text-orange-600 mt-1">Learn more →</div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Understanding Cut Quality</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-gray-600">{EDUCATIONAL_TIPS.cut}</p>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="font-medium text-orange-900">This Diamond: {diamond.cut} Cut</div>
                  <div className="text-sm text-orange-700">
                    Determines the diamond's brilliance and fire
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stock Number */}
        <div className="text-xs text-gray-500 border-t pt-2">
          Reference #{diamond.stockNumber}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-900 mb-1">
            Want to see pricing and availability?
          </div>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
            <Sparkles className="h-4 w-4 mr-2" />
            Unlock Professional Access
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
