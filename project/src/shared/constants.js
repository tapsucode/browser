// Shared constants between frontend and backend
export const IPC_CHANNELS = {
  WORKFLOW: {
    EXECUTE: 'workflow:execute'
  },
  PROFILE: {
    CREATE: 'profile:create',
    UPDATE: 'profile:update'
  },
  PROXY: {
    ADD: 'proxy:add',
    REMOVE: 'proxy:remove'
  }
};

export const APP_CONFIG = {
  VERSION: '1.0.0',
  NAME: 'Your Anti Detect Browser'
};