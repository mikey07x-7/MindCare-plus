import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function AboutPage({ darkMode }: { darkMode:boolean }) {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className={`text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>About MindCare+ NEXUS</h1>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 mb-6`}>
          <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>MindCare+ NEXUS is a mental wellbeing platform designed for students...</p>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 mb-6`}>
          <h2 className="text-2xl font-bold mb-2">Key Features</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3"><CheckCircle2 /> Mental Assessment</li>
            <li className="flex items-start gap-3"><CheckCircle2 /> 24/7 AI Chatbot</li>
            <li className="flex items-start gap-3"><CheckCircle2 /> Personalized Exercises</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
