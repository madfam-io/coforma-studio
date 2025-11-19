export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Coforma Studio
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Advisory-as-a-Service Platform for Customer Advisory Boards
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">🚀 Getting Started</h2>
            <p className="text-gray-600">
              The infrastructure is ready. Implementation is in progress.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">📖 Documentation</h2>
            <p className="text-gray-600">
              Check the README.md and docs/ directory for more information.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
