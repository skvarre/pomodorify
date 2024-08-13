import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings: (settings: TimeSettings) => void;
  initialSettings: TimeSettings;
}

export interface TimeSettings {
  workTime: number;
  breakTime: number;
  longBreakTime: number;
  intervals: number;
  autoplay: boolean; 
}

const TimeInput: React.FC<{
  label: string;
  name: string;
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, value, onChange }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <input
      type="number"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      min="1"
      max="60"
      className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onSaveSettings, initialSettings }) => {
  const [settings, setSettings] = useState<TimeSettings>(initialSettings);
  const settingsRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : parseInt(value, 10)
    }));
  };

  const handleToggleChange = () => {
    setSettings(prevSettings => ({
      ...prevSettings,
      autoplay: !prevSettings.autoplay
    }));
  };
  
  const handleSave = () => {
    onSaveSettings(settings);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        ref={settingsRef}
        className={`bg-gray-800 rounded-lg p-6 w-80 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="text-white">
          <TimeInput
            label="Work Time"
            name="workTime"
            value={settings.workTime}
            onChange={handleInputChange}
          />
          <TimeInput
            label="Break Time"
            name="breakTime"
            value={settings.breakTime}
            onChange={handleInputChange}
          />
          <TimeInput
            label="Long Break Time"
            name="longBreakTime"
            value={settings.longBreakTime}
            onChange={handleInputChange}
          />
          <TimeInput
            label="Intervals before Long Break"
            name="intervals"
            value={settings.intervals}
            onChange={handleInputChange}
          />
          <div className="my-6 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Auto start sessions</span>
            <button 
              onClick={handleToggleChange}
              className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${
                settings.autoplay ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                  settings.autoplay ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;