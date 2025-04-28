import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TopNavBar } from '../components/navigation/TopNavBar';
import { LeftSidebar } from '../components/navigation/LeftSidebar';

export const MainLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('profiles');
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleToolbarItemClick = (section: string) => {
    setActiveSection(section);
    setIsSidebarVisible(true);
  };

  const handleSidebarItemClick = (itemId: string) => {
    navigate(`/${itemId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col">
      <TopNavBar 
        activeSection={activeSection}
        user={currentUser}
        onLogout={handleLogout}
        onToolbarItemClick={handleToolbarItemClick}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar 
          activeSection={activeSection}
          onItemClick={handleSidebarItemClick}
          currentPath={location.pathname}
          isVisible={isSidebarVisible}
        />
        
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};