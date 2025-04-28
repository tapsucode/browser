import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
              {currentUser?.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentUser?.username}</h2>
              <p className="text-gray-500">{currentUser?.email || 'No email provided'}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="flex">
                <input
                  type="text"
                  className="input flex-1"
                  value={currentUser?.username || ''}
                  disabled
                />
                <button className="ml-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                  Edit
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="flex">
                <input
                  type="email"
                  className="input flex-1"
                  value={currentUser?.email || ''}
                  disabled
                />
                <button className="ml-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                  Edit
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="flex">
                <input
                  type="password"
                  className="input flex-1"
                  value="••••••••"
                  disabled
                />
                <button className="ml-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};