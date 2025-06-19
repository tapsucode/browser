import { ProxyService } from '../services/proxy.service';
import { 
  proxyConfigSchema, 
  createProxySchema, 
  updateProxySchema,
  importProxiesSchema,
  exportProxiesSchema,
  createProxyGroupSchema,
  updateProxyGroupSchema,
  manageGroupProxiesSchema
} from '../services/proxy.service';
import { 
  type APIProxyConfig,
  type APICreateProxyRequest,
  type APIUpdateProxyRequest 
} from '../models/Proxy';
import { 
  type APICreateProxyGroupRequest,
  type APIManageGroupProxiesRequest 
} from '../models/ProxyGroup';
import { z } from 'zod';
import { type AuthenticatedUser } from '../middleware/auth.middleware';

export class ProxyController {
  /**
   * Handle requests from main.js routing for /api/proxies/*
   * Parse method and URL to call appropriate method
   */
  static async handleRequest(method: string, url: string, data: any, headers: any = {}, authenticatedUser: AuthenticatedUser | null = null): Promise<any> {
    try {
      // Parse URL path: /api/proxies/123 -> /123
      const urlParts = url.split('/').filter(part => part !== '');
      const path = '/' + urlParts.slice(2).join('/'); // Remove 'api', 'proxies'
      
      switch (method) {
        case 'GET':
          if (path === '/') {
            return await this.handleGetAllProxies();
          } else if (path === '/config') {
            return await this.handleGetConfig();
          } else if (path === '/find') {
            return await this.handleFindProxyByAddress(data);
          } else if (path === '/groups') {
            return await this.handleGetAllProxyGroups();
          } else if (path.match(/^\/\d+$/)) {
            // /123
            const id = parseInt(path.substring(1));
            return await this.handleGetProxyById(id);
          } else if (path.match(/^\/groups\/\d+\/proxies$/)) {
            // /groups/123/proxies
            const id = parseInt(path.split('/')[2]);
            return await this.handleGetProxiesInGroup(id);
          } else {
            throw new Error(`Unknown GET route: ${path}`);
          }
          
        case 'POST':
          if (path === '/') {
            return await this.handleCreateProxy(data);
          } else if (path === '/test') {
            return await this.handleTestConnection(data);
          } else if (path === '/import') {
            return await this.handleImportProxies(data);
          } else if (path === '/export') {
            return await this.handleExportProxies(data);
          } else if (path === '/groups') {
            return await this.handleCreateProxyGroup(data);
          } else if (path.match(/^\/\d+\/test$/)) {
            // /123/test
            const id = parseInt(path.split('/')[1]);
            return await this.handleTestProxyConnection(id);
          } else if (path.match(/^\/groups\/\d+\/add$/)) {
            // /groups/123/add
            const id = parseInt(path.split('/')[2]);
            return await this.handleAddProxiesToGroup(id, data);
          } else if (path.match(/^\/groups\/\d+\/remove$/)) {
            // /groups/123/remove
            const id = parseInt(path.split('/')[2]);
            return await this.handleRemoveProxiesFromGroup(id, data);
          } else {
            throw new Error(`Unknown POST route: ${path}`);
          }
          
        case 'PUT':
          if (path === '/config') {
            return await this.handleUpdateConfig(data);
          } else {
            throw new Error(`Unknown PUT route: ${path}`);
          }
          
        case 'PATCH':
          if (path.match(/^\/\d+$/)) {
            // /123
            const id = parseInt(path.substring(1));
            return await this.handleUpdateProxy(id, data);
          } else {
            throw new Error(`Unknown PATCH route: ${path}`);
          }
          
        case 'DELETE':
          if (path.match(/^\/\d+$/)) {
            // /123
            const id = parseInt(path.substring(1));
            return await this.handleDeleteProxy(id);
          } else if (path.match(/^\/groups\/\d+$/)) {
            // /groups/123
            const id = parseInt(path.split('/')[2]);
            return await this.handleDeleteProxyGroup(id);
          } else {
            throw new Error(`Unknown DELETE route: ${path}`);
          }
          
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      console.error('ProxyController.handleRequest error:', error);
      throw error;
    }
  }

  // Embedded handlers that call business logic directly
  private static async handleGetConfig(): Promise<any> {
    try {
      const config = await ProxyService.getConfig();
      return config;
    } catch (error: any) {
      console.error('Error getting config:', error);
      throw new Error('Failed to get proxy config');
    }
  }

  private static async handleUpdateConfig(data: any): Promise<any> {
    try {
      const configData = proxyConfigSchema.parse(data);
      const result = await ProxyService.updateConfig(configData);
      return result;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid config data: ' + error.errors.map(e => e.message).join(', '));
      }
      console.error('Error updating config:', error);
      throw new Error('Failed to update proxy config');
    }
  }

  private static async handleTestConnection(data: any): Promise<any> {
    try {
      const result = await ProxyService.testConnection();
      return result;
    } catch (error: any) {
      console.error('Error testing connection:', error);
      throw new Error('Failed to test connection');
    }
  }

  private static async handleGetAllProxies(): Promise<any> {
    try {
      const proxies = await ProxyService.getAllProxies();
      return proxies;
    } catch (error: any) {
      console.error('Error getting all proxies:', error);
      throw new Error('Failed to get proxies');
    }
  }

  private static async handleGetProxyById(id: number): Promise<any> {
    try {
      if (isNaN(id)) {
        throw new Error('Invalid proxy ID');
      }
      
      const proxy = await ProxyService.getProxyById(id);
      if (!proxy) {
        throw new Error('Proxy not found');
      }
      
      return proxy;
    } catch (error: any) {
      console.error('Error getting proxy by ID:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get proxy');
    }
  }

