export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AgentPipe Web</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Realtime Multi-Agent Conversation Dashboard
        </p>
      </header>

      <main className="grid gap-6">
        <section className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Live Conversations</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Active conversations will appear here in realtime.
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Metrics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Conversations</div>
              <div className="text-2xl font-bold">0</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Agents</div>
              <div className="text-2xl font-bold">0</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tokens</div>
              <div className="text-2xl font-bold">0</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Cost</div>
              <div className="text-2xl font-bold">$0.00</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
