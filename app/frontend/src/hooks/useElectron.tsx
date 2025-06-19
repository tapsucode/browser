import { useEffect, useState } from 'react';
import { ElectronAPIClient } from '../lib/electron-api';

export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    setIsElectron(ElectronAPIClient.isElectron());
    
    if (ElectronAPIClient.isElectron()) {
      // Lắng nghe sự kiện backend ready
      ElectronAPIClient.onBackendReady(() => {
        setBackendReady(true);
      });
    }

    return () => {
      if (ElectronAPIClient.isElectron()) {
        ElectronAPIClient.removeAllListeners('backend-ready');
      }
    };
  }, []);

  return {
    isElectron,
    backendReady,
    launchProfile: ElectronAPIClient.launchProfile,
    executeWorkflow: ElectronAPIClient.executeWorkflow
  };
}