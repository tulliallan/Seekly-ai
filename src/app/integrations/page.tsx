import { DiscordIntegration } from '../components/DiscordIntegration';

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white mb-6">Integrations</h1>
        <DiscordIntegration />
        {/* Add other integrations here */}
      </div>
    </div>
  );
} 