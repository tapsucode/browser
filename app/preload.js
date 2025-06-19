const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Generic backend request - tương thích với ElectronAPIClient.request()
  backendRequest: (method, url, data, headers) => ipcRenderer.invoke('backend-request', method, url, data, headers),
  
  // Specific methods for backward compatibility
  launchProfile: (profileId) => ipcRenderer.invoke('launch-profile', profileId),
  executeWorkflow: (workflowId, profileIds, options) => 
    ipcRenderer.invoke('execute-workflow', workflowId, profileIds, options),
  
  // App controls
  minimizeApp: () => ipcRenderer.invoke('minimize-app'),
  maximizeApp: () => ipcRenderer.invoke('maximize-app'),
  closeApp: () => ipcRenderer.invoke('close-app'),
  
  // File operations
  saveFile: (data, filename) => ipcRenderer.invoke('save-file', data, filename),
  loadFile: () => ipcRenderer.invoke('load-file'),
  
  // System info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Event listeners
  onBackendReady: (callback) => ipcRenderer.on('backend-ready', (event, ...args) => callback(...args)), // Cần sửa để callback nhận đúng tham số
  onProfileLaunched: (callback) => ipcRenderer.on('profile-launched', (event, ...args) => callback(...args)), // Cần sửa
  onWorkflowCompleted: (callback) => ipcRenderer.on('workflow-completed', (event, ...args) => callback(...args)), // Cần sửa
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Platform detection
contextBridge.exposeInMainWorld('platform', {
  isElectron: true,
  platform: process.platform,
  version: process.versions.electron
});