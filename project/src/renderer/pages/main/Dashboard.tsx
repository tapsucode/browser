import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome, {currentUser?.username}!</h2>
        <p className="text-gray-600">
          This is your application dashboard. As you build your application, you'll add content, 
          widgets, and functionality to this page.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="btn btn-primary w-full justify-start">
              Create New Document
            </button>
            <button className="btn btn-secondary w-full justify-start">
              View Recent Files
            </button>
            <button className="btn btn-secondary w-full justify-start">
              Manage Settings
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Application Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Connection Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">User Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Getting Started</h3>
        <div className="space-y-4">
          <p className="text-gray-600">
            This is a starter template for your Electron application. To continue building your app:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Update the styling and branding to match your product</li>
            <li>Implement additional pages and functionality</li>
            <li>Connect to backend services and APIs</li>
            <li>Add authentication and user management</li>
            <li>Configure packaging and distribution settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};