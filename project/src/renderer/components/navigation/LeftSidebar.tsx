import React from 'react';

interface LeftSidebarProps {
  activeSection: string;
  currentPath: string;
  onItemClick: (path: string) => void;
  isVisible: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeSection,
  currentPath,
  onItemClick,
  isVisible
}) => {
  // Define width based on active section
  const getSidebarWidth = () => {
    switch (activeSection) {
      case 'profiles':
        return 'w-96'; // Wider for profile creation form
      case 'manage-profiles':
        return 'w-80'; // Medium width for profile management
      case 'automation':
        return 'w-72'; // Standard width for automation
      default:
        return 'w-64';
    }
  };

  const getMenuItems = () => {
    switch (activeSection) {
      case 'profiles':
        return [
          { id: 'create-profile', icon: '➕', label: 'Create Profile' },
          { id: 'import-profile', icon: '📥', label: 'Import Profile' },
          { id: 'profile-templates', icon: '📋', label: 'Templates' },
        ];
      case 'manage-profiles':
        return [
          { id: 'all-profiles', icon: '📁', label: 'All Profiles' },
          { id: 'groups', icon: '🗂️', label: 'Groups' },
          { id: 'tags', icon: '🏷️', label: 'Tags' },
        ];
      case 'automation':
        return [
          { id: 'scripts', icon: '📜', label: 'Scripts' },
          { id: 'schedule', icon: '⏰', label: 'Schedule' },
          { id: 'logs', icon: '📊', label: 'Logs' },
        ];
      default:
        return [];
    }
  };

  if (!isVisible) return null;

  return (
    <aside className={`${getSidebarWidth()} bg-gray-800 flex flex-col py-4 transition-all duration-300 ease-in-out`}>
      <div className="px-4 mb-4">
        <h2 className="text-lg font-semibold text-white capitalize">
          {activeSection.replace('-', ' ')}
        </h2>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          {getMenuItems().map((item) => (
            <li key={item.id}>
              <button
                className={`w-full text-left px-4 py-2 rounded-md flex items-center space-x-3 ${
                  currentPath === `/${item.id}`
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => onItemClick(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};