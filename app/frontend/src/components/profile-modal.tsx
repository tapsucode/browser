import React, { useEffect } from "react";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FaTimes, FaUserPlus, FaUsers } from "react-icons/fa";
import {
  ProfileFormValues,
  BulkProfileFormValues,
} from "../hooks/new/useProfilePage";

import { CreateProfileData } from '@/lib/types';

// Define the form schema
const profileSchema = z
  .object({
    name: z.string().min(2, "Profile name must be at least 2 characters"),
    proxy: z.string(),
    proxyMethod: z.string().optional(),
    proxyGroupId: z.string().optional(),
    proxyHost: z.string().optional(),
    proxyUsername: z.string().optional(),
    proxyPassword: z.string().optional(),
    proxyList: z.string().optional(),
    userAgent: z.string().optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
    resolution: z.string().optional(),
    hardwareConcurrency: z.string().optional(),
    deviceMemory: z.string().optional(),
    vendor: z.string().optional(),
    webglRenderer: z.string().optional(),
    webGLNoiseValue: z.string().optional(),
    availHeight: z.string().optional(),
    availWidth: z.string().optional(),
    height: z.string().optional(),
    width: z.string().optional(),
    colorDepth: z.string().optional(),
    canvasNoiseValue: z.string().optional(),
    audioContextNoiseValue: z.string().optional(),
    webRTC: z.string().optional(),
    customWebRtcIp: z
      .string()
      .optional()
      .refine(
        (value) => {
          // If webRTC is not "custom", customWebRtcIp is optional
          if (!value) return true;
          // Validate IPv4 or IPv6 format
          const ipv4Regex =
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}$/;
          return ipv4Regex.test(value) || ipv6Regex.test(value);
        },
        {
          message: "Invalid IP address format",
        },
      ),
    fontList: z.string().optional(),
    platform: z.string().optional(),
    productSub: z.string().optional(),
    clientRectValue: z.string().optional(),
    fingerprintType: z.enum(["random", "custom"]),
    webrtcProtection: z.boolean().default(false),
    canvasProtection: z.boolean().default(false),
    timezoneSpoof: z.boolean().default(false),
    webglNoise: z.boolean().default(false),
    audioContext: z.boolean().default(false),
    notes: z.string().optional(),
  })
  .superRefine(({ webRTC, customWebRtcIp }, ctx) => {
    // If webRTC is "custom", customWebRtcIp is required
    if (webRTC === "custom" && !customWebRtcIp) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Custom IP is required when WebRTC Behavior is set to Custom IP",
        path: ["customWebRtcIp"],
      });
    }
  });

// Define bulk creation schema
const bulkProfileSchema = z.object({
  count: z.string().min(1, "Number of profiles is required"),
  prefix: z.string().min(1, "Prefix is required"),
  proxy: z.string(),
  randomizeUserAgent: z.boolean().default(true),
  enableWebRtcProtection: z.boolean().default(true),
  matchTimezone: z.boolean().default(true),
});

type ProfileModalProps = {
  // Modal state
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialProfileData: Partial<ProfileFormValues> | null;

  // Modal UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedVendorId: string;
  showCustomWebRtcIp: boolean;

  // Handlers
  handleVendorChange: (vendorId: string) => void;
  handleWebRtcChange: (value: string) => void;

  // Data
  vendors: any[];
  renderers: any[];
  proxyGroups: any[];
  userAgents: { label: string; value: string }[];
  hardwareConcurrency: { label: string; value: string }[];
  deviceMemory: { label: string; value: string }[];
  resolutions: { label: string; value: string }[];
  browserLanguages: { label: string; value: string }[];
  timezones: { label: string; value: string }[];

  // Loading states
  isLoadingVendors: boolean;
  isLoadingRenderers: boolean;
  isLoadingProxyGroups: boolean;

  // Actions
  onCreate: (data: CreateProfileData) => Promise<any>;
  onUpdate?: (id: string, data: Partial<ProfileFormValues>) => void;
};

