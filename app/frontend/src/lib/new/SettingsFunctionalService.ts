import { ElectronAPIClient } from "../electron-api";
import { PersonalSettings, SystemSettings, UserSettings } from "../types";
import { DEFAULT_SYSTEM_SETTINGS, DEFAULT_PERSONAL_SETTINGS } from "../../utils/settings";

export const SettingsFunctionalService = {
  async getUserSettings(): Promise<UserSettings> {
    // Trả về settings mặc định 
    return {
      system: DEFAULT_SYSTEM_SETTINGS,
      personal: DEFAULT_PERSONAL_SETTINGS
    };
  },

  async updateSystemSettings(systemSettings: SystemSettings): Promise<SystemSettings> {
    // Vẫn giữ API call vì cần lưu preferences của user
    const response = await ElectronAPIClient.request("PATCH", "/api/settings/system", systemSettings);
    return response.json();
  },
};