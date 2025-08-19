import React from 'react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import ParticlesBackground from './components/Particles';
import logo from '../logo.png'
function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" toastOptions={{
        success: { style: { background: 'white', color: '#16a34a' } },
        error: { style: { background: 'white', color: '#dc2626' } },
      }} />

      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-4">
          <img src={logo} alt="Aieera Automation Logo" className="h-10 w-auto" />
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Aieera Automation</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Dashboard />
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} <a href="https://www.aieera.com">Aieera Automation. </a>All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;