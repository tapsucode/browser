// =====================================
// User Types
// =====================================
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================
// Proxy Types
// =====================================
// Proxy Configuration Type
export interface ProxyConfig {
  enabled: boolean;
  type: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  status?: 'online' | 'offline';
  lastChecked?: string;
}

// Proxy Type
export interface Proxy {
  id: string;
  name: string;
  type: string;
  address: string; // Combined host:port for display
  host?: string;   // Separate host for API
  port?: number;   // Separate port for API
  location: string;
  status: 'online' | 'offline';
  group?: string;
  username?: string;
  password?: string;
}

/**
 * Dữ liệu cần thiết để tạo proxy mới
 */
export interface CreateProxyData {
  name: string;
  type: string;
  host: string;
  port: number;
  location?: string;
  username?: string;
  password?: string;
  groupId?: string;
}

/**
 * Dữ liệu cập nhật proxy
 */
export interface UpdateProxyData {
  name?: string;
  type?: string;
  host?: string;
  port?: number;
  location?: string;
  username?: string;
  password?: string;
  groupId?: string | null;
}

/**
 * Dữ liệu tạo nhóm proxy
 */
export interface CreateProxyGroupData {
  name: string;
  description: string;
}

/**
 * Dữ liệu import proxy
 */
export interface ImportProxyData {
  name: string;
  type: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  location?: string;
}

/**
 * Kết quả kiểm tra proxy
 */
export interface ProxyTestResult {
  success: boolean;
  ping?: number;
  error?: string;
}

// =====================================
// Profile Types
// =====================================
/**
 * Thông tin fingerprint cho profile
 */
export interface FingerprintInfo {
  vendor?: string;
  renderer?: string;
  userAgent?: string;
  timezone?: string;
  language?: string;
  resolution?: string;
  platform?: string;
  doNotTrack?: boolean;
  webRtcMode?: 'real' | 'proxy' | 'disable' | 'custom'; // Đã sửa từ webRTC boolean
  webRtcCustomIp?: string; // IP tùy chỉnh khi mode = 'custom'
  canvasProtection?: boolean;
  webGL?: boolean;
  audioContext?: boolean;
  fontList?: boolean;
  clientRects?: boolean; // Đã có sẵn
  plugins?: {name: string, version: string}[];
  // Cho phép thêm các thuộc tính khác nếu cần
  [key: string]: any;
}

/**
 * Thông tin proxy trong profile
 */
export interface ProfileProxyInfo {
  proxyStatus: 'connected' | 'disconnected';
  proxyAddress?: string;
  proxyId?: string;
  proxyType?: string;
}

export interface Profile {
  id: string;
  name: string;
  osType: string;
  browserType: string;
  browserVersion: string;
  proxyStatus: 'connected' | 'disconnected';
  proxyAddress?: string;
  lastUsed: string;
  status: 'active' | 'idle';
  fingerprint?: FingerprintInfo; // Thông tin fingerprint cho profile
  group?: string;
}

// Profile creation data
export interface CreateProfileData {
  name?: string;
  count?: number | string;
  prefix?: string;
  proxySource?: 'none' | 'import' | 'select' | 'select group';
  proxyList?: string;
  selectedProxyGroup?: string | number;
  fingerprintMethod?: 'random' | 'custom';
  userAgent?: string;
  resolution?: string;
  language?: string;
  timezone?: string;
  platform?: string;
  vendor?: string;
  renderer?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  canvas?: boolean;
  webGL?: boolean;
  audioContext?: boolean;
  fonts?: boolean;
  clientRects?: boolean;
  webRtcMode?: 'real' | 'proxy' | 'disable' | 'custom';
  webRtcCustomIp?: string;
}

// Profile update data
export interface UpdateProfileData {
  name?: string;
  osType?: string;
  browserType?: string;
  browserVersion?: string;
  proxyMethod?: 'none' | 'direct' | 'proxy-group';
  proxyId?: string;
  proxyGroupId?: string;
  fingerprint?: {
    vendor?: string;
    renderer?: string;
    userAgent?: string;
    language?: string;
    resolution?: string;
    [key: string]: any;
  };
  groupId?: string;
}

// =====================================
// Group Types
// =====================================
// Group Type for both Profile Groups and Proxy Groups
export interface Group {
  id: string;
  name: string;
  description: string;
  profileCount?: number;
  proxyCount?: number;
}

// Group creation data
export interface CreateGroupData {
  name: string;
  description: string;
  type?: 'profile' | 'proxy';
}

// Group update data
export interface UpdateGroupData {
  name?: string;
  description?: string;
}

