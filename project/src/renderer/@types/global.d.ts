interface Window {
  electronAPI: {
    login: (credentials: { username: string; password: string }) => Promise<any>;
    register: (userData: { username: string; password: string; email: string }) => Promise<any>;
  };
}