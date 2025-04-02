// src/components/TimerDisplay.js
import React from "react";

// Helper function to format time (seconds -> MM:SS)
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const TimerDisplay = ({
  timeLeft,
  totalDuration,
  timerMode,
  displayMode = "linear", // 'linear' or 'circular'
}) => {
  // Calculate percentage, ensuring totalDuration is not zero
  const percentage = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;
  const formattedTime = formatTime(timeLeft);

  // --- Circular Display Calculations ---
  // Use a fixed radius for SVG calculations, scaling handled by SVG viewbox/container size
  const radius = 85; // Radius within the 200x200 viewbox
  const circumference = 2 * Math.PI * radius;
  // Calculate the stroke-dashoffset. Offset starts at circumference and decreases to 0.
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="timer-display">
      {/* --- Linear Display --- */}
      {displayMode === "linear" && (
        <>
          <div className="timer-text-linear">{formattedTime}</div>
          <div
            className="progress-bar-container"
            aria-label={`${timerMode} progress`}
          >
            <div
              className="progress-bar"
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={timeLeft}
              aria-valuemin="0"
              aria-valuemax={totalDuration}
              aria-valuetext={formattedTime}
            ></div>
          </div>
        </>
      )}

      {/* --- Circular Display --- */}
      {displayMode === "circular" && (
        <div
          className="progress-circular-container"
          aria-label={`${timerMode} progress: ${formattedTime}`}
        >
          <svg className="progress-circular-svg" viewBox="0 0 200 200">
            {" "}
            {/* Consistent viewbox */}
            {/* Background Circle */}
            <circle
              className="progress-circular-bg"
              cx="100" // Center of viewbox
              cy="100"
              r={radius} // Radius used for calculation
            />
            {/* Foreground Circle (Progress) */}
            <circle
              className="progress-circular-fg"
              cx="100"
              cy="100"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={offset} // Animate this value
            />
          </svg>
          {/* Text centered over the SVG */}
          <div className="timer-text-circular" role="timer" aria-live="polite">
            {formattedTime}
          </div>
        </div>
      )}

      {/* Optional: Display current mode */}
      {/* <p className="current-mode-text">Mode: {timerMode}</p> */}
    </div>
  );
};

export default TimerDisplay;
