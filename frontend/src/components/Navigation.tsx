import React from 'react';
import { Brain, Menu, X, Sun, Moon, Home, LayoutDashboard, MessageSquare, User, ChevronRight } from 'lucide-react';

type Props = {
  darkMode: boolean;
  setDarkMode: (v:boolean) => void;
  setCurrentPage: (p:string) => void;
  setShowMentalState?: (v:boolean) => void;
};

export default function Navigation({ darkMode, setDarkMode, setCurrentPage, setShowMentalState }: Props) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <nav className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('main')}>
          <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-gradient-to-br from-cyan-500 to-purple-600' : 'bg-gradient-to-br from-cyan-400 to-purple-500'} flex items-center justify-center`}>
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mind<span className="text-cyan-500">care+</span></h1>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Student mental wellbeing</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => setCurrentPage('main')} className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>HOME</button>
          <button onClick={() => setCurrentPage('dashboard')} className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>DASHBOARD</button>
          <button onClick={() => setShowMentalState && setShowMentalState(true)} className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>MENTAL STATE</button>
          <button onClick={() => setCurrentPage('account')} className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ACCOUNT</button>
          <button onClick={() => setCurrentPage('about')} className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ABOUT</button>
          <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="md:hidden">
          <button onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={24} className="text-white" /> : <Menu size={24} className={darkMode ? 'text-white' : 'text-gray-900'} />}</button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="space-y-2">
            <button className="block w-full text-left py-2 px-4 rounded" onClick={() => { setCurrentPage('main'); setMobileOpen(false); }}>HOME</button>
            <button className="block w-full text-left py-2 px-4 rounded" onClick={() => { setCurrentPage('dashboard'); setMobileOpen(false); }}>DASHBOARD</button>
            <button className="block w-full text-left py-2 px-4 rounded" onClick={() => { setShowMentalState && setShowMentalState(true); setMobileOpen(false); }}>MENTAL STATE</button>
            <button className="block w-full text-left py-2 px-4 rounded" onClick={() => { setCurrentPage('account'); setMobileOpen(false); }}>ACCOUNT</button>
            <button className="block w-full text-left py-2 px-4 rounded" onClick={() => { setCurrentPage('about'); setMobileOpen(false); }}>ABOUT</button>
          </div>
        </div>
      )}
    </nav>
  );
}
