import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Progress } from "../components/ui/progress";
import { Plus, Flag, CheckCircle, Loader } from "lucide-react";
import { ProxyDialog } from "../components/proxy/proxy-dialog";
import { ProxyList } from "../components/proxy/proxy-list";
import { GroupSelectDialog, type AddToGroupPayload } from "../components/profile/group-select-dialog";
import { useProxy } from "../hooks/us/useProxy";
import { Proxy } from "../lib/types";

export default function NetworkPage() {
  const {
    // Data queries
    proxies = [],
    proxyConfig = { enabled: false, status: 'offline', host: '', port: 0, type: 'HTTP' },
    proxyGroups = [],
    isLoadingProxies,

    // Mutations
    testProxyConnection,
    testProxy,
    updateProxyConfig,
    createProxy,
    updateProxy,
    deleteProxy,
    importProxies,
    addProxiesToGroup,
    
    // Mutation states
    isTestingProxyConnection,
    isTestingProxy,
    isUpdatingProxyConfig,
  } = useProxy();
  
  // Local state
  const [selectedProxies, setSelectedProxies] = useState<string[]>([]);
  const [isAddProxyOpen, setIsAddProxyOpen] = useState(false);
  const [editingProxy, setEditingProxy] = useState<Proxy | null>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [groupDialogProxyIds, setGroupDialogProxyIds] = useState<string[]>([]);
  const [proxyAddress, setProxyAddress] = useState('');
  const [proxyType, setProxyType] = useState('HTTP');
  const [authRequired, setAuthRequired] = useState(false);
  
  // Handlers
  const handleAddProxy = (proxyData: any) => {
    createProxy(proxyData);
    setIsAddProxyOpen(false);
  };
  
  const handleEditProxy = (proxy: Proxy) => {
    setEditingProxy(proxy);
    setIsAddProxyOpen(true);
  };
  
  const handleDeleteProxy = (proxyId: string) => {
    deleteProxy(proxyId);
  };
  
  const handleTestProxy = (proxyId: string) => {
    testProxy(proxyId);
  };
  
  const handleBulkDelete = (proxyIds: string[]) => {
    proxyIds.forEach(id => deleteProxy(id));
  };
  
  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedProxies(newSelection);
  };
  
  const handleAddToGroup = (proxyIds: string[]) => {
    setGroupDialogProxyIds(proxyIds);
    setIsGroupDialogOpen(true);
  };
  
  const handleGroupSelection = (payload:AddToGroupPayload) => {
    addProxiesToGroup(payload);
    setIsGroupDialogOpen(false);
  };
  
  const handleImportProxies = (proxiesToImport: any[]) => {
    importProxies(proxiesToImport);
    setIsAddProxyOpen(false);
  };
  
  const handleTestConnection = () => {
    testProxyConnection();
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Network Management</h1>
        <p className="mt-1 text-sm text-gray-500">Configure and manage your proxy connections</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-end mb-2">
          <Button onClick={() => setIsAddProxyOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Proxy
          </Button>
        </div>
        <ProxyList 
          proxies={proxies}
          onEdit={handleEditProxy}
          onDelete={handleDeleteProxy}
          onTest={handleTestProxy}
          onBulkDelete={handleBulkDelete}
          onAddToGroup={handleAddToGroup}
          onSelectionChange={handleSelectionChange}
        />
      </div>
      
      {/* Add/Edit Proxy Dialog */}
      <ProxyDialog
        open={isAddProxyOpen}
        onOpenChange={setIsAddProxyOpen}
        // onSave={handleAddProxy}
        // initialValues={editingProxy || undefined}
        onAddProxy={handleAddProxy}
        onImportProxies={handleImportProxies}
        proxyGroups={proxyGroups}
        isLoadingProxyGroups={false}
      />
      
      {/* Group Selection Dialog */}
      <GroupSelectDialog
        open={isGroupDialogOpen}
        onOpenChange={setIsGroupDialogOpen}
        onAddToGroup={handleGroupSelection}
        profileIds={groupDialogProxyIds} // Reusing profileIds prop for proxy IDs
        groups={proxyGroups}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proxy Test Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="proxy-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Proxy Address
                </label>
                <Input
                  id="proxy-address"
                  placeholder="host:port"
                  value={proxyAddress}
                  onChange={(e) => setProxyAddress(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="proxy-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Proxy Type
                </label>
                <Select
                  value={proxyType}
                  onValueChange={setProxyType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select proxy type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HTTP">HTTP</SelectItem>
                    <SelectItem value="HTTPS">HTTPS</SelectItem>
                    <SelectItem value="SOCKS4">SOCKS4</SelectItem>
                    <SelectItem value="SOCKS5">SOCKS5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id="auth-required"
                  checked={authRequired}
                  onCheckedChange={(checked) => 
                    setAuthRequired(checked === true)
                  }
                />
                <label
                  htmlFor="auth-required"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Authentication Required
                </label>
              </div>
              <div className="pt-4 flex justify-end">
                <Button
                  variant="outline"
                  className="mr-3"
                  onClick={() => {
                    setProxyAddress("");
                    setProxyType("HTTP");
                    setAuthRequired(false);
                  }}
                >
                  Reset
                </Button>
                <Button onClick={handleTestConnection}>
                  Test Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connection Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-gray-700">Monthly Bandwidth Usage</div>
                  <div className="text-sm font-medium text-gray-900">4.2 GB / 10 GB</div>
                </div>
                <Progress value={42} className="h-2" />
              </div>
              <div className="pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Current Proxy Configuration</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-medium text-gray-900">
                        {proxyConfig.enabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                    <div className={`h-8 w-8 rounded-full ${proxyConfig.enabled && proxyConfig.status === 'online' ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                      {proxyConfig.enabled && proxyConfig.status === 'online' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="h-4 w-4 text-red-600">×</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm text-gray-900">{proxyConfig.type || "Not set"}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">
                      {proxyConfig.host && proxyConfig.port ? 
                        `${proxyConfig.host}:${proxyConfig.port}` : 
                        "Not configured"}
                    </p>
                  </div>
                  {proxyConfig.lastChecked && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Last Checked</p>
                      <p className="text-sm text-gray-900">
                        {new Date(proxyConfig.lastChecked).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <Button 
                    onClick={() => {
                      updateProxyConfig({ enabled: !proxyConfig.enabled });
                    }}
                    variant={proxyConfig.enabled ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                  >
                    {proxyConfig.enabled ? "Disable Proxy" : "Enable Proxy"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}