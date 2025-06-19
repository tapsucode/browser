
import { ElectronAPIClient } from '../electron-api';
import { Balance } from '../types';

export const BalanceFunctionalService = {
  async getBalance(): Promise<Balance> {
    const response = await ElectronAPIClient.request('GET', '/api/balance/');
    return response.json();
  },

  async updateBalance(newBalance: Balance): Promise<Balance> {
    const response = await ElectronAPIClient.request('PUT', '/api/balance/', newBalance);
    return response.json();
  }
};
