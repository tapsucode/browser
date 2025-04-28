// Backend entry point
import { setupAPI } from './src/api';
import { PlaywrightAutomation, PuppeteerAutomation } from './src/automation';

export function initializeBackend() {
  // Set up IPC API endpoints
  setupAPI();

  // Initialize automation engines
  const playwright = new PlaywrightAutomation();
  const puppeteer = new PuppeteerAutomation();

  return {
    playwright,
    puppeteer
  };
}