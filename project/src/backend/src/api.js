// API endpoints for Electron IPC communication
import { ipcMain } from 'electron';
import { WorkflowExecutor } from './workflowExecutor';
import { ProfileManager } from './profileManager';
import { ProxyManager } from './proxyManager';

export function setupAPI() {
  const workflowExecutor = new WorkflowExecutor();
  const profileManager = new ProfileManager();
  const proxyManager = new ProxyManager();

  // Workflow endpoints
  ipcMain.handle('workflow:execute', async (_, workflow) => {
    return workflowExecutor.execute(workflow);
  });

  // Profile endpoints
  ipcMain.handle('profile:create', async (_, profileData) => {
    return profileManager.createProfile(profileData);
  });

  // Proxy endpoints
  ipcMain.handle('proxy:add', async (_, proxyConfig) => {
    return proxyManager.addProxy(proxyConfig);
  });
}