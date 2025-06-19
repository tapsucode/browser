import { useState, useContext, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuth } from "../hooks/us/useAuth";
import { ThemeContext } from "../layouts/app-layout";
import { 
  Check, 
  Upload, 
  User, 
  Lock, 
  Globe, 
  Palette, 
  Bell, 
  Monitor, 
  Languages, 
  Clock,
  Loader2
} from "lucide-react";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useSettings } from "../hooks/us/useSettings";

export default function SettingsPage() {
  const { user, getInitials } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("personal");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    userSettings,
    isLoadingSettings: isLoading,
    updatePersonalSettings,
    updateSystemSettings,
    updatePassword,
    uploadAvatar,
    isUpdatingPersonalSettings: isUpdatingPersonal,
    isUpdatingSystemSettings: isUpdatingSystem,
    isUpdatingPassword,
    isUploadingAvatar
  } = useSettings();

  const [personalFormData, setPersonalFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [systemFormData, setSystemFormData] = useState({
    theme: theme,
    language: userSettings?.language || 'vi',
    timezone: userSettings?.timezone || 'Asia/Ho_Chi_Minh',
    notifications: userSettings?.notifications || false,
    desktopNotifications: userSettings?.desktopNotifications || false,
    soundEffects: userSettings?.soundEffects || false,
    autoUpdate: userSettings?.autoUpdate || false
  });

  // Handle personal input changes
  const handlePersonalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle system input changes  
  const handleSystemInputChange = (name: string, value: any) => {
    setSystemFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submit handlers
  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePersonalSettings(personalFormData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePassword(personalFormData);
  };

  const handleSystemSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    updateSystemSettings(systemFormData);
  };

  const handleAvatarUpload = (file: File) => {
    uploadAvatar(file);
  };

  // Handle avatar file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleAvatarUpload(e.target.files[0]);
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Update theme in app context when changed in settings
  const handleThemeChange = (value: string) => {
    handleSystemInputChange("theme", value);
    
    // Handle actual theme change when selected from dropdown
    if (value !== theme) {
      toggleTheme();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Đang tải cài đặt...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cài đặt</h1>
      </div>
      
      <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Cài đặt cá nhân</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>Cài đặt hệ thống</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Thông tin tài khoản</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePersonalSubmit} className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Avatar được tạo tự động từ chữ cái đầu của tên.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mt-6">
                  <div className="sm:col-span-3">
                    <Label htmlFor="firstName" className="block text-sm font-medium">Tên</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={personalFormData.firstName}
                      onChange={handlePersonalInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Label htmlFor="lastName" className="block text-sm font-medium">Họ</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={personalFormData.lastName}
                      onChange={handlePersonalInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <Label htmlFor="email" className="block text-sm font-medium">Địa chỉ email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={personalFormData.email}
                      onChange={handlePersonalInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isUpdatingPersonal}
                  >
                    {isUpdatingPersonal ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Đổi mật khẩu
              </CardTitle>
              <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <Input 
                    id="currentPassword" 
                    name="currentPassword"
                    type="password" 
                    value={personalFormData.currentPassword}
                    onChange={handlePersonalInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input 
                    id="newPassword" 
                    name="newPassword"
                    type="password" 
                    value={personalFormData.newPassword}
                    onChange={handlePersonalInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type="password" 
                    value={personalFormData.confirmPassword}
                    onChange={handlePersonalInputChange}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      "Cập nhật mật khẩu"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          {/* Appearance and Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Giao diện và ngôn ngữ
              </CardTitle>
              <CardDescription>Tùy chỉnh giao diện và ngôn ngữ hiển thị</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSystemSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="theme">Giao diện</Label>
                    <Select 
                      value={systemFormData.theme} 
                      onValueChange={handleThemeChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn giao diện" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Sáng</SelectItem>
                        <SelectItem value="dark">Tối</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="language">Ngôn ngữ</Label>
                    <Select 
                      value={systemFormData.language} 
                      onValueChange={(value) => handleSystemInputChange("language", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn ngôn ngữ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">Múi giờ</Label>
                    <Select 
                      value={systemFormData.timezone} 
                      onValueChange={(value) => handleSystemInputChange("timezone", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn múi giờ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Ho_Chi_Minh">Hồ Chí Minh (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Bangkok">Bangkok (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                        <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Thông báo
              </CardTitle>
              <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Thông báo trong ứng dụng</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo bên trong ứng dụng
                    </p>
                  </div>
                  <Switch
                    checked={systemFormData.notifications}
                    onCheckedChange={(checked) => handleSystemInputChange("notifications", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Thông báo trên màn hình</Label>
                    <p className="text-sm text-muted-foreground">
                      Hiển thị thông báo ngay cả khi bạn không đang sử dụng ứng dụng
                    </p>
                  </div>
                  <Switch
                    checked={systemFormData.desktopNotifications}
                    onCheckedChange={(checked) => handleSystemInputChange("desktopNotifications", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Âm thanh</Label>
                    <p className="text-sm text-muted-foreground">
                      Phát âm thanh khi có thông báo mới
                    </p>
                  </div>
                  <Switch
                    checked={systemFormData.soundEffects}
                    onCheckedChange={(checked) => handleSystemInputChange("soundEffects", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Tự động cập nhật</Label>
                    <p className="text-sm text-muted-foreground">
                      Tự động cập nhật ứng dụng khi có phiên bản mới
                    </p>
                  </div>
                  <Switch
                    checked={systemFormData.autoUpdate}
                    onCheckedChange={(checked) => handleSystemInputChange("autoUpdate", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="button" 
                className="ml-auto bg-blue-600 hover:bg-blue-700" 
                onClick={handleSystemSubmit}
                disabled={isUpdatingSystem}
              >
                {isUpdatingSystem ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
