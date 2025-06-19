"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyController = void 0;
const proxy_service_1 = require("../services/proxy.service");
const proxy_service_2 = require("../services/proxy.service");
const zod_1 = require("zod");
class ProxyController {
    /**
     * Handle requests from main.js routing for /api/proxies/*
     * Parse method and URL to call appropriate method
     */
    static async handleRequest(method, url, data, headers = {}, authenticatedUser = null) {
        try {
            // Parse URL path: /api/proxies/123 -> /123
            const urlParts = url.split('/').filter(part => part !== '');
            const path = '/' + urlParts.slice(2).join('/'); // Remove 'api', 'proxies'
            switch (method) {
                case 'GET':
                    if (path === '/') {
                        return await this.handleGetAllProxies();
                    }
                    else if (path === '/config') {
                        return await this.handleGetConfig();
                    }
                    else if (path === '/find') {
                        return await this.handleFindProxyByAddress(data);
                    }
                    else if (path === '/groups') {
                        return await this.handleGetAllProxyGroups();
                    }
                    else if (path.match(/^\/\d+$/)) {
                        // /123
                        const id = parseInt(path.substring(1));
                        return await this.handleGetProxyById(id);
                    }
                    else if (path.match(/^\/groups\/\d+\/proxies$/)) {
                        // /groups/123/proxies
                        const id = parseInt(path.split('/')[2]);
                        return await this.handleGetProxiesInGroup(id);
                    }
                    else {
                        throw new Error(`Unknown GET route: ${path}`);
                    }
                case 'POST':
                    if (path === '/') {
                        return await this.handleCreateProxy(data);
                    }
                    else if (path === '/test') {
                        return await this.handleTestConnection(data);
                    }
                    else if (path === '/import') {
                        return await this.handleImportProxies(data);
                    }
                    else if (path === '/export') {
                        return await this.handleExportProxies(data);
                    }
                    else if (path === '/groups') {
                        return await this.handleCreateProxyGroup(data);
                    }
                    else if (path.match(/^\/\d+\/test$/)) {
                        // /123/test
                        const id = parseInt(path.split('/')[1]);
                        return await this.handleTestProxyConnection(id);
                    }
                    else if (path.match(/^\/groups\/\d+\/add$/)) {
                        // /groups/123/add
                        const id = parseInt(path.split('/')[2]);
                        return await this.handleAddProxiesToGroup(id, data);
                    }
                    else if (path.match(/^\/groups\/\d+\/remove$/)) {
                        // /groups/123/remove
                        const id = parseInt(path.split('/')[2]);
                        return await this.handleRemoveProxiesFromGroup(id, data);
                    }
                    else {
                        throw new Error(`Unknown POST route: ${path}`);
                    }
                case 'PUT':
                    if (path === '/config') {
                        return await this.handleUpdateConfig(data);
                    }
                    else {
                        throw new Error(`Unknown PUT route: ${path}`);
                    }
                case 'PATCH':
                    if (path.match(/^\/\d+$/)) {
                        // /123
                        const id = parseInt(path.substring(1));
                        return await this.handleUpdateProxy(id, data);
                    }
                    else {
                        throw new Error(`Unknown PATCH route: ${path}`);
                    }
                case 'DELETE':
                    if (path.match(/^\/\d+$/)) {
                        // /123
                        const id = parseInt(path.substring(1));
                        return await this.handleDeleteProxy(id);
                    }
                    else if (path.match(/^\/groups\/\d+$/)) {
                        // /groups/123
                        const id = parseInt(path.split('/')[2]);
                        return await this.handleDeleteProxyGroup(id);
                    }
                    else {
                        throw new Error(`Unknown DELETE route: ${path}`);
                    }
                default:
                    throw new Error(`Unknown method: ${method}`);
            }
        }
        catch (error) {
            console.error('ProxyController.handleRequest error:', error);
            throw error;
        }
    }
    // Embedded handlers that call business logic directly
    static async handleGetConfig() {
        try {
            const config = await proxy_service_1.ProxyService.getConfig();
            return config;
        }
        catch (error) {
            console.error('Error getting config:', error);
            throw new Error('Failed to get proxy config');
        }
    }
    static async handleUpdateConfig(data) {
        try {
            const configData = proxy_service_2.proxyConfigSchema.parse(data);
            const result = await proxy_service_1.ProxyService.updateConfig(configData);
            return result;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new Error('Invalid config data: ' + error.errors.map(e => e.message).join(', '));
            }
            console.error('Error updating config:', error);
            throw new Error('Failed to update proxy config');
        }
    }
    static async handleTestConnection(data) {
        try {
            const result = await proxy_service_1.ProxyService.testConnection();
            return result;
        }
        catch (error) {
            console.error('Error testing connection:', error);
            throw new Error('Failed to test connection');
        }
    }
    static async handleGetAllProxies() {
        try {
            const proxies = await proxy_service_1.ProxyService.getAllProxies();
            return proxies;
        }
        catch (error) {
            console.error('Error getting all proxies:', error);
            throw new Error('Failed to get proxies');
        }
    }
    static async handleGetProxyById(id) {
        try {
            if (isNaN(id)) {
                throw new Error('Invalid proxy ID');
            }
            const proxy = await proxy_service_1.ProxyService.getProxyById(id);
            if (!proxy) {
                throw new Error('Proxy not found');
            }
            return proxy;
        }
        catch (error) {
            console.error('Error getting proxy by ID:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to get proxy');
        }
    }
    static async handleCreateProxy(data) {
        try {
            const proxyData = proxy_service_2.createProxySchema.parse(data);
            const result = await proxy_service_1.ProxyService.createProxy(proxyData);
            return result;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new Error('Invalid proxy data: ' + error.errors.map(e => e.message).join(', '));
            }
            console.error('Error creating proxy:', error);
            throw new Error('Failed to create proxy');
        }
    }
    static async handleUpdateProxy(id, data) {
        try {
            if (isNaN(id)) {
                throw new Error('Invalid proxy ID');
            }
            const proxyData = proxy_service_2.updateProxySchema.parse(data);
            const result = await proxy_service_1.ProxyService.updateProxy(id, proxyData);
            if (!result) {
                throw new Error('Proxy not found');
            }
            return result;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new Error('Invalid proxy data: ' + error.errors.map(e => e.message).join(', '));
            }
            console.error('Error updating proxy:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to update proxy');
        }
    }
    static async handleDeleteProxy(id) {
        try {
            if (isNaN(id)) {
                throw new Error('Invalid proxy ID');
            }
            const result = await proxy_service_1.ProxyService.deleteProxy(id);
            if (!result) {
                throw new Error('Proxy not found');
            }
            return { success: true };
        }
        catch (error) {
            console.error('Error deleting proxy:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to delete proxy');
        }
    }
    static async handleTestProxyConnection(id) {
        try {
            if (isNaN(id)) {
                throw new Error('Invalid proxy ID');
            }
            const result = await proxy_service_1.ProxyService.testProxyConnection(id);
            return result;
        }
        catch (error) {
            if (error.message === 'Proxy not found') {
                throw new Error('Proxy not found');
            }
            console.error('Error testing proxy connection:', error);
            throw new Error('Failed to test proxy connection');
        }
    }
    static async handleImportProxies(data) {
        try {
            const importData = proxy_service_2.importProxiesSchema.parse(data);
            const result = await proxy_service_1.ProxyService.importProxies(importData);
            return result;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new Error('Invalid import data: ' + error.errors.map(e => e.message).join(', '));
            }
            console.error('Error importing proxies:', error);
            throw new Error('Failed to import proxies');
        }
    }
    static async handleExportProxies(data) {
        try {
            const exportData = proxy_service_2.exportProxiesSchema.parse(data);
            const result = await proxy_service_1.ProxyService.exportProxies(exportData);
            return result;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new Error('Invalid export data: ' + error.errors.map(e => e.message).join(', '));
            }
            console.error('Error exporting proxies:', error);
            throw new Error('Failed to export proxies');
        }
    }
    static async handleGetAllProxyGroups() {
        try {
            const groups = await proxy_service_1.ProxyService.getAllProxyGroups();
            return groups;
        }
        catch (error) {
            console.error('Error getting all proxy groups:', error);
            throw new Error('Failed to get proxy groups');
        }
    }
    static async handleCreateProxyGroup(data) {
        try {
            const groupData = proxy_service_2.createProxyGroupSchema.parse(data);
            const result = await proxy_service_1.ProxyService.createProxyGroup(groupData);
            return result;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new Error('Invalid group data: ' + error.errors.map(e => e.message).join(', '));
            }
            console.error('Error creating proxy group:', error);
            throw new Error('Failed to create proxy group');
        }
    }
    static async handleDeleteProxyGroup(id) {
        try {
            if (isNaN(id)) {
                throw new Error('Invalid group ID');
            }
            const result = await proxy_service_1.ProxyService.deleteProxyGroup(id);
            if (!result) {
                throw new Error('Proxy group not found');
            }
            return { success: true };
        }
        catch (error) {
            console.error('Error deleting proxy group:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to delete proxy group');
        }
    }
    static async handleAddProxiesToGroup(groupId, data) {
        try {
            if (isNaN(groupId)) {
                throw new Error('Invalid group ID');
            }
            const requestData = proxy_service_2.manageGroupProxiesSchema.parse(data);
            const result = await proxy_service_1.ProxyService.addProxiesToGroup(groupId, requestData);
            return result;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new Error('Invalid request data: ' + error.errors.map(e => e.message).join(', '));
            }
            if (error.message === 'Proxy group not found') {
                throw new Error('Proxy group not found');
            }
            console.error('Error adding proxies to group:', error);
            throw new Error('Failed to add proxies to group');
        }
    }
    static async handleRemoveProxiesFromGroup(groupId, data) {
        try {
            if (isNaN(groupId)) {
                throw new Error('Invalid group ID');
            }
            const requestData = proxy_service_2.manageGroupProxiesSchema.parse(data);
            const result = await proxy_service_1.ProxyService.removeProxiesFromGroup(groupId, requestData);
            return result;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new Error('Invalid request data: ' + error.errors.map(e => e.message).join(', '));
            }
            if (error.message === 'Proxy group not found') {
                throw new Error('Proxy group not found');
            }
            console.error('Error removing proxies from group:', error);
            throw new Error('Failed to remove proxies from group');
        }
    }
    static async handleGetProxiesInGroup(groupId) {
        try {
            if (isNaN(groupId)) {
                throw new Error('Invalid group ID');
            }
            const result = await proxy_service_1.ProxyService.getProxiesInGroup(groupId);
            return result;
        }
        catch (error) {
            if (error.message === 'Proxy group not found') {
                throw new Error('Proxy group not found');
            }
            console.error('Error getting proxies in group:', error);
            throw new Error('Failed to get proxies in group');
        }
    }
    static async handleFindProxyByAddress(data) {
        try {
            const { host, port } = data;
            if (!host || !port) {
                throw new Error('Host and port are required');
            }
            const portNum = parseInt(port);
            if (isNaN(portNum)) {
                throw new Error('Invalid port number');
            }
            const result = await proxy_service_1.ProxyService.findProxyByAddress(host, portNum);
            return result;
        }
        catch (error) {
            if (error.message === 'Proxy not found') {
                throw new Error('Proxy not found');
            }
            console.error('Error finding proxy by address:', error);
            throw new Error('Failed to find proxy');
        }
    }
}
exports.ProxyController = ProxyController;
