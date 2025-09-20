import { ChatInterface } from "@/components/chat/ChatInterface";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-3 p-4 border-b bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-semibold text-lg">Diamond Chat</h1>
      </header>

      <div className="flex-1 overflow-hidden">
        <ChatInterface className="h-full" />
      </div>
    </div>
  );
}