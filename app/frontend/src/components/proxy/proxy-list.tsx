import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Flag, Search, Filter, MoreHorizontal, Edit, Trash, Download, Play, Copy, Users } from "lucide-react";

interface Proxy {
  id: string;
  name: string;
  type: string;
  address: string;
  location: string;
  status: "online" | "offline";
  group?: string;
}

interface ProxyListProps {
  proxies: Proxy[];
  onEdit: (proxy: Proxy) => void;
  onDelete: (proxyId: string) => void;
  onTest: (proxyId: string) => void;
  onBulkDelete?: (proxyIds: string[]) => void;
  onAddToGroup?: (proxyIds: string[]) => void;
  onSelectionChange?: (proxyIds: string[]) => void;
}

export function ProxyList({ 
  proxies, 
  onEdit, 
  onDelete, 
  onTest,
  onBulkDelete,
  onAddToGroup,
  onSelectionChange
}: ProxyListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [selectedProxies, setSelectedProxies] = useState<string[]>([]);
  
  // Notify parent of selection changes
  useEffect(() => {
    console.log("ProxyList selectedProxies updated:", selectedProxies);
    // Notify parent component about selection changes
    if (onSelectionChange) {
      onSelectionChange(selectedProxies);
    }
  }, [selectedProxies, onSelectionChange]);
  
  const itemsPerPage = 10;
  
  // Get unique groups for filter
  const uniqueGroups = Array.from(new Set(proxies.filter(p => p.group).map(p => p.group as string)));
  
  // Filter proxies based on search and filters
  const filteredProxies = proxies.filter((proxy) => {
    const matchesSearch = 
      proxy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proxy.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proxy.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || proxy.type === filterType;
    const matchesStatus = statusFilter === "all" || proxy.status === statusFilter;
    const matchesGroup = 
      groupFilter === "all" || 
      (groupFilter === "none" && !proxy.group) || 
      proxy.group === groupFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesGroup;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredProxies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProxies.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle selection
  const toggleSelectProxy = (proxyId: string) => {
    console.log("Toggle proxy:", proxyId);
    setSelectedProxies(prev => {
      const newSelection = prev.includes(proxyId)
        ? prev.filter(id => id !== proxyId)
        : [...prev, proxyId];
      
      console.log("Previous selection:", prev);
      console.log("New selection:", newSelection);
      
      return newSelection;
    });
  };
  
  const toggleSelectAll = () => {
    console.log("Toggle all proxies");
    console.log("Current items:", currentItems);
    
    if (selectedProxies.length === currentItems.length) {
      console.log("Clearing selection");
      setSelectedProxies([]);
    } else {
      const proxyIds = currentItems.map(proxy => proxy.id);
      console.log("Setting all proxy IDs:", proxyIds);
      setSelectedProxies(proxyIds);
    }
  };
  
  const isAllSelected = currentItems.length > 0 && selectedProxies.length === currentItems.length;
  const isSomeSelected = selectedProxies.length > 0 && selectedProxies.length < currentItems.length;
  
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    // In a real app, you might want to show a toast notification here
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>My Proxies</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search proxies..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="HTTP">HTTP</SelectItem>
                  <SelectItem value="HTTPS">HTTPS</SelectItem>
                  <SelectItem value="SOCKS4">SOCKS4</SelectItem>
                  <SelectItem value="SOCKS5">SOCKS5</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="none">No Group</SelectItem>
                  {uniqueGroups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Selection counter and bulk actions (when items are selected) */}
          {selectedProxies.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-blue-50 p-2 rounded-md border border-blue-200">
              <div className="text-sm font-medium py-1 px-2 inline-flex items-center">
                <strong>{selectedProxies.length}</strong> proxy{selectedProxies.length > 1 ? 'ies' : ''} selected
                <Button variant="ghost" size="sm" onClick={() => setSelectedProxies([])}>
                  Clear
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {onAddToGroup && (
                  <Button size="sm" variant="outline" onClick={() => onAddToGroup(selectedProxies)}>
                    <Users className="h-4 w-4 mr-1" /> Add to Group
                  </Button>
                )}
                {onBulkDelete && (
                  <Button size="sm" variant="destructive" onClick={() => onBulkDelete(selectedProxies)}>
                    <Trash className="h-4 w-4 mr-1" /> Delete All
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <div className="flex items-center justify-center">
                    <Checkbox 
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all proxies"
                      className={`data-[state=checked]:bg-blue-600 ${isSomeSelected ? 'bg-blue-400' : ''}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[180px]">Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No proxies found. Add a new proxy to get started.
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((proxy) => (
                  <TableRow 
                    key={proxy.id} 
                    className={`h-[60px] cursor-pointer transition-colors ${selectedProxies.includes(proxy.id) ? "bg-blue-50" : ""}`}
                    data-state={selectedProxies.includes(proxy.id) ? "selected" : ""}
                    data-proxy-id={proxy.id}
                    onClick={() => toggleSelectProxy(proxy.id)}
                  >
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Checkbox 
                          checked={selectedProxies.includes(proxy.id)}
                          onCheckedChange={() => toggleSelectProxy(proxy.id)}
                          aria-label={`Select ${proxy.name}`}
                          className="data-[state=checked]:bg-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{proxy.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{proxy.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-1">{proxy.address}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyAddress(proxy.address);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{proxy.group || "—"}</TableCell>
                    <TableCell>
                      <Badge 
                        className={proxy.status === "online" ? "bg-green-500 text-white" : "bg-red-500 text-white"}
                      >
                        {proxy.status === "online" ? "Online" : "Offline"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTest(proxy.id);
                          }}
                          title="Test connection"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(proxy);
                          }}
                          title="Edit proxy"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => onEdit(proxy)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onTest(proxy.id)}>
                              <Play className="mr-2 h-4 w-4" /> Test
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyAddress(proxy.address)}>
                              <Copy className="mr-2 h-4 w-4" /> Copy Address
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDelete(proxy.id)} className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination controls */}
        {filteredProxies.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProxies.length)} of {filteredProxies.length} proxies
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Show 5 page numbers max
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                    if (pageNum > totalPages) {
                      pageNum = totalPages - (4 - i);
                    }
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0 mx-1"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}