export function ProfileModal({
  // Modal state
  isOpen,
  onOpenChange,
  initialProfileData,

  // Modal UI state
  activeTab,
  setActiveTab,
  selectedVendorId,
  showCustomWebRtcIp,

  // Handlers
  handleVendorChange,
  handleWebRtcChange,

  // Data
  vendors,
  renderers,
  proxyGroups,
  userAgents,
  hardwareConcurrency,
  deviceMemory,
  resolutions,
  browserLanguages,
  timezones,

  // Loading states
  isLoadingVendors,
  isLoadingRenderers,
  isLoadingProxyGroups,

  // Actions
  onCreate,
  onUpdate,
}: ProfileModalProps) {
  // Individual profile form
  const individualForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      proxy: "none",
      proxyMethod: "none",
      proxyGroupId: "",
      proxyHost: "",
      proxyUsername: "",
      proxyPassword: "",
      proxyList: "",
      fingerprintType: "random",
      webrtcProtection: false,
      canvasProtection: false,
      timezoneSpoof: false,
      webglNoise: false,
      audioContext: false,
      webRTC: undefined,
      customWebRtcIp: "",
    },
  });

  // Bulk creation form
  const bulkForm = useForm<BulkProfileFormValues>({
    resolver: zodResolver(bulkProfileSchema),
    defaultValues: {
      count: "5",
      prefix: "Profile",
      proxy: "none",
      randomizeUserAgent: true,
      enableWebRtcProtection: true,
      matchTimezone: true,
    },
  });

  const bulkProxyMethod = bulkForm.watch("proxy");
  const onSubmit = (formData: ProfileFormValues) => {
    // 1. Tạo payload cơ bản
    const payload: CreateProfileData = {
      name: formData.name,
      proxySource: formData.proxyMethod as 'none' | 'import', // Ép kiểu nếu cần
      // Quan trọng: Ánh xạ proxyHost thành proxyList
      proxyList: formData.proxyMethod === 'import' ? formData.proxyHost : undefined,
      fingerprintMethod: formData.fingerprintType,
    };

    // 2. Thêm các trường fingerprint tùy chỉnh nếu được chọn
    if (formData.fingerprintType === 'custom') {
      Object.assign(payload, {
        userAgent: formData.userAgent,
        resolution: formData.resolution,
        language: formData.language,
        timezone: formData.timezone,
        vendor: formData.vendor,
        renderer: formData.webglRenderer, // Ánh xạ từ webglRenderer
        hardwareConcurrency: formData.hardwareConcurrency ? Number(formData.hardwareConcurrency) : undefined,
        deviceMemory: formData.deviceMemory ? Number(formData.deviceMemory) : undefined,
        canvas: formData.canvasProtection, // Ánh xạ từ canvasProtection
        webGL: formData.webglNoise,       // Ánh xạ từ webglNoise
        audioContext: formData.audioContext,
        clientRects: formData.clientRects, // Đổi 'clientRectValue' thành 'clientRects' nếu cần
        fonts: formData.fontList,          // Ánh xạ từ fontList (boolean)
        webRtcMode: formData.webRTC as 'real' | 'proxy' | 'disable' | 'custom', // Ép kiểu
        webRtcCustomIp: formData.webRTC === 'custom' ? formData.customWebRtcIp : undefined,
      });
    }

    // 3. Loại bỏ các trường undefined để giữ payload sạch sẽ
    Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key]);

    // 4. Gọi hàm onCreate từ props và xử lý kết quả
    console.log("Submitting Individual Payload:", payload);
    onCreate(payload)
      .then(() => {
        // Xử lý thành công: đóng modal, reset form
        onOpenChange(false);
        individualForm.reset();
      })
      .catch(error => {
        // Xử lý lỗi: hiển thị thông báo lỗi cho người dùng (ví dụ: dùng toast)
        console.error("Failed to create profile:", error);
        // Bạn có thể thêm toast ở đây
        // toast({ title: "Error", description: error.message, variant: "destructive" });
      });
  };

  const onBulkSubmit = (formData: BulkProfileFormValues) => {

    let proxySourceValue: 'none' | 'select group' | 'import' | undefined;

    if (formData.proxy === 'proxy-group') {
      // <<< THAY ĐỔI Ở ĐÂY >>>
      // Khi frontend dùng 'proxy-group', gửi đi 'select group' cho backend
      proxySourceValue = 'select group';
    } else if (formData.proxy === 'import') {
      proxySourceValue = 'import';
    } else {
      proxySourceValue = 'none';
    }

    const payload: CreateProfileData = {
      count: formData.count ? Number(formData.count) : undefined,
      prefix: formData.prefix,
      proxySource: proxySourceValue, // Sử dụng giá trị đã được ánh xạ
      selectedProxyGroup: formData.proxy === 'proxy-group' ? formData.proxyGroupId : undefined,
      proxyList: formData.proxy === 'import' ? formData.proxyList : undefined,
    };


    // 2. Loại bỏ các trường undefined
    Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key]);

    // 3. Gọi hàm onCreateBulk từ props và xử lý kết quả
    console.log("Submitting Bulk Payload:", payload);
    onCreate(payload)
      .then(() => {
        // Xử lý thành công
        onOpenChange(false);
        bulkForm.reset();
      })
      .catch(error => {
        // Xử lý lỗi
        console.error("Failed to create bulk profiles:", error);
      });
  };

  const proxyValue = individualForm.watch("proxy");
  const proxyMethod = individualForm.watch("proxyMethod");
  const fingerprintType = individualForm.watch("fingerprintType");


  // Xử lý khi thay đổi WebRTC behavior - sử dụng từ props
  const onWebRtcChange = (value: string) => {
    individualForm.setValue("webRTC", value);
    handleWebRtcChange(value);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-y-auto max-h-[90vh]">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <DialogTitle className="text-2xl font-bold text-blue-900">
                  Add Browser Profile
                </DialogTitle>
                <DialogDescription className="text-blue-600 mt-1">
                  Create new antidetect browser profiles
                </DialogDescription>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                aria-label="Close dialog"
              >
                <FaTimes className="text-blue-900 text-xl" />
              </button>
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab("individual")}
                className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${activeTab === "individual"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-900 hover:bg-blue-200"
                  }`}
              >
                <FaUserPlus />
                <span>Add Individual Profile</span>
              </button>
              <button
                onClick={() => setActiveTab("bulk")}
                className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${activeTab === "bulk"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-900 hover:bg-blue-200"
                  }`}
              >
                <FaUsers />
                <span>Add Bulk Profiles</span>
              </button>
            </div>

            {activeTab === "individual" && (
              <Form {...individualForm}>
                <form
                  onSubmit={individualForm.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={individualForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Profile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={individualForm.control}
                    name="proxyMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proxy Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Proxy Method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Proxy</SelectItem>
                            <SelectItem value="import">
                              Add Simple Proxy
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Show simple proxy form when "import" is selected */}
                  {proxyMethod === "import" && (
                    <div className="space-y-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <FormField
                        control={individualForm.control}
                        name="proxyHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Proxy</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="IP:PORT or IP:PORT:USERNAME:PASSWORD"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Example: 192.168.1.1:8080 or
                              192.168.1.1:8080:user:pass
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Phần Proxy Group đã bị loại bỏ theo yêu cầu */}

                  {/* Đã loại bỏ form direct theo yêu cầu */}

                  {/* Loại bỏ textarea nhập danh sách proxy */}

                  <FormField
                    control={individualForm.control}
                    name="fingerprintType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Fingerprint Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="random" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Random (Automatic)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="custom" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Custom (Manual)
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Custom fingerprint settings when custom is selected */}
                  {fingerprintType === "custom" && (
                    <div className="space-y-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h3 className="text-lg font-semibold text-blue-900">
                        Custom Fingerprint Settings
                      </h3>

                      <FormField
                        control={individualForm.control}
                        name="userAgent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>User Agent</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select User Agent" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {userAgents.map((ua, index) => (
                                  <SelectItem key={index} value={ua.value}>
                                    {ua.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={individualForm.control}
                          name="vendor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleVendorChange(value);
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Vendor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {isLoadingVendors ? (
                                    <SelectItem value="loading">
                                      Loading...
                                    </SelectItem>
                                  ) : (
                                    vendors.map((vendor) => (
                                      <SelectItem
                                        key={vendor.id}
                                        value={vendor.id}
                                      >
                                        {vendor.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={individualForm.control}
                          name="webglRenderer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WebGL Renderer</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={!selectedVendorId}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Renderer" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {!selectedVendorId ? (
                                    <SelectItem value="select-vendor">
                                      Select a vendor first
                                    </SelectItem>
                                  ) : isLoadingRenderers ? (
                                    <SelectItem value="loading">
                                      Loading...
                                    </SelectItem>
                                  ) : renderers?.length > 0 ? (
                                    renderers.map((renderer) => (
                                      <SelectItem
                                        key={renderer.id}
                                        value={renderer.id}
                                      >
                                        {renderer.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-renderers">
                                      No renderers available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={individualForm.control}
                          name="hardwareConcurrency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hardware Concurrency</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="CPU cores" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {/* Lặp qua mảng object {label, value} */}
                                  {hardwareConcurrency.map((item) => (
                                    <SelectItem
                                      key={item.value}
                                      value={item.value}
                                    >
                                      {item.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={individualForm.control}
                          name="deviceMemory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Device Memory</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Memory" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {deviceMemory.map((item) => (
                                    <SelectItem
                                      key={item.value}
                                      value={item.value}
                                    >
                                      {item.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={individualForm.control}
                          name="resolution"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Screen Resolution</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select resolution" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {/* Lặp qua mảng object {label, value} */}
                                  {resolutions.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                      {item.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={individualForm.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Timezone</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="UTC">UTC</SelectItem>
                                  <SelectItem value="America/New_York">
                                    New York (GMT-5)
                                  </SelectItem>
                                  <SelectItem value="America/Los_Angeles">
                                    Los Angeles (GMT-8)
                                  </SelectItem>
                                  <SelectItem value="Europe/London">
                                    London (GMT+0)
                                  </SelectItem>
                                  <SelectItem value="Europe/Paris">
                                    Paris (GMT+1)
                                  </SelectItem>
                                  <SelectItem value="Asia/Tokyo">
                                    Tokyo (GMT+9)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={individualForm.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Browser Language</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {/* Lặp qua mảng object {label, value} */}
                                {browserLanguages.map((item) => (
                                  <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={individualForm.control}
                        name="webRTC"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WebRTC Behavior</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                onWebRtcChange(value);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select WebRTC behavior" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="real">Real IP</SelectItem>
                                <SelectItem value="proxy">
                                  Use Proxy IP
                                </SelectItem>
                                <SelectItem value="disabled">
                                  Disabled
                                </SelectItem>
                                <SelectItem value="custom">
                                  Custom IP
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {showCustomWebRtcIp && (
                        <FormField
                          control={individualForm.control}
                          name="customWebRtcIp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom WebRTC IP</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter IP address (e.g. 192.168.1.1)"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter a valid IPv4 or IPv6 address
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}



                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">
                          Protection Settings
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={individualForm.control}
                            name="fontList"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Font List</FormLabel>
                                  <FormDescription>
                                    Customize font fingerprint
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={individualForm.control}
                            name="canvasProtection"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Canvas Protection</FormLabel>
                                  <FormDescription>
                                    Prevent canvas fingerprinting
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={individualForm.control}
                            name="clientRects"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Client Rects</FormLabel>
                                  <FormDescription>
                                    Modify client rects fingerprint
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={individualForm.control}
                            name="webglNoise"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>WebGL Noise</FormLabel>
                                  <FormDescription>
                                    Add noise to WebGL
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={individualForm.control}
                          name="audioContext"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>
                                  Audio Context
                                </FormLabel>
                                <FormDescription>
                                  Modify audio context fingerprint
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <FormField
                    control={individualForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add notes about this profile"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
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
                    <Button type="submit">Create Profile</Button>
                  </DialogFooter>
                </form>
              </Form>
            )}

            {activeTab === "bulk" && (
              <Form {...bulkForm}>
                <form
                  onSubmit={bulkForm.handleSubmit(onBulkSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={bulkForm.control}
                      name="count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Profiles</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bulkForm.control}
                      name="prefix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Name Prefix</FormLabel>
                          <FormControl>
                            <Input placeholder="Profile" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={bulkForm.control}
                    name="proxy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proxy Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Proxy Method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Proxy</SelectItem>
                            <SelectItem value="proxy-group">
                              Select Proxy Group
                            </SelectItem>
                            <SelectItem value="import">
                              Import Proxy List
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {bulkProxyMethod === "proxy-group" && (
                    <FormField
                      control={bulkForm.control}
                      name="proxyGroupId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proxy Group</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Proxy Group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingProxyGroups ? (
                                <SelectItem value="loading">
                                  Loading...
                                </SelectItem>
                              ) : (
                                proxyGroups.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    {group.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {bulkProxyMethod === "import" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel>Proxy List</FormLabel>
                        <label
                          htmlFor="proxy-file-upload"
                          className="text-sm text-primary cursor-pointer flex items-center gap-1 hover:underline"
                        >
                          <span className="h-4 w-4">📤</span>
                          Import from file
                        </label>
                        <input
                          id="proxy-file-upload"
                          type="file"
                          accept=".txt,.csv,.xlsx,.xls"
                          className="hidden"
                          onChange={(e) => {
                            // Xử lý khi người dùng tải file lên
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const content = event.target?.result as string;
                                bulkForm.setValue("proxyList", content);
                              };
                              reader.readAsText(file);
                            }
                          }}
                        />
                      </div>
                      <FormField
                        control={bulkForm.control}
                        name="proxyList"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <textarea
                                rows={6}
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                placeholder="Enter proxy list (one per line). Format: IP:PORT or IP:PORT:USERNAME:PASSWORD"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="flex items-center gap-1">
                              <span className="h-3 w-3">📝</span>
                              <span>
                                Format example: 192.168.1.1:8080 or
                                192.168.1.1:8080:username:password
                              </span>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={bulkForm.control}
                    name="randomizeUserAgent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Randomize User Agents</FormLabel>
                          <FormDescription>
                            Use different user agents for each profile
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bulkForm.control}
                    name="enableWebRtcProtection"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Enable WebRTC Protection</FormLabel>
                          <FormDescription>
                            Prevent WebRTC leaks for all profiles
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bulkForm.control}
                    name="matchTimezone"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Match Timezone with Proxy</FormLabel>
                          <FormDescription>
                            Set timezone based on proxy location
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
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
                    <Button type="submit">Create Profiles</Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
