import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the appropriate URL based on development or production mode
  const isDev = process.env.IS_DEV === 'true';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Open the DevTools in development mode
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'renderer', 'index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  // Set up event handlers
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();

  // Set up IPC event handlers
  setupIpcHandlers();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Set up IPC (Inter-Process Communication) handlers
function setupIpcHandlers() {
  // Handle authentication
  ipcMain.handle('auth:login', async (_, credentials) => {
    // This would be replaced with actual authentication logic
    console.log('Login attempt with credentials:', credentials);
    return { success: true, userId: '123', username: credentials.username };
  });

  ipcMain.handle('auth:register', async (_, userData) => {
    // This would be replaced with actual registration logic
    console.log('Registration attempt with data:', userData);
    return { success: true, userId: '123', username: userData.username };
  });
}