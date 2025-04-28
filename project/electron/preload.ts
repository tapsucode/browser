import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  login: (credentials: { username: string; password: string }) => 
    ipcRenderer.invoke('auth:login', credentials),
  
  register: (userData: { username: string; password: string; email: string }) => 
    ipcRenderer.invoke('auth:register', userData),
  
  // Add more API methods as needed
});