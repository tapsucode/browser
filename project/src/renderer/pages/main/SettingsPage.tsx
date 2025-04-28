import React, { useState } from 'react';

export const SettingsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [fontSize, setFontSize] = useState('medium');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Application Settings</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Appearance Settings */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">Appearance</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="darkMode" className="text-gray-700 font-medium">Dark Mode</label>
                  <p className="text-sm text-gray-500">Enable dark mode for the application</p>
                </div>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                  <input
                    type="checkbox"
                    id="darkMode"
                    className="opacity-0 w-0 h-0"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                  <label
                    htmlFor="darkMode"
                    className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                      darkMode ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                        darkMode ? 'transform translate-x-6' : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="fontSize" className="block text-gray-700 font-medium mb-1">
                  Font Size
                </label>
                <select
                  id="fontSize"
                  className="input"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-medium text-gray-900 mb-4">Notifications</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="notifications" className="text-gray-700 font-medium">Enable Notifications</label>
                <p className="text-sm text-gray-500">Receive notifications for important events</p>
              </div>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="notifications"
                  className="opacity-0 w-0 h-0"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <label
                  htmlFor="notifications"
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    notifications ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                      notifications ? 'transform translate-x-6' : ''
                    }`}
                  ></span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Editor Settings */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-medium text-gray-900 mb-4">Editor</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="autoSave" className="text-gray-700 font-medium">Auto Save</label>
                <p className="text-sm text-gray-500">Automatically save changes</p>
              </div>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="autoSave"
                  className="opacity-0 w-0 h-0"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                />
                <label
                  htmlFor="autoSave"
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    autoSave ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                      autoSave ? 'transform translate-x-6' : ''
                    }`}
                  ></span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between">
          <button className="btn btn-secondary">
            Reset to Defaults
          </button>
          <button className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};