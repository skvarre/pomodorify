import React, { useState } from 'react';
import Timer from './components/Timer';

function App() {
  const [isWorking, setIsWorking] = useState(true);
  const workTime = 25 * 60; // 25 minutes
  const breakTime = 5 * 60; // 5 minutes

  const handleTimerEnd = () => {
    setIsWorking(!isWorking);
  };

  const handleSkip = () => {
    setIsWorking(!isWorking);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Pomodorify
      </h1>
      <Timer 
        initialTime={isWorking ? workTime : breakTime} 
        onTimerEnd={handleTimerEnd} 
      />
      <p className="text-center mt-4">
        {isWorking ? 'Work Session' : 'Break Session'}
      </p>
      <button 
        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded block mx-auto"
        onClick={handleSkip}
      >
        {isWorking ? 'Skip to Break' : 'Skip to Work'}
      </button>
    </div>
  );
}

export default App;