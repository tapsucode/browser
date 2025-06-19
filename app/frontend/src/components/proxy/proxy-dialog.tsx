import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Upload } from "lucide-react";
import { FaNetworkWired, FaCloudUploadAlt, FaRegListAlt } from "react-icons/fa";

// Define the schema for individual proxy
const proxySchema = z.object({
  address: z.string().min(3, "Address is required"),
  port: z.string().min(1, "Port is required"),
  type: z.string().min(1, "Proxy type is required"),
  name: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  group: z.string().optional(),
});

// Define the schema for bulk import
const bulkImportSchema = z.object({
  proxyList: z.string().min(5, "Proxy list is required"),
  proxyType: z.string().min(1, "Proxy type is required"),
  group: z.string().optional(),
  hasAuth: z.boolean().default(false),
});

type ProxyFormValues = z.infer<typeof proxySchema>;
type BulkImportFormValues = z.infer<typeof bulkImportSchema>;

// interface ProxyDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onAddProxy: (proxy: any) => void;
//   onImportProxies: (proxies: any[]) => void;
// }
interface ProxyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProxy: (proxy: any) => void;
  onImportProxies: (proxies: any[]) => void;
  proxyGroups: any[];
  isLoadingProxyGroups: boolean;
}

export function ProxyDialog({ open, onOpenChange, onAddProxy, onImportProxies, proxyGroups, isLoadingProxyGroups  }: ProxyDialogProps) {
  const [activeTab, setActiveTab] = useState("single");
  const [hasAuth, setHasAuth] = useState(false);

  // Form for single proxy
  const singleForm = useForm<ProxyFormValues>({
    resolver: zodResolver(proxySchema),
    defaultValues: {
      address: "",
      port: "",
      type: "HTTP",
      name: "",
      username: "",
      password: "",
      group: "none",
    },
  });

  // Form for bulk import
  const bulkForm = useForm<BulkImportFormValues>({
    resolver: zodResolver(bulkImportSchema),
    defaultValues: {
      proxyList: "",
      proxyType: "HTTP",
      group: "none",
      hasAuth: false,
    },
  });

  const onSubmitSingle = (data: ProxyFormValues) => {
    const payload: any = { ...data };

    payload.host = payload.address;
    delete payload.address; 

    payload.port = parseInt(payload.port, 10);
    payload.type = payload.type.toLowerCase();
    
    payload.name = payload.name?.trim() || payload.host;
    
    if (payload.group === '0' || !payload.group) {
        delete payload.group; 
    } else {
        payload.groupId = payload.group;
        delete payload.group;
    }

    onAddProxy(payload);

    singleForm.reset();
    onOpenChange(false);
};

  const onSubmitBulk = (data: BulkImportFormValues) => {

  const lines = data.proxyList.split('\n').filter(line => line.trim() !== '');
  
  const processedProxies = lines.map(line => {
    const parts = line.split(':');

    let address, portString, username, password;

    if (!data.hasAuth || parts.length < 4) { 
        if (parts.length < 2) return null; 
        portString = parts.pop();
        address = parts.join(':');
        username = undefined;
        password = undefined;

    } else { 
        password = parts.pop();
        username = parts.pop();
        portString = parts.pop();
        address = parts.join(':');
    }
    
    if (!address || !portString) {
      return null; 
    }

    const port = parseInt(portString, 10);
    if (isNaN(port)) {
      return null; 
    }

    return {

      name: `${address}`,

      port: port,

      type: data.proxyType.toLowerCase(),
      
      host: address,
      username: username, 
      password: password, 
      groupId: data.group === 'none' ? undefined : data.group, 
    };
  }).filter(proxy => proxy !== null); 

  if (processedProxies.length > 0) {
    onImportProxies(processedProxies);
    bulkForm.reset();
    onOpenChange(false);
  }
};

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      bulkForm.setValue('proxyList', content);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaNetworkWired className="h-5 w-5 text-primary" />
            Add Proxy
          </DialogTitle>
          <DialogDescription>
            Add a single proxy or import multiple proxies at once
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="single" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Single Proxy</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Bulk Import</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Form {...singleForm}>
              <form onSubmit={singleForm.handleSubmit(onSubmitSingle)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={singleForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IP Address</FormLabel>
                        <FormControl>
                          <Input placeholder="192.168.1.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={singleForm.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input placeholder="8080" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={singleForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proxy Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select proxy type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HTTP">HTTP</SelectItem>
                            <SelectItem value="HTTPS">HTTPS</SelectItem>
                            <SelectItem value="SOCKS4">SOCKS4</SelectItem>
                            <SelectItem value="SOCKS5">SOCKS5</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={singleForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proxy Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="My Proxy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={singleForm.control}
                  name="group"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select or create group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="0">None</SelectItem>
                            {isLoadingProxyGroups ? (
                              <SelectItem value="loading" disabled>Loading groups...</SelectItem>
                            ) : (
                              proxyGroups?.map((group: any) => (
                                <SelectItem key={group.id} value={group.id.toString()}>
                                  {group.name} ({group.proxyCount || 0} proxies)
                                </SelectItem>
                              ))
                            )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Group proxies for easier management
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="auth-required" 
                      checked={hasAuth} 
                      onCheckedChange={(checked) => setHasAuth(checked === true)}
                    />
                    <label
                      htmlFor="auth-required"
                      className="text-sm font-medium leading-none"
                    >
                      Authentication Required
                    </label>
                  </div>

                  {hasAuth && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <FormField
                        control={singleForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={singleForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Proxy</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="bulk">
            <Form {...bulkForm}>
              <form onSubmit={bulkForm.handleSubmit(onSubmitBulk)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={bulkForm.control}
                    name="proxyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proxy Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select proxy type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HTTP">HTTP</SelectItem>
                            <SelectItem value="HTTPS">HTTPS</SelectItem>
                            <SelectItem value="SOCKS4">SOCKS4</SelectItem>
                            <SelectItem value="SOCKS5">SOCKS5</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bulkForm.control}
                    name="group"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select or create group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">None</SelectItem>
                            {isLoadingProxyGroups ? (
                              <SelectItem value="loading" disabled>Loading groups...</SelectItem>
                            ) : (
                              proxyGroups?.map((group: any) => (
                                <SelectItem key={group.id} value={group.id.toString()}>
                                  {group.name} ({group.proxyCount || 0} proxies)
                                </SelectItem>
                              ))
                            )}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Proxy List</FormLabel>
                    <label 
                      htmlFor="file-upload" 
                      className="text-sm text-primary cursor-pointer flex items-center gap-1 hover:underline"
                    >
                      <FaCloudUploadAlt className="h-4 w-4" />
                      Import from file
                    </label>
                    <input 
                      id="file-upload" 
                      type="file" 
                      accept=".txt,.csv,.xlsx,.xls" 
                      className="hidden" 
                      onChange={handleFileUpload} 
                    />
                  </div>
                  <FormField
                    control={bulkForm.control}
                    name="proxyList"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <textarea
                            rows={8}
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            placeholder="Enter proxy list (one per line). Format: IP:PORT or IP:PORT:USERNAME:PASSWORD"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="flex items-center gap-1">
                          <FaRegListAlt className="h-3 w-3" />
                          <span>Format example: 192.168.1.1:8080 or 192.168.1.1:8080:username:password</span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={bulkForm.control}
                  name="hasAuth"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has-auth-bulk"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor="has-auth-bulk"
                        className="text-sm font-medium leading-none"
                      >
                        List includes authentication credentials (username:password)
                      </label>
                    </div>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Import Proxies</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}