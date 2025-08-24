
// Re-export the optimized context as the main context for backward compatibility
export { 
  OptimizedTelegramAuthProvider as TelegramAuthProvider,
  useOptimizedTelegramAuthContext as useTelegramAuth 
} from './OptimizedTelegramAuthContext';
