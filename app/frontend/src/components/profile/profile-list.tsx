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
import { Search, MoreHorizontal, Edit, Trash, Play, FileText, Download, Users, Share2, Shield } from "lucide-react";
import { Chrome, Earth } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  osType: string;
  browserType: string;
  browserVersion: string;
  proxyStatus: "connected" | "disconnected";
  proxyAddress?: string;
  lastUsed: string;
  status: "active" | "idle";
  group?: string;
}

interface ProfileListProps {
  profiles: Profile[];
  selectedProfiles: string[];
  onEdit: (profile: Profile) => void;
  onDelete: (profileId: string) => void;
  onQuickLaunch: (profileId: string) => void;
  onBulkLaunch: () => void;
  onExport: (profileId: string) => void;
  onAddToGroup?: () => void; 
  onBulkDelete?: (profileIds: string[]) => void;
  onSelectionChange: (profileIds: string[]) => void;
}

export function ProfileList({ 
  profiles,
  selectedProfiles,
  onSelectionChange, 
  onEdit, 
  onDelete, 
  onQuickLaunch, 
  onExport,
  onBulkLaunch,
  onAddToGroup,
  onBulkDelete
  
}: ProfileListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [nameFilter, setNameFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

  
  // Notify parent of selection changes
  
  const itemsPerPage = 10;
  
  // Filter profiles based on search and filters
  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch = 
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.browserType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || profile.status === statusFilter;
    
    // Filter by name (using the search field)
    const matchesName = nameFilter === "all" || (
      nameFilter === profile.name
    );
    
    // Filter by group, including "none" for profiles without a group
    const matchesGroup = groupFilter === "all" || 
      (groupFilter === "none" && !profile.group) || 
      (profile.group === groupFilter);
    
    return matchesSearch && matchesStatus && matchesName && matchesGroup;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProfiles.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle selection
  const toggleSelectProfile = (profileId: string) => {
    const newSelection = selectedProfiles.includes(profileId)
      ? selectedProfiles.filter(id => id !== profileId)
      : [...selectedProfiles, profileId];
    onSelectionChange(newSelection); // Báo cho cha biết sự thay đổi
  };
  
  const toggleSelectAll = () => {
    if (selectedProfiles.length === currentItems.length) {
      onSelectionChange([]);
    } else {
      const allCurrentIds = currentItems.map(profile => profile.id);
      onSelectionChange(allCurrentIds);
    }
  };
  
  const isAllSelected = currentItems.length > 0 && selectedProfiles.length === currentItems.length;
  const isSomeSelected = selectedProfiles.length > 0 && selectedProfiles.length < currentItems.length;
  
  // Những hàm xử lý bulk actions đã được di chuyển sang component cha
  
  const getBrowserIcon = (browserType: string) => {
    switch (browserType.toLowerCase()) {
      case "chrome":
        return <Chrome className="text-primary-500" />;
      case "firefox":
        return <Earth className="text-purple-500" />;
      default:
        return <Earth className="text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>My Profiles</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search profiles..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={nameFilter} onValueChange={setNameFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter by name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Names</SelectItem>
                  {/* Generate options from unique profile names */}
                  {Array.from(new Set(profiles.map(p => p.name))).map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="none">No Group</SelectItem>
                  {/* Generate options from unique group names */}
                  {Array.from(new Set(profiles.map(p => p.group).filter(Boolean))).map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Selection counter and bulk actions (when items are selected) */}
          {selectedProfiles.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-blue-50 p-2 rounded-md border border-blue-200">
              {/* <div className="text-sm font-medium py-1 px-2 inline-flex items-center">
                <strong>{selectedProfiles.length}</strong> profile{selectedProfiles.length > 1 ? 's' : ''} selected
                <Button variant="ghost" size="sm" onClick={() => setSelectedProfiles([])}>
                  Clear
                </Button>
              </div> */}
              <div className="flex items-center gap-2">
                {onBulkLaunch && (
                  <Button size="sm" variant="default" onClick={onBulkLaunch}>
                    <Play className="h-4 w-4 mr-1" /> Launch Selected...
                  </Button>
                )}
                {onAddToGroup && (
                  <Button size="sm" variant="outline" onClick={onAddToGroup}>
                    <Users className="h-4 w-4 mr-1" /> Add to Group
                  </Button>
                )}
                {onBulkDelete && (
                  <Button size="sm" variant="destructive" onClick={() => onBulkDelete(selectedProfiles)}>
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
                      aria-label="Select all profiles"
                      className={`data-[state=checked]:bg-blue-600 ${isSomeSelected ? 'bg-blue-400' : ''}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[180px]">Name</TableHead>
                <TableHead>OS / Browser</TableHead>
                <TableHead>Proxy</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No profiles found. Create a new profile to get started.
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((profile) => (
                  <TableRow 
                    key={profile.id} 
                    className={`h-[60px] cursor-pointer transition-colors ${selectedProfiles.includes(profile.id) ? "bg-blue-50" : ""}`}
                    data-state={selectedProfiles.includes(profile.id) ? "selected" : ""}
                    data-profile-id={profile.id}
                    onClick={() => toggleSelectProfile(profile.id)}
                  >
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Checkbox 
                          checked={selectedProfiles.includes(profile.id)}
                          onCheckedChange={() => toggleSelectProfile(profile.id)}
                          aria-label={`Select ${profile.name}`}
                          className="data-[state=checked]:bg-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                          {getBrowserIcon(profile.browserType)}
                        </div>
                        <div>
                          <div className="font-medium">{profile.name}</div>
                          <div className="text-xs text-muted-foreground">ID: {profile.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{profile.osType}</div>
                      <div className="text-xs text-muted-foreground">{profile.browserType} {profile.browserVersion}</div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={profile.proxyStatus === "connected" ? "default" : "outline"}
                        className={profile.proxyStatus === "connected" ? "bg-green-500 text-white" : ""}
                      >
                        {profile.proxyStatus === "connected" ? "Connected" : "Disconnected"}
                      </Badge>
                      {profile.proxyAddress && (
                        <div className="text-xs text-muted-foreground mt-1">{profile.proxyAddress}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {profile.lastUsed}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={profile.status === "active" ? "default" : "outline"}
                        className={profile.status === "active" ? "bg-green-500 text-white" : ""}
                      >
                        {profile.status === "active" ? "Active" : "Idle"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onQuickLaunch(profile.id)}>
                              <Play className="mr-2 h-4 w-4" /> Launch
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExport(profile.id)}>
                              <Download className="mr-2 h-4 w-4" /> Export
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toggleSelectProfile(profile.id)}>
                              <Checkbox 
                                checked={selectedProfiles.includes(profile.id)}
                                className="mr-2 h-4 w-4"
                              /> {selectedProfiles.includes(profile.id) ? 'Unselect' : 'Select'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDelete(profile.id)} 
                              className="text-red-600"
                            >
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
        {filteredProfiles.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProfiles.length)} of {filteredProfiles.length} profiles
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