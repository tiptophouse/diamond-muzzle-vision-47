
import { BookOpen, Gem, GraduationCap, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EducationalStoreHeaderProps {
  totalDiamonds: number;
}

export function EducationalStoreHeader({ totalDiamonds }: EducationalStoreHeaderProps) {
  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-start justify-between gap-4">
          {/* Main Content */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg flex-shrink-0">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Diamond Learning Center
                </h1>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  Free Education
                </Badge>
              </div>
              <p className="text-base text-gray-600">
                Explore and learn about <span className="font-medium">{totalDiamonds}</span> premium diamonds
                <span className="hidden sm:inline"> • Discover the 4 C's • Build your expertise</span>
              </p>
            </div>
          </div>
          
          {/* Upgrade CTA */}
          <div className="flex-shrink-0">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              <Crown className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Upgrade to Pro</span>
              <span className="sm:hidden">Upgrade</span>
            </Button>
          </div>
        </div>

        {/* Educational Features Row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900 text-sm">Interactive Learning</div>
              <div className="text-xs text-gray-600">Tap any diamond attribute to learn</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
            <Gem className="h-5 w-5 text-pink-600" />
            <div>
              <div className="font-medium text-gray-900 text-sm">Expert Knowledge</div>
              <div className="text-xs text-gray-600">Professional diamond insights</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
            <Users className="h-5 w-5 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900 text-sm">Trusted by Thousands</div>
              <div className="text-xs text-gray-600">Join our learning community</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
