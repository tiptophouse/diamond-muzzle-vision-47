import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ToastMessageProps {
  title: string;
  description?: string;
}

export function showSuccessToast({ title, description }: ToastMessageProps) {
  const { toast } = useToast();
  
  return toast({
    title,
    description,
    className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
    action: <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />,
  });
}

export function showErrorToast({ title, description }: ToastMessageProps) {
  const { toast } = useToast();
  
  return toast({
    title,
    description,
    variant: "destructive",
    action: <AlertCircle className="h-4 w-4" />,
  });
}