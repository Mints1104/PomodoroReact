// src/App.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
// Updated imports to use .jsx extension
import TimerDisplay from './components/TimerDisplay.jsx';
import Controls from './components/Controls.jsx';
import Settings from './components/Settings.jsx';
import SettingsButton from './components/SettingsButton.jsx'; // <-- Corrected import path
import './App.css';

// Default settings - Define default values for all settings
const DEFAULT_SETTINGS = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    longBreakEnabled: true,
    volume: 0.5,
    colorTheme: 'red',
    timerDisplay: 'linear', // 'linear' or 'circular'
    darkMode: false,
    autoStartBreaks: false, // Example of another potential setting
    autoStartFocus: false,  // Example of another potential setting
};

// Function to load settings from localStorage, merging with defaults
const loadSettings = () => {
    try {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            // Merge saved settings with defaults to ensure all keys exist
            // and handle cases where new settings were added to defaults
            return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error("Failed to parse settings from localStorage:", e);
        // Fallback to defaults if parsing fails
    }
    return DEFAULT_SETTINGS; // Return defaults if nothing saved or error occurs
};


function App() {
    // === State Variables ===
    const [settings, setSettings] = useState(loadSettings);
    const [timerMode, setTimerMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
    const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60); // Initial time based on loaded settings
    const [isRunning, setIsRunning] = useState(false);
    const [sessionCount, setSessionCount] = useState(0); // Completed focus sessions in current cycle for long break logic
    const [totalSessionsCompleted, setTotalSessionsCompleted] = useState(0); // Overall count
    const [showSettings, setShowSettings] = useState(false);

    // === Refs ===
    const intervalRef = useRef(null); // Stores the interval ID for cleanup
    const audioRef = useRef(null); // Ref for the HTML <audio> element

    // === Effects ===

    // Effect 1: Save settings to localStorage and apply visual themes (color/dark mode)
    useEffect(() => {
        try {
            localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save settings to localStorage:", e);
        }

        // Apply theme and dark mode classes directly to the body element
        document.body.className = ''; // Clear previous classes first
        if (settings.colorTheme && settings.colorTheme !== 'red') { // 'red' is default, no class needed
             document.body.classList.add(`theme-${settings.colorTheme}`);
        }
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
        }

        // Adjust audio volume immediately when the setting changes
        if (audioRef.current) {
            audioRef.current.volume = settings.volume;
        }

        // If settings related to duration change WHILE TIMER IS PAUSED, update timeLeft
        // Define handleResetTimer before calling it in useEffect if not already defined above
        const resetTimerForSettingChange = (resetCount = false) => {
             clearInterval(intervalRef.current);
             intervalRef.current = null;
             setIsRunning(false);
             let currentModeDuration;
             switch (timerMode) {
                 case 'shortBreak': currentModeDuration = settings.shortBreakDuration * 60; break;
                 case 'longBreak': currentModeDuration = settings.longBreakDuration * 60; break;
                 default: currentModeDuration = settings.focusDuration * 60; break;
             }
             setTimeLeft(currentModeDuration);
             if (resetCount && timerMode === 'focus') setSessionCount(0);
        };


        if (!isRunning) {
            // Reset timer to the new duration of the current mode, don't reset session count here
            resetTimerForSettingChange(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings]); // Rerun whenever settings object changes (disable eslint warning for handleResetTimer dependency if needed, or define it outside/useCallback)


    // Effect 2: Core Timer Interval Logic
    useEffect(() => {
        // If timer shouldn't be running, clear any existing interval and do nothing else
        if (!isRunning) {
            clearInterval(intervalRef.current);
            intervalRef.current = null; // Clear ref
            return;
        }

        // Timer is running, set up the interval
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Time's up!
                    clearInterval(intervalRef.current); // Stop this interval
                    intervalRef.current = null;
                    playAlarm(); // Play the sound
                    handleTimerEnd(); // Handle mode switching and session counting
                    return 0; // Set time to 0 before switching mode handles reset
                }
                return prev - 1; // Decrement time
            });
        }, 1000); // Run every second

        // Cleanup function: Clear interval when component unmounts or isRunning becomes false
        return () => {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning]); // Only depends on isRunning to start/stop the interval mechanism (handleTimerEnd/playAlarm are stable via useCallback or defined outside)


    // Effect 3: Update Document Title with Time Left
    useEffect(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        // Make mode text more readable
        const modeText = timerMode === 'focus' ? 'Focus' : timerMode === 'shortBreak' ? 'Short Break' : 'Long Break';

        document.title = `${timeStr} - ${modeText} | Pomodoro`;
    }, [timeLeft, timerMode]); // Update title when time or mode changes


    // === Callback Functions ===

    // Function to switch modes (focus, shortBreak, longBreak) - Use useCallback
    const switchMode = useCallback((nextMode) => {
        setTimerMode(nextMode);
        setIsRunning(false); // Always pause timer on mode switch initially

        let newDurationInSeconds;
        switch (nextMode) {
            case 'shortBreak':
                newDurationInSeconds = settings.shortBreakDuration * 60;
                // Auto-start break?
                if (settings.autoStartBreaks) setIsRunning(true);
                break;
            case 'longBreak':
                newDurationInSeconds = settings.longBreakDuration * 60;
                 // Auto-start break?
                if (settings.autoStartBreaks) setIsRunning(true);
                break;
            case 'focus':
            default:
                newDurationInSeconds = settings.focusDuration * 60;
                 // Auto-start focus?
                 if (settings.autoStartFocus) setIsRunning(true);
                break;
        }
        setTimeLeft(newDurationInSeconds);

    }, [settings]); // Depends on settings for durations and auto-start options


    // Function called when the timer reaches 0 - Use useCallback
    const handleTimerEnd = useCallback(() => {
        let nextMode = 'focus'; // Default next mode
        let currentSessionCount = sessionCount;
        let currentTotalSessions = totalSessionsCompleted;

        if (timerMode === 'focus') {
            currentSessionCount += 1;
            currentTotalSessions += 1;
            setSessionCount(currentSessionCount);
            setTotalSessionsCompleted(currentTotalSessions);

            // Determine if it's time for a long break
            if (settings.longBreakEnabled && currentSessionCount >= settings.sessionsUntilLongBreak) {
                nextMode = 'longBreak';
                setSessionCount(0); // Reset the cycle count for the next long break
            } else {
                nextMode = 'shortBreak';
            }
        } else { // If a break (short or long) just finished, switch back to focus
            nextMode = 'focus';
        }

        switchMode(nextMode);

    }, [timerMode, sessionCount, totalSessionsCompleted, settings, switchMode]);


    // --- Control Button Handlers ---

    const handleStartPause = () => {
        setIsRunning(prev => !prev); // Toggle running state
    };

    // Resets the timer to the start of the current mode's duration - Use useCallback
    const handleResetTimer = useCallback((resetSessionCountToo = true) => {
        clearInterval(intervalRef.current); // Stop any active interval
        intervalRef.current = null;
        setIsRunning(false); // Ensure timer is paused

        let currentModeDuration;
         switch (timerMode) {
            case 'shortBreak':
                currentModeDuration = settings.shortBreakDuration * 60;
                break;
            case 'longBreak':
                currentModeDuration = settings.longBreakDuration * 60;
                break;
            case 'focus':
            default:
                currentModeDuration = settings.focusDuration * 60;
                break;
        }
        setTimeLeft(currentModeDuration);

         // Only reset session count if explicitly requested (e.g., user clicks Reset, not just settings update)
         if (resetSessionCountToo && timerMode === 'focus') {
            setSessionCount(0);
         }
    }, [timerMode, settings]); // Depends on timerMode and settings


    // Resets the session counters and returns to the start of a focus session
    const handleResetSessions = () => {
        setSessionCount(0); // Reset cycle count
        setTotalSessionsCompleted(0); // Reset total count
        switchMode('focus'); // Go back to focus mode
        // handleResetTimer will be called implicitly by the useEffect watching settings if needed,
        // or we can call it explicitly to be sure state is reset immediately
        handleResetTimer(true);
    };

    // Skips the current break and switches back to focus mode
    const handleSkipBreak = () => {
        if (timerMode === 'shortBreak' || timerMode === 'longBreak') {
            playAlarm(true); // Play a short notification sound (optional)
            switchMode('focus');
        }
    };

     // --- Settings Panel Handlers ---

     const handleToggleSettings = () => {
        setShowSettings(prev => !prev);
    };

    // Updates a specific setting in the state
    const handleSettingChange = (key, value) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            [key]: value,
        }));
        // Note: The useEffect hook watching `settings` handles saving and applying changes.
    };

    // --- Audio Handling ---

    // Plays the alarm sound
    const playAlarm = (shortBeep = false) => {
        if (audioRef.current) {
             audioRef.current.currentTime = 0; // Rewind to start
             audioRef.current.play().catch(error => {
                console.warn("Audio playback failed. User interaction might be required.", error);
                // Inform user if playback fails due to browser restrictions
            });
             // If shortBeep is true, stop sound after a brief period (e.g., for skip/test)
             if (shortBeep) {
                setTimeout(() => {
                    if(audioRef.current && !audioRef.current.paused) {
                         audioRef.current.pause();
                         audioRef.current.currentTime = 0; // Reset for next play
                    }
                }, 600); // Play for 0.6 seconds
             }
        } else {
             console.warn("Audio element not available.");
        }
    };

     // Handler for the "Test Alarm" button
     const handleTestAlarm = () => {
        playAlarm(true); // Play the short version for testing
    };

    // === Calculate Total Duration for Progress Bar ===
    // This needs to be recalculated whenever the mode or settings change
    let totalDurationForProgress;
    switch (timerMode) {
        case 'shortBreak':
            totalDurationForProgress = settings.shortBreakDuration * 60;
            break;
        case 'longBreak':
            totalDurationForProgress = settings.longBreakDuration * 60;
            break;
        case 'focus':
        default:
            totalDurationForProgress = settings.focusDuration * 60;
            break;
    }


    // === Render ===
    return (
        <div className="app-container">
            <h1 className="app-title">Pomodoro Timer</h1>

            {/* Settings Button positioned absolutely */}
            <SettingsButton onClick={handleToggleSettings} isOpen={showSettings} />

            {/* Settings Panel (conditionally rendered or animated) */}
            <Settings
                show={showSettings}
                onClose={handleToggleSettings}
                settings={settings}
                onSettingChange={handleSettingChange}
            />

            {/* Timer Display Area */}
            <TimerDisplay
                timeLeft={timeLeft}
                totalDuration={totalDurationForProgress}
                timerMode={timerMode}
                displayMode={settings.timerDisplay}
             />

            {/* Control Buttons */}
            <Controls
                isRunning={isRunning}
                timerMode={timerMode}
                onStartPause={handleStartPause}
                onResetTimer={() => handleResetTimer(true)} // User-triggered reset clears count
                onResetSessions={handleResetSessions}
                onSkipBreak={handleSkipBreak}
                onTestAlarm={handleTestAlarm}
            />

             {/* Simple Session Counter Display */}
             <p className="session-counter">
                {/* Show cycle count only if long breaks are enabled */}
                {settings.longBreakEnabled
                    ? `Session ${sessionCount + 1} / ${settings.sessionsUntilLongBreak}`
                    : `Session ${totalSessionsCompleted + 1}`
                }
                {' | '}
                Completed: {totalSessionsCompleted}
            </p>

            {/* HTML Audio Element for Alarm Sound */}
            {/* IMPORTANT: Place an audio file (e.g., alarm.mp3, alarm.wav) in the `public/sounds/` directory */}
{/* HTML Audio Element for Alarm Sound */}
    <audio ref={audioRef} src="/sounds/alarm.mp3" preload="auto" aria-label="Alarm Sound"></audio>
            {/* You might want to provide multiple formats for broader browser compatibility */}
            {/* <audio ref={audioRef} preload="auto">
                 <source src="/sounds/alarm.mp3" type="audio/mpeg" />
                 <source src="/sounds/alarm.ogg" type="audio/ogg" />
                 <source src="/sounds/alarm.wav" type="audio/wav" />
                 Your browser does not support the audio element.
            </audio> */}
        </div>
    );
}

export default App;
