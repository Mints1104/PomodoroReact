// src/components/SettingsButton.jsx  <-- RENAME THE FILE
import React from 'react';
// Optional: Import an icon library like react-icons
// import { FiSettings } from 'react-icons/fi';

const SettingsButton = ({ onClick, isOpen }) => {
    return (
       <div className="settings-button-container">
           <button
              onClick={onClick}
              className="settings-button-component"
              aria-label={isOpen ? "Close Settings" : "Open Settings"}
              aria-expanded={isOpen}
            >
                {/* <FiSettings />  Using react-icons */}
                ⚙️ {/* Using Emoji */}
                <span style={{ marginLeft: '5px' }}>Settings</span>
            </button>
       </div>
    );
};

export default SettingsButton;
