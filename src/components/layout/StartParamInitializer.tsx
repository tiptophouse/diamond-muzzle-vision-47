import { useStartParamRouter } from '@/hooks/useStartParamRouter';

/**
 * Component that initializes start parameter routing
 * Should be rendered at the top level of the app
 */
export function StartParamInitializer() {
  useStartParamRouter();
  return null;
}