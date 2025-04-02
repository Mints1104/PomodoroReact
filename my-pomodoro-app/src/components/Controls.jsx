// src/components/Controls.js
import React from "react";

const Controls = ({
  isRunning,
  timerMode, // To know if we are in break mode for the skip button
  onStartPause,
  onResetTimer,
  onResetSessions,
  onSkipBreak, // Optional: Add skip break functionality
  onTestAlarm,
}) => {
  return (
    <div className="controls">
      {/* Start/Pause Button */}
      <button
        onClick={onStartPause}
        className={`control-button ${isRunning ? "active" : ""}`}
        aria-label={isRunning ? "Pause Timer" : "Start Timer"}
        aria-pressed={isRunning}
      >
        {isRunning ? "Pause" : "Start"}
      </button>

      {/* Reset Timer Button */}
      <button
        onClick={onResetTimer}
        className="control-button"
        aria-label="Reset Current Timer"
        disabled={isRunning} // Disable reset while running? Optional.
      >
        Reset
      </button>

      {/* Reset Sessions Button */}
      <button
        onClick={onResetSessions}
        className="control-button"
        aria-label="Reset Session Count"
        disabled={isRunning} // Disable reset while running? Optional.
      >
        Reset Sessions
      </button>

      {/* Skip Break Button (Only show during breaks) */}
      {(timerMode === "shortBreak" || timerMode === "longBreak") &&
        onSkipBreak && (
          <button
            onClick={onSkipBreak}
            className="control-button"
            aria-label="Skip Current Break"
            disabled={isRunning} // Disable skip while running break timer? Optional.
          >
            Skip Break
          </button>
        )}

      {/* Test Alarm Button */}
      <button
        onClick={onTestAlarm}
        className="control-button"
        aria-label="Test Alarm Sound"
      >
        Test Alarm
      </button>
    </div>
  );
};

export default Controls;
