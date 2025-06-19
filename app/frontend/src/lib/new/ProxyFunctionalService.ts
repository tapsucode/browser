import { ElectronAPIClient } from '../electron-api';
import { 
  ProxyConfig, 
  Proxy, 
  Group, 
  CreateProxyData, 
  UpdateProxyData, 
  ProxyTestResult, 
  ImportProxyData,
  CreateProxyGroupData
} from '../types';
import { type AddToGroupPayload } from "../../components/profile/group-select-dialog";

/**
 * Service xử lý các chức năng liên quan đến Proxy
 * Được sử dụng trong các pages:
 * - NetworkPage
 * - ProfilePage (phần cấu hình proxy)
 */
export const ProxyFunctionalService = {
  /**
   * Get current proxy configuration
   * @returns {Promise<ProxyConfig>} Current proxy configuration
   */
  async getProxyConfig(): Promise<ProxyConfig> {
    const response = await ElectronAPIClient.request('GET', '/api/proxies/config');
    return response.json();
  },

  /**
   * Update proxy configuration
   * @param {Partial<ProxyConfig>} config - Partial proxy configuration to update
   * @returns {Promise<ProxyConfig>} Updated proxy configuration
   */
  async updateProxyConfig(config: Partial<ProxyConfig>): Promise<ProxyConfig> {
    const response = await ElectronAPIClient.request('PUT', '/api/proxies/config', config);
    return response.json();
  },

  /**
   * Test current proxy connection
   * @returns {Promise<ProxyTestResult>} Test result
   */
  async testProxyConnection(): Promise<ProxyTestResult> {
    const response = await ElectronAPIClient.request('POST', '/api/proxies/test');
    return response.json();
  },

  /**
   * Get all proxies
   * @returns {Promise<Proxy[]>} List of proxies
   */
  async getProxies(): Promise<Proxy[]> {
    const response = await ElectronAPIClient.request('GET', '/api/proxies');
    return response.json();
  },

  /**
   * Get a specific proxy by ID
   * @param {string} id - Proxy ID
   * @returns {Promise<Proxy>} The proxy
   */
  async getProxyById(id: string): Promise<Proxy> {
    const response = await ElectronAPIClient.request('GET', `/api/proxies/${id}`);
    return response.json();
  },

  /**
   * Create a new proxy
   * @param {CreateProxyData} proxyData - Proxy data
   * @returns {Promise<Proxy>} Created proxy
   */
  async createProxy(proxyData: CreateProxyData): Promise<Proxy> {
    const response = await ElectronAPIClient.request('POST', '/api/proxies', proxyData);
    return response.json();
  },

  /**
   * Update a proxy
   * @param {string} id - Proxy ID
   * @param {UpdateProxyData} proxyData - Updated proxy data
   * @returns {Promise<Proxy>} Updated proxy
   */
  async updateProxy(id: string, proxyData: UpdateProxyData): Promise<Proxy> {
    const response = await ElectronAPIClient.request('PUT', `/api/proxies/${id}`, proxyData);
    return response.json();
  },

  /**
   * Delete a proxy
   * @param {string} proxyId - Proxy ID
   * @returns {Promise<{success: boolean}>} Delete result
   */
  async deleteProxy(proxyId: string): Promise<{success: boolean}> {
    const response = await ElectronAPIClient.request('DELETE', `/api/proxies/${proxyId}`);
    return response.json();
  },

  /**
   * Test a specific proxy
   * @param {string} proxyId - Proxy ID
   * @returns {Promise<ProxyTestResult>} Test result
   */
  async testProxy(proxyId: string): Promise<ProxyTestResult> {
    const response = await ElectronAPIClient.request('POST', `/api/proxies/${proxyId}/test`);
    return response.json();
  },

  /**
   * Import multiple proxies
   * @param {ImportProxyData[]} proxies - Array of proxy data to import
   * @returns {Promise<{success: boolean, count: number}>} Import result
   */
  async importProxies(proxies: ImportProxyData[]): Promise<{success: boolean, count: number}> {
    const response = await ElectronAPIClient.request('POST', '/api/proxies/import', { proxies });
    return response.json();
  },

  /**
   * Export proxies
   * @param {string[]} proxyIds - Array of proxy IDs to export
   * @returns {Promise<Blob>} Exported proxies as blob
   */
  async exportProxies(proxyIds: string[]): Promise<Blob> {
    const response = await ElectronAPIClient.request('POST', '/api/proxies/export', { proxyIds });
    return response.blob();
  },

  /**
   * Get all proxy groups
   * @returns {Promise<Group[]>} List of proxy groups
   */
  async getProxyGroups(): Promise<Group[]> {
    const response = await ElectronAPIClient.request('GET', '/api/proxies/groups');
    return response.json();
  },

  /**
   * Create a new proxy group
   * @param {CreateProxyGroupData} groupData - Group data
   * @returns {Promise<Group>} Created group
   */
  async createProxyGroup(groupData: CreateProxyGroupData): Promise<Group> {
    const response = await ElectronAPIClient.request('POST', '/api/proxies/groups', groupData);
    return response.json();
  },

  /**
   * Delete a proxy group
   * @param {string} groupId - Group ID
   * @returns {Promise<{success: boolean}>} Delete result
   */
  async deleteProxyGroup(groupId: string): Promise<{success: boolean}> {
    const response = await ElectronAPIClient.request('DELETE', `/api/proxies/groups/${groupId}`);
    return response.json();
  },

  /**
   * Add proxies to a group
   * @param {string} groupId - Group ID
   * @param {string[]} proxyIds - Array of proxy IDs
   * @returns {Promise<{success: boolean}>} Result
   */
  async addProxiesToGroup(payload: AddToGroupPayload): Promise<{success: boolean}> {
    const { mode, groupId, newGroupName, itemIds: proxyIds } = payload;

    let targetGroupId: string | null = groupId;

    // BƯỚC A: KIỂM TRA NẾU CẦN TẠO GROUP MỚI
    if (mode === 'new') {
        if (!newGroupName) {
            throw new Error("Group name is required to create a new group.");
        }

        // Gọi hàm tạo group đã có sẵn trong chính service này
        console.log(`Service: Creating new group "${newGroupName}"...`);
        const newGroup = await this.createProxyGroup({ 
            name: newGroupName,
            description: "" // Description có thể là rỗng hoặc bạn thêm vào dialog
        });

        if (!newGroup || !newGroup.id) {
            throw new Error("Failed to create new group from service.");
        }
        
        // Lấy ID của group vừa tạo để dùng cho bước tiếp theo
        targetGroupId = newGroup.id.toString();
        console.log(`Service: New group created with ID ${targetGroupId}.`);
    }
    
    // BƯỚC B: THÊM PROXY VÀO GROUP (DÙ MỚI HAY CŨ)
    if (!targetGroupId) {
        throw new Error("No target group ID specified.");
    }
    if (!proxyIds || proxyIds.length === 0) {
        throw new Error("No proxies selected to add to the group.");
    }
    
    console.log(`Service: Adding proxies [${proxyIds.join(',')}] to group ${targetGroupId}...`);
    const response = await ElectronAPIClient.request('POST', `/api/proxies/groups/${targetGroupId}/add`, { proxyIds });
    return response.json();
  },

  /**
   * Remove proxies from a group
   * @param {string} groupId - Group ID
   * @param {string[]} proxyIds - Array of proxy IDs
   * @returns {Promise<{success: boolean}>} Result
   */
  async removeProxiesFromGroup(groupId: string, proxyIds: string[]): Promise<{success: boolean}> {
    const response = await ElectronAPIClient.request('POST', `/api/proxies/groups/${groupId}/remove`, { proxyIds });
    return response.json();
  },

  /**
   * Get proxies in a group
   * @param {string} groupId - Group ID
   * @returns {Promise<Proxy[]>} List of proxies in the group
   */
  async getProxiesInGroup(groupId: string): Promise<Proxy[]> {
    const response = await ElectronAPIClient.request('GET', `/api/proxies/groups/${groupId}/proxies`);
    return response.json();
  },

  /**
   * Find a proxy by host and port
   * @param {string} host - Proxy host
   * @param {number} port - Proxy port
   * @returns {Promise<Proxy | null>} Found proxy or null if not found
   */
  async findProxyByHostPort(host: string, port: number): Promise<Proxy | null> {
    const response = await ElectronAPIClient.request('GET', `/api/proxies/find?host=${host}&port=${port}`);
    const result = await response.json();
    return result.proxy || null;
  },

  /**
   * === HELPER FUNCTIONS ===
   */
  
  /**
   * Format proxy untuk display
   * @param {Proxy} proxy - The proxy to format
   * @returns {string} Formatted proxy string
   */
  formatProxyString(proxy: Proxy): string {
    if (!proxy) return '';
    
    let auth = '';
    if (proxy.username && proxy.password) {
      auth = `${proxy.username}:${proxy.password}@`;
    }
    
    return `${proxy.type}://${auth}${proxy.address}`;
  },
  
  /**
   * Parse proxy string to proxy data
   * @param {string} proxyString - Proxy string to parse
   * @returns {Partial<Proxy>} Parsed proxy data
   */
  parseProxyString(proxyString: string): Partial<Proxy> {
    try {
      // Handle proxy format: protocol://[username:password@]host:port
      const regex = /^(https?|socks[45]?):\/\/(?:([^:@]+):([^@]+)@)?([^:]+):(\d+)\/?$/i;
      const match = proxyString.match(regex);
      
      if (!match) {
        throw new Error('Invalid proxy format');
      }
      
      const [_, type, username, password, host, port] = match;
      
      return {
        type: type.toLowerCase(),
        host,
        port: parseInt(port, 10),
        address: `${host}:${port}`,
        username: username || undefined,
        password: password || undefined,
        status: 'offline', // Default status until tested
        location: 'Unknown', // Default location
      };
    } catch (error) {
      throw new Error('Invalid proxy format');
    }
  },
  
  /**
   * Get status display info for a proxy
   * @param {Proxy} proxy - The proxy
   * @returns {{label: string, color: string}} Status display info
   */
  getProxyStatusInfo(proxy: Proxy): {label: string, color: string} {
    if (proxy.status === 'online') {
      return { label: 'Online', color: 'green' };
    } else {
      return { label: 'Offline', color: 'red' };
    }
  }
};