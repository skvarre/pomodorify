import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

type TimerProps = {
  time: number;
  isActive: boolean;
  isWorking: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipSession: () => void;
};

const Timer: React.FC<TimerProps> = ({ time, isActive, isWorking, onToggleTimer, onResetTimer, onSkipSession }) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md mx-auto mb-6">
      <div className="text-center">
        <h2 className="text-6xl font-bold mb-6">{formatTime(time)}</h2>
        <div className="flex justify-center space-x-4 mb-4">
          <button 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out flex items-center"
            onClick={onToggleTimer}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start
              </>
            )}
          </button>
          <button 
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out flex items-center"
            onClick={onResetTimer}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </button>
        </div>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out flex items-center mx-auto"
          onClick={onSkipSession}
        >
          <SkipForward className="w-5 h-5 mr-2" />
          Skip to {isWorking ? 'Break' : 'Work'}
        </button>
      </div>
    </div>
  );
};

export default Timer;