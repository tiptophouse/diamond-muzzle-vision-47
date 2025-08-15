
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Diamond, 
  TrendingUp, 
  Users, 
  Clock, 
  Shield, 
  FileText, 
  Calendar,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';

interface CountdownTimer {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function InvestmentPage() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState<CountdownTimer>({ hours: 72, minutes: 0, seconds: 0 });
  const [currentUsers] = useState(49);
  const [hasSignedNDA, setHasSignedNDA] = useState(false);
  const [showLegalGateway, setShowLegalGateway] = useState(false);
  const [isSchedulingMeeting, setIsSchedulingMeeting] = useState(false);

  // 72-hour countdown timer
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + 72);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          hours: Math.floor(distance / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleExpressInterest = () => {
    setShowLegalGateway(true);
    toast({
      title: "Interest Recorded",
      description: "Please review and sign the legal agreements to proceed.",
    });
  };

  const handleSignNDA = async () => {
    // Simulate NDA signing process
    setHasSignedNDA(true);
    toast({
      title: "NDA Signed Successfully",
      description: "You can now schedule a meeting to discuss investment details.",
    });
  };

  const handleScheduleMeeting = () => {
    setIsSchedulingMeeting(true);
    // Open Calendly in a new window
    window.open('https://calendly.com/avtipoos', '_blank');
    
    toast({
      title: "Meeting Scheduling",
      description: "Opening Calendly to schedule your investor meeting.",
    });
  };

  if (showLegalGateway && !hasSignedNDA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-2 border-blue-200 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Legal Gateway
              </CardTitle>
              <p className="text-gray-600">
                Please review and sign the required legal agreements to proceed
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Non-Disclosure Agreement (NDA)
                </h3>
                <p className="text-sm text-amber-700 mb-4">
                  This agreement ensures that all confidential information shared during the investment process remains protected.
                </p>
                <div className="space-y-2 text-sm text-amber-700">
                  <p>• Confidentiality of business information</p>
                  <p>• Protection of proprietary technology</p>
                  <p>• Non-disclosure of financial data</p>
                  <p>• Investment terms confidentiality</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Non-Compete Agreement
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  This agreement prevents the creation of competing diamond trading platforms during the investment process.
                </p>
                <div className="space-y-2 text-sm text-red-700">
                  <p>• No competing platform development</p>
                  <p>• Protection of business model</p>
                  <p>• Exclusive discussion period</p>
                  <p>• Market protection clause</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleSignNDA}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  I Agree - Sign Legal Agreements
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowLegalGateway(false)}
                  className="w-full"
                >
                  Back to Investment Overview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (hasSignedNDA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-2 border-green-200 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Schedule Investment Meeting
              </CardTitle>
              <p className="text-green-600 font-medium">
                ✅ Legal agreements completed successfully
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 mb-4 text-lg">
                  🎉 Welcome to BrilliantBot Investment Opportunity
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">📊 Current Metrics</h4>
                    <div className="space-y-1 text-sm">
                      <p>• {currentUsers} premium users ($50/month)</p>
                      <p>• Lifetime pricing locked vs $75 standard</p>
                      <p>• AI-powered diamond matching technology</p>
                      <p>• 24/7 group monitoring system</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🚀 Investment Opportunity</h4>
                    <div className="space-y-1 text-sm">
                      <p>• Seeking 3-15% equity investment</p>
                      <p>• Scaling diamond trading platform</p>
                      <p>• Revolutionary AI matching system</p>
                      <p>• Global diamond industry disruption</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Ready to discuss the opportunity?
                </h3>
                <p className="text-gray-600">
                  Schedule a confidential meeting to review our business plan, financials, and growth strategy.
                </p>
                
                <Button 
                  onClick={handleScheduleMeeting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 text-lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Meeting Now
                </Button>
                
                <p className="text-sm text-gray-500">
                  Meeting will be scheduled via Calendly - opens in new window
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">What to expect in the meeting:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>
                    <p>• Detailed business model presentation</p>
                    <p>• Financial projections and metrics</p>
                    <p>• Technology demonstration</p>
                  </div>
                  <div>
                    <p>• Market opportunity analysis</p>
                    <p>• Investment terms discussion</p>
                    <p>• Q&A session</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Urgent Header with Countdown */}
        <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-red-700 mb-2">
                  ⚡ EXCLUSIVE INVESTMENT OPPORTUNITY ⚡
                </h1>
                <p className="text-red-600 font-medium">
                  Limited Time: 72 Hours Only | Seeking Strategic Investors
                </p>
              </div>
              <div className="bg-red-100 rounded-lg p-4 border-2 border-red-200">
                <div className="text-center">
                  <p className="text-sm font-semibold text-red-700 mb-1">TIME REMAINING</p>
                  <div className="flex gap-2 text-2xl font-bold text-red-800">
                    <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span>:</span>
                    <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span>:</span>
                    <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
                  </div>
                  <p className="text-xs text-red-600">H : M : S</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Investment Pitch */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Diamond className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-gray-900">
                      BrilliantBot Revolution
                    </CardTitle>
                    <p className="text-blue-600 font-medium">
                      AI-Powered Diamond Trading Platform
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">
                    🚀 The Opportunity
                  </h3>
                  <p className="text-blue-800 mb-4 leading-relaxed">
                    Join the future of diamond trading! We're revolutionizing the $100+ billion diamond industry with AI-powered matching technology, 24/7 group monitoring, and intelligent inventory management.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-blue-700">
                        <Zap className="w-4 h-4" />
                        <strong>AI Smart Matching</strong>
                      </p>
                      <p className="flex items-center gap-2 text-blue-700">
                        <Target className="w-4 h-4" />
                        <strong>24/7 Group Monitoring</strong>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-blue-700">
                        <TrendingUp className="w-4 h-4" />
                        <strong>Automated Notifications</strong>
                      </p>
                      <p className="flex items-center gap-2 text-blue-700">
                        <Sparkles className="w-4 h-4" />
                        <strong>Smart Inventory Management</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{currentUsers}</div>
                    <div className="text-sm text-green-600">Premium Users</div>
                    <div className="text-xs text-green-500">$50/month each</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">3-15%</div>
                    <div className="text-sm text-purple-600">Equity Range</div>
                    <div className="text-xs text-purple-500">Strategic Investment</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-700">$75</div>
                    <div className="text-sm text-orange-600">Standard Price</div>
                    <div className="text-xs text-orange-500">vs $50 locked</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* User Progress */}
            <Card className="shadow-lg border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Users className="w-5 h-5" />
                  Founding Users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700">
                    {currentUsers}/100
                  </div>
                  <p className="text-sm text-green-600">
                    Premium users joined
                  </p>
                </div>
                <Progress value={(currentUsers / 100) * 100} className="h-3" />
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-sm text-green-700 text-center">
                    <strong>{100 - currentUsers} spots remaining</strong> for founding user pricing
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Investment CTA */}
            <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900">
                  Ready to Join the Revolution?
                </h3>
                <p className="text-blue-700 text-sm">
                  Secure your position in the future of diamond trading
                </p>
                <Button 
                  onClick={handleExpressInterest}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3"
                >
                  <Diamond className="w-5 h-5 mr-2" />
                  Express Investment Interest
                </Button>
                <p className="text-xs text-gray-500">
                  Subject to NDA & Non-Compete Agreement
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">
              Why Invest in BrilliantBot?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-blue-900 mb-2">Growing Market</h4>
                <p className="text-sm text-blue-700">
                  $100+ billion diamond industry ready for digital transformation
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-green-900 mb-2">AI Technology</h4>
                <p className="text-sm text-green-700">
                  Proprietary AI matching system with 24/7 monitoring capabilities
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-purple-900 mb-2">Proven Traction</h4>
                <p className="text-sm text-purple-700">
                  49 paying users with strong retention and growing demand
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Target className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h4 className="font-semibold text-orange-900 mb-2">Clear Strategy</h4>
                <p className="text-sm text-orange-700">
                  Well-defined roadmap for scaling and market expansion
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
