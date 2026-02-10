'use client';

import { useStore } from '@/store';

export default function Home() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-white rounded-lg shadow-lg p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Welcome to <span className="text-sky-600">Agente Tritutario</span>
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            AI-powered tax guidance platform for the Reforma Tributária. Helping Brazilian entrepreneurs understand and navigate tax changes with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-8 rounded-lg transition">
              Get Started
            </button>
            <button className="border-2 border-sky-600 text-sky-600 hover:bg-sky-50 font-semibold py-3 px-8 rounded-lg transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">AI-Powered</h3>
          <p className="text-slate-600">
            Get intelligent insights and personalized recommendations powered by advanced AI.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Analysis</h3>
          <p className="text-slate-600">
            Analyze your tax situation and understand the impact of Reforma Tributária.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Secure</h3>
          <p className="text-slate-600">
            Your data is protected with enterprise-grade security and LGPD compliance.
          </p>
        </div>
      </section>

      {/* Counter Demo (Zustand) */}
      <section className="bg-white rounded-lg shadow p-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">State Management Demo</h3>
        <p className="text-slate-600 mb-6">
          This counter demonstrates Zustand state management working in the Next.js app.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => increment()}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Increment
          </button>
          <span className="text-2xl font-bold text-sky-600">Count: {count}</span>
        </div>
      </section>
    </div>
  );
}
