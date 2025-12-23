'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-grid-pattern flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-ind-text mb-4 uppercase tracking-wider">
          Code<span className="text-ind-accent">Ref</span>
          <br />
          Dashboard
        </h1>
        <p className="text-ind-text-muted text-lg font-mono mb-8">
          Loading widgets...
        </p>
        <div className="inline-flex gap-2">
          <div className="w-2 h-2 bg-ind-accent rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-ind-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-ind-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
