import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div 
        ref={modalRef}
        className={`bg-gray-800 rounded-lg p-6 w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">About Pomodorify</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="text-gray-300 space-y-4">
          <p>
            Pomodorify is a Pomodoro timer app that integrates with Spotify to help you focus and manage your time effectively with the <a href="https://en.wikipedia.org/wiki/Pomodoro_Technique" className="text-blue-400">Pomodoro technique</a>
          </p>
          <h3 className="text-xl font-semibold text-white">How it works</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Set your work and break intervals</li>
            <li>Connect your Spotify account to control your music (requires Spotify Premium)</li>
            <li>The timer integrates with Spotify and notifies you when it is time to take a break</li>
          </ul>
          <h3 className="text-xl font-semibold text-white">Privacy and Data Usage</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>We only request the necessary Spotify permissions to control playback</li>
            <li>We do not store or access your personal Spotify data</li>
            <li>Your Spotify login is handled securely through Spotify's official OAuth process</li>
            <li>We do not modify or access your Spotify account beyond the app's functionality</li>
            <li>Your usage data and settings are stored locally in your browser</li>
          </ul>
          <p>
            By using Pomodorify's Spotify Web Player, you agree to allow the app to control your Spotify playback during your work sessions. You can revoke this permission at any time through your Spotify account settings.
            Pressing the "Logout from Spotify" button will disconnect Pomodorify from your Spotify account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;