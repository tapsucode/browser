import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { SettingsFunctionalService } from '../../lib/new/SettingsFunctionalService';
import { AuthFunctionalService } from '../../lib/new/AuthFunctionalService';
import { useToast } from '../use-toast';
import { queryClient } from '../../lib/queryClient';
import { SystemSettings, PersonalSettings } from '../../lib/types';
import { TIMEZONES, LANGUAGES, THEMES } from '../../utils/settings';

export function useSettings() {
  const { toast } = useToast();

  // Lấy user settings
  const {
    data: userSettings,
    isLoading: isLoadingSettings,
    error: settingsError,
    refetch: refetchSettings
  } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: () => SettingsFunctionalService.getUserSettings(),
  });

  // Lấy danh sách timezone
  const timezones = TIMEZONES;
  const languages = LANGUAGES;
  const themes = THEMES;
  const isLoadingTimezones = false;
  const isLoadingLanguages = false;
  const isLoadingThemes = false;

  // Mutation cập nhật personal settings
  const updatePersonalSettingsMutation = useMutation({
    mutationFn: (personalSettings: PersonalSettings) => 
      AuthFunctionalService.updateUser(mapPersonalSettingsToUser(personalSettings)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Settings Updated",
        description: "Personal settings have been updated successfully",
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

  // Mutation cập nhật mật khẩu
  const updatePasswordMutation = useMutation({
    mutationFn: (passwordData: { 
      currentPassword: string; 
      newPassword: string; 
      confirmPassword: string 
    }) => AuthFunctionalService.resetPassword(passwordData),
    onSuccess: (data) => {
      toast({
        title: "Password Updated",
        description: data.message || "Your password has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation cập nhật system settings
  const updateSystemSettingsMutation = useMutation({
    mutationFn: (systemSettings: SystemSettings) =>
      SettingsFunctionalService.updateSystemSettings(systemSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "System Settings Updated",
        description: "System settings have been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "System Settings Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation cập nhật avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: (avatar: File) => AuthFunctionalService.uploadAvatar(avatar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Avatar Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    // Data queries
    userSettings,
    timezones,
    languages,
    themes,
    isLoadingSettings,
    isLoadingTimezones,
    isLoadingLanguages,
    isLoadingThemes,
    settingsError,
    refetchSettings,

    // Mutations
    updatePersonalSettings: updatePersonalSettingsMutation.mutate,
    updateSystemSettings: updateSystemSettingsMutation.mutate,
    updatePassword: updatePasswordMutation.mutate,
    uploadAvatar: uploadAvatarMutation.mutate,

    // Mutation states
    isUpdatingPersonalSettings: updatePersonalSettingsMutation.isPending,
    isUpdatingSystemSettings: updateSystemSettingsMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
  };
}

// Map PersonalSettings to User type
const mapPersonalSettingsToUser = (personalSettings: PersonalSettings) => {
  return {
    firstName: personalSettings.firstName,
    lastName: personalSettings.lastName,
    email: personalSettings.email,
  };
};