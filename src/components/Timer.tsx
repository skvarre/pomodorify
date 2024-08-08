import React, { useState, useEffect } from 'react';

type TimerProps = {
  initialTime: number;
  onTimerEnd: () => void;
  isActive: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
};

const Timer: React.FC<TimerProps> = ({ initialTime, onTimerEnd, isActive, onToggleTimer, onResetTimer }) => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      onTimerEnd();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, onTimerEnd]);

  useEffect(() => {
    setTime(initialTime);
  }, [initialTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setTime(initialTime);
    onResetTimer();
  };

  return (
    <div className="text-center">
      <h2 className="text-6xl font-bold mb-4">{formatTime(time)}</h2>
      <div className="space-x-4">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={onToggleTimer}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;