  private static async handleCreateProxy(data: any): Promise<any> {
    try {
      const proxyData = createProxySchema.parse(data);
      const result = await ProxyService.createProxy(proxyData);
      return result;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid proxy data: ' + error.errors.map(e => e.message).join(', '));
      }
      console.error('Error creating proxy:', error);
      throw new Error('Failed to create proxy');
    }
  }

  private static async handleUpdateProxy(id: number, data: any): Promise<any> {
    try {
      if (isNaN(id)) {
        throw new Error('Invalid proxy ID');
      }
      
      const proxyData = updateProxySchema.parse(data);
      const result = await ProxyService.updateProxy(id, proxyData);
      
      if (!result) {
        throw new Error('Proxy not found');
      }
      
      return result;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid proxy data: ' + error.errors.map(e => e.message).join(', '));
      }
      console.error('Error updating proxy:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update proxy');
    }
  }

  private static async handleDeleteProxy(id: number): Promise<any> {
    try {
      if (isNaN(id)) {
        throw new Error('Invalid proxy ID');
      }
      
      const result = await ProxyService.deleteProxy(id);
      if (!result) {
        throw new Error('Proxy not found');
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting proxy:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete proxy');
    }
  }

  private static async handleTestProxyConnection(id: number): Promise<any> {
    try {
      if (isNaN(id)) {
        throw new Error('Invalid proxy ID');
      }
      
      const result = await ProxyService.testProxyConnection(id);
      return result;
    } catch (error: any) {
      if (error.message === 'Proxy not found') {
        throw new Error('Proxy not found');
      }
      console.error('Error testing proxy connection:', error);
      throw new Error('Failed to test proxy connection');
    }
  }

  private static async handleImportProxies(data: any): Promise<any> {
    try {
      const importData = importProxiesSchema.parse(data);
      const result = await ProxyService.importProxies(importData);
      return result;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid import data: ' + error.errors.map(e => e.message).join(', '));
      }
      console.error('Error importing proxies:', error);
      throw new Error('Failed to import proxies');
    }
  }

  private static async handleExportProxies(data: any): Promise<any> {
    try {
      const exportData = exportProxiesSchema.parse(data);
      const result = await ProxyService.exportProxies(exportData);
      return result;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid export data: ' + error.errors.map(e => e.message).join(', '));
      }
      console.error('Error exporting proxies:', error);
      throw new Error('Failed to export proxies');
    }
  }

  private static async handleGetAllProxyGroups(): Promise<any> {
    try {
      const groups = await ProxyService.getAllProxyGroups();
      return groups;
    } catch (error: any) {
      console.error('Error getting all proxy groups:', error);
      throw new Error('Failed to get proxy groups');
    }
  }

  private static async handleCreateProxyGroup(data: any): Promise<any> {
    try {
      const groupData = createProxyGroupSchema.parse(data);
      const result = await ProxyService.createProxyGroup(groupData);
      return result;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid group data: ' + error.errors.map(e => e.message).join(', '));
      }
      console.error('Error creating proxy group:', error);
      throw new Error('Failed to create proxy group');
    }
  }

  private static async handleDeleteProxyGroup(id: number): Promise<any> {
    try {
      if (isNaN(id)) {
        throw new Error('Invalid group ID');
      }
      
      const result = await ProxyService.deleteProxyGroup(id);
      if (!result) {
        throw new Error('Proxy group not found');
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting proxy group:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete proxy group');
    }
  }

  private static async handleAddProxiesToGroup(groupId: number, data: any): Promise<any> {
    try {
      if (isNaN(groupId)) {
        throw new Error('Invalid group ID');
      }
      
      const requestData = manageGroupProxiesSchema.parse(data);
      const result = await ProxyService.addProxiesToGroup(groupId, requestData);
      return result;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid request data: ' + error.errors.map(e => e.message).join(', '));
      }
      if (error.message === 'Proxy group not found') {
        throw new Error('Proxy group not found');
      }
      console.error('Error adding proxies to group:', error);
      throw new Error('Failed to add proxies to group');
    }
  }

  private static async handleRemoveProxiesFromGroup(groupId: number, data: any): Promise<any> {
    try {
      if (isNaN(groupId)) {
        throw new Error('Invalid group ID');
      }
      
      const requestData = manageGroupProxiesSchema.parse(data);
      const result = await ProxyService.removeProxiesFromGroup(groupId, requestData);
      return result;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid request data: ' + error.errors.map(e => e.message).join(', '));
      }
      if (error.message === 'Proxy group not found') {
        throw new Error('Proxy group not found');
      }
      console.error('Error removing proxies from group:', error);
      throw new Error('Failed to remove proxies from group');
    }
  }

  private static async handleGetProxiesInGroup(groupId: number): Promise<any> {
    try {
      if (isNaN(groupId)) {
        throw new Error('Invalid group ID');
      }
      
      const result = await ProxyService.getProxiesInGroup(groupId);
      return result;
    } catch (error: any) {
      if (error.message === 'Proxy group not found') {
        throw new Error('Proxy group not found');
      }
      console.error('Error getting proxies in group:', error);
      throw new Error('Failed to get proxies in group');
    }
  }

  private static async handleFindProxyByAddress(data: any): Promise<any> {
    try {
      const { host, port } = data;
      
      if (!host || !port) {
        throw new Error('Host and port are required');
      }

      const portNum = parseInt(port as string);
      if (isNaN(portNum)) {
        throw new Error('Invalid port number');
      }

      const result = await ProxyService.findProxyByAddress(host as string, portNum);
      return result;
    } catch (error: any) {
      if (error.message === 'Proxy not found') {
        throw new Error('Proxy not found');
      }
      console.error('Error finding proxy by address:', error);
      throw new Error('Failed to find proxy');
    }
  }
}