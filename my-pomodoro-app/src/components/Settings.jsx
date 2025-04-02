// src/components/Settings.js
import React from "react";

const Settings = ({
  show, // boolean to control visibility
  onClose, // function to close the panel
  settings, // current settings object
  onSettingChange, // function to update a setting
}) => {
  // Handler for increment/decrement buttons for numeric settings
  const handleNumericChange = (key, delta) => {
    const currentValue = settings[key] || 0;
    // Ensure duration values are at least 1 minute
    const minValue =
      key.includes("Duration") || key === "sessionsUntilLongBreak" ? 1 : 0;
    const newValue = Math.max(minValue, currentValue + delta);
    onSettingChange(key, newValue);
  };

  // Generic handler for most input types
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    let newValue;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "number") {
      // Ensure number input is treated as integer and has a minimum value
      const parsedValue = parseInt(value, 10);
      const minValue =
        name.includes("Duration") || name === "sessionsUntilLongBreak" ? 1 : 0;
      newValue = isNaN(parsedValue)
        ? minValue
        : Math.max(minValue, parsedValue);
    } else if (type === "range") {
      newValue = parseFloat(value); // Volume needs float
    } else {
      newValue = value; // For select dropdowns
    }

    // If disabling long breaks, potentially reset the counter (optional)
    // if (name === 'longBreakEnabled' && !newValue) {
    //   onSettingChange('sessionsUntilLongBreak', 4); // Reset to default or keep value
    // }

    onSettingChange(name, newValue);
  };

  return (
    // Overlay to click outside to close
    <>
      <div
        className={`settings-overlay ${show ? "show" : ""}`}
        onClick={onClose}
        aria-hidden="true" // Hide from screen readers as it's decorative
      />
      <div
        className={`settings-panel ${show ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        aria-hidden={!show} // Hide when not shown
      >
        <h3 id="settings-title">Timer Settings</h3>

        {/* --- Duration Settings --- */}
        <div className="setting-item">
          <label htmlFor="focusDuration">Focus Duration (min)</label>
          <div className="setting-controls">
            <button
              onClick={() => handleNumericChange("focusDuration", -1)}
              disabled={settings.focusDuration <= 1}
              aria-label="Decrease Focus Duration"
            >
              -
            </button>
            <input
              type="number"
              id="focusDuration"
              name="focusDuration"
              value={settings.focusDuration}
              onChange={handleInputChange}
              min="1"
              aria-label="Focus duration in minutes"
            />
            <button
              onClick={() => handleNumericChange("focusDuration", 1)}
              aria-label="Increase Focus Duration"
            >
              +
            </button>
          </div>
        </div>

        <div className="setting-item">
          <label htmlFor="shortBreakDuration">Short Break (min)</label>
          <div className="setting-controls">
            <button
              onClick={() => handleNumericChange("shortBreakDuration", -1)}
              disabled={settings.shortBreakDuration <= 1}
              aria-label="Decrease Short Break Duration"
            >
              -
            </button>
            <input
              type="number"
              id="shortBreakDuration"
              name="shortBreakDuration"
              value={settings.shortBreakDuration}
              onChange={handleInputChange}
              min="1"
              aria-label="Short break duration in minutes"
            />
            <button
              onClick={() => handleNumericChange("shortBreakDuration", 1)}
              aria-label="Increase Short Break Duration"
            >
              +
            </button>
          </div>
        </div>

        <div className="setting-item">
          <label htmlFor="longBreakDuration">Long Break (min)</label>
          <div className="setting-controls">
            <button
              onClick={() => handleNumericChange("longBreakDuration", -1)}
              disabled={
                !settings.longBreakEnabled || settings.longBreakDuration <= 1
              }
              aria-label="Decrease Long Break Duration"
            >
              -
            </button>
            <input
              type="number"
              id="longBreakDuration"
              name="longBreakDuration"
              value={settings.longBreakDuration}
              onChange={handleInputChange}
              min="1"
              disabled={!settings.longBreakEnabled}
              aria-label="Long break duration in minutes"
            />
            <button
              onClick={() => handleNumericChange("longBreakDuration", 1)}
              disabled={!settings.longBreakEnabled}
              aria-label="Increase Long Break Duration"
            >
              +
            </button>
          </div>
        </div>

        {/* --- Long Break Frequency --- */}
        <div className="setting-item">
          {/* Combined label and toggle */}
          <div className="setting-item-header">
            <label htmlFor="longBreakEnabled">Enable Long Breaks</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="longBreakEnabled"
                name="longBreakEnabled"
                checked={settings.longBreakEnabled}
                onChange={handleInputChange}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="setting-item">
          <label htmlFor="sessionsUntilLongBreak">
            Sessions until Long Break
          </label>
          <div className="setting-controls">
            <button
              onClick={() => handleNumericChange("sessionsUntilLongBreak", -1)}
              disabled={
                !settings.longBreakEnabled ||
                settings.sessionsUntilLongBreak <= 1
              }
              aria-label="Decrease Sessions Before Long Break"
            >
              -
            </button>
            <input
              type="number"
              id="sessionsUntilLongBreak"
              name="sessionsUntilLongBreak"
              value={settings.sessionsUntilLongBreak}
              onChange={handleInputChange}
              min="1"
              disabled={!settings.longBreakEnabled}
              aria-label="Number of focus sessions before a long break"
            />
            <button
              onClick={() => handleNumericChange("sessionsUntilLongBreak", 1)}
              disabled={!settings.longBreakEnabled}
              aria-label="Increase Sessions Before Long Break"
            >
              +
            </button>
          </div>
        </div>

        {/* --- Audio Volume --- */}
        <div className="setting-item">
          <label htmlFor="volume">Alarm Volume</label>
          <div className="setting-controls full-width">
            <input
              type="range"
              id="volume"
              name="volume"
              min="0"
              max="1"
              step="0.01" // Finer control
              value={settings.volume}
              onChange={handleInputChange}
              aria-label="Alarm volume control"
            />
            <span style={{ minWidth: "40px" }}>
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
        </div>

        {/* --- Appearance Settings --- */}
        <div className="setting-item">
          <label htmlFor="colorTheme">Color Theme</label>
          <div className="setting-controls full-width">
            <select
              id="colorTheme"
              name="colorTheme"
              value={settings.colorTheme}
              onChange={handleInputChange}
              aria-label="Select color theme"
            >
              <option value="red">Red (Default)</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              {/* Add more themes here */}
            </select>
          </div>
        </div>

        <div className="setting-item">
          <label htmlFor="timerDisplay">Timer Style</label>
          <div className="setting-controls full-width">
            <select
              id="timerDisplay"
              name="timerDisplay"
              value={settings.timerDisplay}
              onChange={handleInputChange}
              aria-label="Select timer display style"
            >
              <option value="linear">Linear Bar</option>
              <option value="circular">Circular</option>
            </select>
          </div>
        </div>

        <div className="setting-item">
          {/* Combined label and toggle */}
          <div className="setting-item-header">
            <label htmlFor="darkMode">Dark Mode</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="darkMode"
                name="darkMode"
                checked={settings.darkMode}
                onChange={handleInputChange}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Add more settings as needed here */}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="control-button settings-close-button"
        >
          Close Settings
        </button>
      </div>
    </>
  );
};

export default Settings;
