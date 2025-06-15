
import { Diamond as DiamondIcon, BookOpen, Lightbulb, Award } from "lucide-react";
import { ShapeSelector } from "../ShapeSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DiamondLearningFiltersProps {
  filters: {
    shapes: string[];
    colors: string[];
    clarities: string[];
    caratRange: [number, number];
    priceRange: [number, number];
  };
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
  diamonds: any[];
}

const COLOR_EDUCATION = {
  'D': { label: 'D - Colorless', tip: 'Absolutely colorless, the highest grade' },
  'E': { label: 'E - Colorless', tip: 'Colorless with traces not visible to trained eye' },
  'F': { label: 'F - Colorless', tip: 'Colorless with slight traces detectable by expert' },
  'G': { label: 'G - Near Colorless', tip: 'Color noticeable when compared to higher grades' },
  'H': { label: 'H - Near Colorless', tip: 'Slightly detectable color' },
  'I': { label: 'I - Near Colorless', tip: 'Color slightly detectable' },
  'J': { label: 'J - Near Colorless', tip: 'Color easily detectable' }
};

const CLARITY_EDUCATION = {
  'FL': { label: 'FL - Flawless', tip: 'No inclusions or blemishes visible' },
  'IF': { label: 'IF - Internally Flawless', tip: 'No inclusions visible under 10x magnification' },
  'VVS1': { label: 'VVS1 - Very Very Slightly Included', tip: 'Extremely difficult to see inclusions' },
  'VVS2': { label: 'VVS2 - Very Very Slightly Included', tip: 'Very difficult to see inclusions' },
  'VS1': { label: 'VS1 - Very Slightly Included', tip: 'Difficult to see inclusions' },
  'VS2': { label: 'VS2 - Very Slightly Included', tip: 'Somewhat difficult to see inclusions' },
  'SI1': { label: 'SI1 - Slightly Included', tip: 'Easy to see under magnification' },
  'SI2': { label: 'SI2 - Slightly Included', tip: 'Very easy to see under magnification' }
};

export function DiamondLearningFilters({ 
  filters, 
  onUpdateFilter, 
  onClearFilters, 
  diamonds
}: DiamondLearningFiltersProps) {
  const activeFiltersCount = 
    filters.shapes.length + 
    filters.colors.length + 
    filters.clarities.length;

  const toggleFilter = (type: string, value: string) => {
    const currentValues = filters[type as keyof typeof filters] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onUpdateFilter(type, newValues);
  };

  // Get unique values from diamonds
  const uniqueColors = [...new Set(diamonds.map(d => d.color))].sort();
  const uniqueClarities = [...new Set(diamonds.map(d => d.clarity))].sort();

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Learn While You Filter</h2>
            <p className="text-sm text-gray-600">Discover diamond characteristics as you explore</p>
          </div>
        </div>
        
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {activeFiltersCount} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Educational Info Box */}
      <div className="mb-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border border-purple-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <div className="font-medium text-purple-900 mb-1">💡 Learning Tip</div>
            <div className="text-sm text-purple-800">
              Each filter teaches you about diamond quality factors. Click on any grade to learn what it means!
            </div>
          </div>
        </div>
      </div>

      {/* Shape Filter */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <DiamondIcon className="h-4 w-4 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Diamond Shapes</h3>
          <Badge variant="outline" className="text-xs">Learn About Cut Styles</Badge>
        </div>
        <ShapeSelector
          selectedShapes={filters.shapes}
          onShapeToggle={(shape) => toggleFilter('shapes', shape)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Color Filter */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-gradient-to-r from-yellow-200 to-yellow-50 rounded border"></div>
            <h3 className="font-semibold text-gray-900">Color Grades</h3>
            <Badge variant="outline" className="text-xs">D = Best</Badge>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-gray-600 mb-3 bg-blue-50 p-2 rounded">
              💡 Lower letters = more colorless = more valuable
            </div>
            <div className="grid grid-cols-2 gap-2">
              {uniqueColors.map((color) => {
                const isSelected = filters.colors.includes(color);
                const colorInfo = COLOR_EDUCATION[color as keyof typeof COLOR_EDUCATION];
                
                return (
                  <button
                    key={color}
                    onClick={() => toggleFilter('colors', color)}
                    className={`p-3 rounded-lg border text-left transition-all group ${
                      isSelected 
                        ? 'bg-blue-100 border-blue-300 text-blue-900' 
                        : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {colorInfo ? colorInfo.label : `Grade ${color}`}
                    </div>
                    {colorInfo && (
                      <div className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors">
                        {colorInfo.tip}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clarity Filter */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-4 w-4 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Clarity Grades</h3>
            <Badge variant="outline" className="text-xs">FL = Perfect</Badge>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-gray-600 mb-3 bg-green-50 p-2 rounded">
              💎 Measures internal inclusions and surface blemishes
            </div>
            <div className="grid grid-cols-1 gap-2">
              {uniqueClarities.map((clarity) => {
                const isSelected = filters.clarities.includes(clarity);
                const clarityInfo = CLARITY_EDUCATION[clarity as keyof typeof CLARITY_EDUCATION];
                
                return (
                  <button
                    key={clarity}
                    onClick={() => toggleFilter('clarities', clarity)}
                    className={`p-3 rounded-lg border text-left transition-all group ${
                      isSelected 
                        ? 'bg-green-100 border-green-300 text-green-900' 
                        : 'bg-white border-gray-200 hover:border-green-200 hover:bg-green-50'
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {clarityInfo ? clarityInfo.label : `Grade ${clarity}`}
                    </div>
                    {clarityInfo && (
                      <div className="text-xs text-gray-600 group-hover:text-green-600 transition-colors">
                        {clarityInfo.tip}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade CTA at bottom */}
      <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium mb-1">Ready for Professional Tools?</div>
            <div className="text-sm text-purple-100">Get price ranges, advanced filters, and inventory access</div>
          </div>
          <Button variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
}