// =====================================
// Settings Types
// =====================================
// Types for settings
export interface PersonalSettings {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface SystemSettings {
  language: string;
  theme: string;
  notifications: boolean;
  desktopNotifications: boolean;
  soundEffects: boolean;
  autoUpdate: boolean;
  timezone: string;
}

export interface UserSettings {
  personal: PersonalSettings;
  system: SystemSettings;
}

// =====================================
// API Response Types
// =====================================
// Response types for API calls
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// =====================================
// Transaction/Payment Types
// =====================================
// Balance Type
export interface Balance {
  amount: number;
  currency: string;
  lastUpdated?: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'purchase';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  paymentMethod: string;
  fee?: number;
  description?: string;
}

// Deposit Request Type
export interface DepositRequest {
  amount: number;
  paymentMethod: 'bank' | 'paypal' | 'crypto';
  currency: string;
}

// Deposit Response Type
export interface DepositResponse {
  transactionId: string;
  amount: number;
  fee: number;
  total: number;
  paymentInstructions: string[];
  expiresAt: string;
}

// Process Payment Request Type
export interface ProcessPaymentRequest {
  transactionId: string;
  paymentProof?: string; // URL hoặc base64 của ảnh biên lai
}

// Process Payment Response Type
export interface ProcessPaymentResponse {
  success: boolean;
  message: string;
  status: 'pending' | 'completed' | 'failed';
  transaction?: Transaction;
}

// Payment Details Type
export interface PaymentDetails {
  bank: {
    title: string;
    content: string[];
  };
  paypal: {
    title: string;
    content: string[];
  };
  crypto: {
    title: string;
    content: string[];
  };
}

// Fee Structure Type
export interface FeeStructure {
  bank: number;
  paypal: number;
  crypto: number;
}

// =====================================
// Workflow Types
// =====================================
// Workflow Editor Types
export interface WorkflowNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  label?: string;
  style?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNodeType {
  id: string;
  type: string;
  category: string;
  label: string;
  description: string;
  icon?: string;
  properties?: Record<string, any>;
}

export interface WorkflowEditorRef {
  undo: () => void;
  redo: () => void;
  autoLayout: () => void;
  deleteSelectedNodes: () => void;
}

// =====================================
// Store/Product Types
// =====================================
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  imageUrl?: string;
  inStock: boolean;
  quantity?: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  productCount: number;
}

export interface PurchaseRequest {
  productId: string;
  quantity: number;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  transaction?: Transaction;
  productDetails?: Product;
}

// =====================================
// Fingerprint/Browser Types
// =====================================
export interface BrowserVendor {
  id: string;
  name: string;
}

export interface BrowserRenderer {
  id: string;
  name: string;
  vendorId: string;
}

export interface UserAgent {
  label: string;
  value: string;
}
// =====================================
// Workflow Types
// =====================================

export interface WorkflowNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    properties?: Record<string, unknown>;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  label?: string;
  style?: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowExecutionParams {
  groupId?: string;
  profileIds?: string[];
  threads: number;
}

export interface WorkflowExecutionResult {
  successCount: number;
  failureCount: number;
  details: Array<{
    profileId: string;
    success: boolean;
    error?: string;
  }>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  results?: WorkflowExecutionResult;
  progress?: {
    completed: number;
    total: number;
    percentComplete: number;
  };
}

export interface CreateWorkflowData {
  name: string;
  description?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
}

export interface UpdateWorkflowData {
  name?: string;
  description?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
}



// =====================================
// Workflow Execution Types  
// =====================================

export interface WorkflowNodeData {
  label: string;
  type: string;
  properties?: {
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    config?: Record<string, unknown>;
  };
}

export interface WorkflowNodePosition {
  x: number;
  y: number;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: WorkflowNodePosition;
  data: WorkflowNodeData;
}

export interface WorkflowEdgeStyle {
  strokeWidth?: number;
  stroke?: string;
  strokeDasharray?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'straight' | 'step' | 'smoothstep' | 'bezier';
  animated?: boolean;
  label?: string;
  style?: WorkflowEdgeStyle;
}

export interface WorkflowExecutionError {
  nodeId: string;
  message: string;
  stack?: string;
}

export interface WorkflowNodeResult {
  nodeId: string;
  status: 'success' | 'error' | 'skipped';
  output?: unknown;
  error?: WorkflowExecutionError;
  executionTime?: number;
}

export interface WorkflowResults {
  status: 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime: string;
  nodeResults: WorkflowNodeResult[];
  errors?: WorkflowExecutionError[];
  totalExecutionTime: number;
}

export interface WorkflowMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  ownerId: string;
}

export interface WorkflowExecutionRequest {
  workflowId: string;
  params?: Record<string, unknown>;
  targetGroups?: string[];
}

export interface WorkflowImportData {
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata?: Record<string, unknown>;
}

export interface WorkflowExportData extends WorkflowMetadata {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata?: Record<string, unknown>;
}