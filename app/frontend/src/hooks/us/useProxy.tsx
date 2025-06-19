import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ProxyFunctionalService } from '../../lib/new/ProxyFunctionalService';
import { useToast } from '../use-toast';
import { queryClient } from '../../lib/queryClient';
import { Proxy, ProxyConfig } from '../../lib/types';
import { type AddToGroupPayload } from "../../components/profile/group-select-dialog";

/**
 * Hook chức năng để quản lý proxy
 * Hook này được sử dụng trong:
 * - NetworkPage
 * - ProfilePage (phần cấu hình proxy)
 */
export function useProxy() {
  const { toast } = useToast();
  
  // Lấy danh sách tất cả proxy
  const {
    data: proxyResponse,
    isLoading: isLoadingProxies,
    error: proxiesError,
    refetch: refetchProxies
  } = useQuery({
    queryKey: ['/api/local/standard/proxies'],
    queryFn: () => ProxyFunctionalService.getProxies(),
  });

  // Ensure we always return an array of proxies
  const proxies = Array.isArray(proxyResponse) ? proxyResponse : 
                 (proxyResponse?.data?.proxies || []);

  // Lấy cấu hình proxy hiện tại
  const {
    data: proxyConfig,
    isLoading: isLoadingProxyConfig,
    error: proxyConfigError,
    refetch: refetchProxyConfig
  } = useQuery({
    queryKey: ['/api/local/standard/proxies/config'],
    queryFn: () => ProxyFunctionalService.getProxyConfig(),
  });

  // Lấy danh sách proxy groups
  const {
    data: proxyGroups = [],
    isLoading: isLoadingProxyGroups,
    error: proxyGroupsError,
    refetch: refetchProxyGroups
  } = useQuery({
    queryKey: ['/api/local/standard/proxies/groups'],
    queryFn: () => ProxyFunctionalService.getProxyGroups(),
  });

  // Lấy proxy theo ID
  const getProxyById = (proxyId: string) => {
    return useQuery({
      queryKey: ['/api/local/standard/proxies', proxyId],
      queryFn: () => ProxyFunctionalService.getProxyById(proxyId),
      enabled: !!proxyId,
    });
  };

  // Lấy danh sách proxy trong một group
  const getProxiesInGroup = (groupId: string) => {
    return useQuery({
      queryKey: ['/api/local/standard/proxies/groups', groupId, 'proxies'],
      queryFn: () => ProxyFunctionalService.getProxiesInGroup(groupId),
      enabled: !!groupId,
    });
  };

  // Mutation test kết nối proxy
  const testProxyConnectionMutation = useMutation({
    mutationFn: () => ProxyFunctionalService.testProxyConnection(),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: `Ping: ${result.ping}ms`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.error || "Failed to connect to proxy",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Query tìm proxy theo host và port
  const findProxyByHostPort = (host: string, port: number) => {
    return useQuery({
      queryKey: ['/api/local/standard/proxies/find', host, port],
      queryFn: () => ProxyFunctionalService.findProxyByHostPort(host, port),
      enabled: !!host && !!port,
    });
  };

  // Mutation test một proxy cụ thể
  const testProxyMutation = useMutation({
    mutationFn: (proxyId: string) => ProxyFunctionalService.testProxy(proxyId),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Proxy Test Successful",
          description: `Ping: ${result.ping}ms`,
        });
      } else {
        toast({
          title: "Proxy Test Failed",
          description: result.error || "Failed to connect to proxy",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation cập nhật cấu hình proxy
  const updateProxyConfigMutation = useMutation({
    mutationFn: (config: Partial<ProxyConfig>) => ProxyFunctionalService.updateProxyConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/proxies/config'] });
      toast({
        title: "Proxy Config Updated",
        description: "Proxy configuration has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation tạo proxy mới
  const createProxyMutation = useMutation({
    mutationFn: (proxyData: any) => ProxyFunctionalService.createProxy(proxyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/proxies'] });
      toast({
        title: "Proxy Created",
        description: "New proxy has been created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation cập nhật proxy
  const updateProxyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      ProxyFunctionalService.updateProxy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/proxies'] });
      toast({
        title: "Proxy Updated",
        description: "Proxy has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation xóa proxy
  const deleteProxyMutation = useMutation({
    mutationFn: (proxyId: string) => ProxyFunctionalService.deleteProxy(proxyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/proxies'] });
      toast({
        title: "Proxy Deleted",
        description: "Proxy has been deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation import proxies
  const importProxiesMutation = useMutation({
    mutationFn: (proxies: any[]) => ProxyFunctionalService.importProxies(proxies),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/proxies'] });
      toast({
        title: "Proxies Imported",
        description: `Successfully imported ${result.count} proxies`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation tạo proxy group
  const createProxyGroupMutation = useMutation({
    mutationFn: (groupData: any) => ProxyFunctionalService.createProxyGroup(groupData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/proxies/groups'] });
      toast({
        title: "Group Created",
        description: "New proxy group has been created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Group Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation xóa proxy group
  const deleteProxyGroupMutation = useMutation({
    mutationFn: (groupId: string) => ProxyFunctionalService.deleteProxyGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/proxies/groups'] });
      toast({
        title: "Group Deleted",
        description: "Proxy group has been deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Group Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation thêm proxies vào group
  const addProxiesToGroupMutation = useMutation({
    mutationFn: (payload: AddToGroupPayload) => 
      ProxyFunctionalService.addProxiesToGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/proxies/groups'] });
      toast({
        title: "Added to Group",
        description: "Proxies have been added to group",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add to Group",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation xóa proxies khỏi group
  const removeProxiesFromGroupMutation = useMutation({
    mutationFn: ({ groupId, proxyIds }: { groupId: string, proxyIds: string[] }) => 
      ProxyFunctionalService.removeProxiesFromGroup(groupId, proxyIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/standard/proxies/groups'] });
      toast({
        title: "Removed from Group",
        description: "Proxies have been removed from group",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Remove from Group",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    // Data queries
    proxies,
    proxyConfig,
    proxyGroups,
    isLoadingProxies,
    isLoadingProxyConfig,
    isLoadingProxyGroups,
    proxiesError,
    proxyConfigError,
    proxyGroupsError,
    refetchProxies,
    refetchProxyConfig,
    refetchProxyGroups,
    getProxyById,
    getProxiesInGroup,
    
    // Utility functions
    formatProxyString: ProxyFunctionalService.formatProxyString,
    parseProxyString: ProxyFunctionalService.parseProxyString,
    getProxyStatusInfo: ProxyFunctionalService.getProxyStatusInfo,
    
    // Mutations
    testProxyConnection: testProxyConnectionMutation.mutate,
    testProxy: testProxyMutation.mutate,
    updateProxyConfig: updateProxyConfigMutation.mutate,
    createProxy: createProxyMutation.mutate,
    updateProxy: updateProxyMutation.mutate,
    deleteProxy: deleteProxyMutation.mutate,
    importProxies: importProxiesMutation.mutate,
    createProxyGroup: createProxyGroupMutation.mutate,
    deleteProxyGroup: deleteProxyGroupMutation.mutate,
    addProxiesToGroup: addProxiesToGroupMutation.mutate,
    removeProxiesFromGroup: removeProxiesFromGroupMutation.mutate,
    
    // Mutation states
    isTestingProxyConnection: testProxyConnectionMutation.isPending,
    isTestingProxy: testProxyMutation.isPending,
    isUpdatingProxyConfig: updateProxyConfigMutation.isPending,
    isCreatingProxy: createProxyMutation.isPending,
    isUpdatingProxy: updateProxyMutation.isPending,
    isDeletingProxy: deleteProxyMutation.isPending,
    isImportingProxies: importProxiesMutation.isPending,
    isCreatingProxyGroup: createProxyGroupMutation.isPending,
    isDeletingProxyGroup: deleteProxyGroupMutation.isPending,
    isAddingProxiesToGroup: addProxiesToGroupMutation.isPending,
    isRemovingProxiesFromGroup: removeProxiesFromGroupMutation.isPending,
  };
}