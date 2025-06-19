// File: final/workflow/handlers/output.ts

import { ExecutionContext, NodeHandler } from '../types';

export const outputHandler: NodeHandler = async (context: ExecutionContext, params: Record<string, any>, nodeId: string): Promise<ExecutionContext> => {
  const { variables } = context;
  
  switch (nodeId) {
    case 'output':
    case 'result':
      const output = params.output || params.value || variables[params.variable] || variables;
      variables.finalOutput = output;
      
      context.log.push({
        timestamp: new Date(),
        level: 'info',
        message: `Output generated: ${JSON.stringify(output, null, 2)}`,
        nodeId
      });
      break;
      
    case 'log':
    case 'console':
      const message = params.message || variables[params.messageVariable] || 'Log output';
      const level = params.level || 'info';
      
      context.log.push({
        timestamp: new Date(),
        level: level as 'info' | 'warn' | 'error',
        message: String(message),
        nodeId
      });
      break;
      
    case 'saveResult':
      if (params.variable && params.value !== undefined) {
        variables[params.variable] = params.value;
        
        context.log.push({
          timestamp: new Date(),
          level: 'info',
          message: `Result saved to variable: ${params.variable}`,
          nodeId
        });
      }
      break;
      
    case 'export':
      const exportData = params.data || variables[params.dataVariable] || variables;
      const format = params.format || 'json';
      
      let exportedData;
      switch (format.toLowerCase()) {
        case 'json':
          exportedData = JSON.stringify(exportData, null, 2);
          break;
        case 'csv':
          exportedData = convertToCSV(exportData);
          break;
        case 'text':
          exportedData = String(exportData);
          break;
        default:
          exportedData = JSON.stringify(exportData, null, 2);
      }
      
      variables.exportedData = exportedData;
      variables.exportFormat = format;
      
      context.log.push({
        timestamp: new Date(),
        level: 'info',
        message: `Data exported in ${format} format`,
        nodeId
      });
      break;
      
    case 'screenshot':
      if (context.page) {
        try {
          // Simulate screenshot capture
          const screenshotPath = params.path || `screenshot_${Date.now()}.png`;
          
          // In real implementation: await context.page.screenshot({ path: screenshotPath });
          variables.screenshotPath = screenshotPath;
          
          context.log.push({
            timestamp: new Date(),
            level: 'info',
            message: `Screenshot captured: ${screenshotPath}`,
            nodeId
          });
        } catch (error) {
          context.log.push({
            timestamp: new Date(),
            level: 'error',
            message: `Screenshot failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            nodeId
          });
        }
      }
      break;
      
    case 'downloadFile':
      if (params.url && params.filename) {
        try {
          // Simulate file download
          const downloadPath = params.path || `downloads/${params.filename}`;
          
          variables.downloadedFile = {
            url: params.url,
            filename: params.filename,
            path: downloadPath,
            timestamp: new Date().toISOString()
          };
          
          context.log.push({
            timestamp: new Date(),
            level: 'info',
            message: `File downloaded: ${params.filename}`,
            nodeId
          });
        } catch (error) {
          context.log.push({
            timestamp: new Date(),
            level: 'error',
            message: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            nodeId
          });
        }
      }
      break;
      
    default:
      context.log.push({
        timestamp: new Date(),
        level: 'warn',
        message: `Unhandled output node: ${nodeId}`,
        nodeId
      });
  }
  
  return context;
};

// Helper function to convert data to CSV format
function convertToCSV(data: any): string {
  if (Array.isArray(data) && data.length > 0) {
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ];
    return csvRows.join('\n');
  } else if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data);
    return entries.map(([key, value]) => `${key},${JSON.stringify(value)}`).join('\n');
  } else {
    return String(data);
  }
}