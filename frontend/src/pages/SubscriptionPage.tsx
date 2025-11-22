import React from 'react';
import { Crown, CheckCircle2 } from 'lucide-react';

export default function SubscriptionPage({ darkMode }: { darkMode:boolean }) {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className={`text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Premium Subscription</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8`}>
            <h2 className="text-2xl font-bold mb-4">Free Plan</h2>
            <div className="mb-4 text-4xl font-bold">$0 <span className="text-sm">/ month</span></div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 /> Mental assessments</li>
              <li className="flex items-center gap-2"><CheckCircle2 /> 24/7 AI chatbot</li>
            </ul>
            <button className="mt-6 w-full py-3 rounded-xl bg-gray-700 text-white">Current Plan</button>
          </div>

          <div className={`${darkMode ? 'bg-gradient-to-br from-cyan-900 to-purple-900 text-white' : 'bg-gradient-to-br from-cyan-50 to-purple-50'} rounded-3xl p-8 border-4 border-cyan-500`}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Premium Plan</h2>
              <Crown />
            </div>
            <div className="text-4xl font-bold mt-4">$9.99</div>
            <div className="text-sm mb-4">per month or 500 credit points</div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2"><CheckCircle2 /> Exclusive therapist access</li>
              <li className="flex items-center gap-2"><CheckCircle2 /> Priority support</li>
            </ul>
            <button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-xl">Upgrade Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
