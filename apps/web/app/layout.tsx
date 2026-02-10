import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agente Tritutario - Tax Guidance for Brazil',
  description: 'AI-powered tax guidance platform for the Reforma Tributária',
  keywords: ['tax', 'Brazil', 'Reforma Tributária', 'MEI', 'PJ', 'tributação'],
  authors: [{ name: 'Agente Tritutario Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-slate-200 shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AT</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900">Agente Tritutario</h1>
              </div>
              <div className="text-sm text-slate-600">
                Tax Guidance Platform
              </div>
            </nav>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          <footer className="bg-slate-900 text-slate-100 py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm">
                © 2026 Agente Tritutario. All rights reserved.
              </p>
              <p className="text-center text-xs text-slate-400 mt-2">
                Platform for Brazilian tax guidance during the Reforma Tributária
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
