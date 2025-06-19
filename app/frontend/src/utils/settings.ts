
import { SystemSettings, PersonalSettings } from '../lib/types';

// Danh sách timezone cố định
export const TIMEZONES = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Hồ Chí Minh (GMT+7)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'Europe/London', label: 'London (GMT+0)' }
];

// Danh sách ngôn ngữ cố định
export const LANGUAGES = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' }
];

// Danh sách theme cố định
export const THEMES = [
  { value: 'light', label: 'Sáng' },
  { value: 'dark', label: 'Tối' }
];

// Cài đặt hệ thống mặc định
export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  theme: 'light',
  language: 'vi',
  timezone: 'Asia/Ho_Chi_Minh',
  notifications: false,
  desktopNotifications: true,
  soundEffects: false,
  autoUpdate: false
};

// Cài đặt cá nhân mặc định
export const DEFAULT_PERSONAL_SETTINGS: PersonalSettings = {
  firstName: '',
  lastName: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};
