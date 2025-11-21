import { TestSubscriptionEndpoint } from '@/components/debug/TestSubscriptionEndpoint';

export default function SubscriptionTestPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Subscription Endpoint Testing</h1>
        <p className="text-sm text-muted-foreground">
          Test the FastAPI subscription endpoint with bearer token authentication
        </p>
      </div>
      
      <TestSubscriptionEndpoint />
    </div>
  );
}
