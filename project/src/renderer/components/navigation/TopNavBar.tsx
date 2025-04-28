import React from 'react';
import { User } from '../../../common/types';

interface TopNavBarProps {
  activeSection: string;
  user: User | null;
  onLogout: () => void;
  onToolbarItemClick: (section: string) => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeSection,
  user,
  onLogout,
  onToolbarItemClick,
}) => {
  return (
    <div className="flex-shrink-0">
      {/* Title Bar */}
      <div className="h-[30px] bg-gray-900 flex items-center justify-between px-4 w-full">
        <div className="text-white text-sm">Anti Detect Browser</div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 text-sm">v1.0.0</span>
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-gray-400 text-sm">Connected</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-[40px] bg-gray-800 flex items-center px-4 w-full">
        <div className="flex space-x-6">
          <button
            onClick={() => onToolbarItemClick('profiles')}
            className={`text-sm px-3 py-1 rounded ${
              activeSection === 'profiles'
                ? 'bg-primary-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Add Profile
          </button>
          <button
            onClick={() => onToolbarItemClick('manage-profiles')}
            className={`text-sm px-3 py-1 rounded ${
              activeSection === 'manage-profiles'
                ? 'bg-primary-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Manage Profiles
          </button>
          <button
            onClick={() => onToolbarItemClick('automation')}
            className={`text-sm px-3 py-1 rounded ${
              activeSection === 'automation'
                ? 'bg-primary-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Automation
          </button>
        </div>

        {/* User Profile */}
        <div className="ml-auto relative group">
          <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
            <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm">{user?.username}</span>
          </button>
          
          <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg py-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 border border-gray-700">
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              onClick={onLogout}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};