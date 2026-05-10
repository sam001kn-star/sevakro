import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StaffVerification from './StaffVerification';
import StaffTracking from './StaffTracking';
import ServiceManagement from './ServiceManagement';
import PromoManager from './PromoManager';
import AppointmentReminders from './AppointmentReminders';
import ContentManager from './ContentManager';
import ThemeManager from './ThemeManager';
import PushNotificationManager from './PushNotificationManager';
import GitHubPushManager from './GitHubPushManager';
import FileStructureViewer from './FileStructureViewer';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground">PulseCare Control Center</p>
        </div>
      </div>

      <Tabs defaultValue="verification">
        <TabsList className="w-full bg-muted mb-4 flex-wrap h-auto p-1 gap-y-1">
          <TabsTrigger value="verification" className="text-xs flex-1">Verification</TabsTrigger>
          <TabsTrigger value="tracking" className="text-xs flex-1">Staff Tracking</TabsTrigger>
          <TabsTrigger value="services" className="text-xs flex-1">Services</TabsTrigger>
          <TabsTrigger value="promos" className="text-xs flex-1">Promos</TabsTrigger>
          <TabsTrigger value="reminders" className="text-xs flex-1">Reminders</TabsTrigger>
          <TabsTrigger value="content" className="text-xs flex-1">Content</TabsTrigger>
          <TabsTrigger value="theme" className="text-xs flex-1">Theme</TabsTrigger>
          <TabsTrigger value="push" className="text-xs flex-1">Push</TabsTrigger>
          <TabsTrigger value="github" className="text-xs flex-1">GitHub</TabsTrigger>
          <TabsTrigger value="files" className="text-xs flex-1">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="verification"><StaffVerification /></TabsContent>
        <TabsContent value="tracking"><StaffTracking /></TabsContent>
        <TabsContent value="services"><ServiceManagement /></TabsContent>
        <TabsContent value="promos"><PromoManager /></TabsContent>
        <TabsContent value="reminders"><AppointmentReminders /></TabsContent>
        <TabsContent value="content"><ContentManager /></TabsContent>
        <TabsContent value="theme"><ThemeManager /></TabsContent>
        <TabsContent value="push"><PushNotificationManager /></TabsContent>
        <TabsContent value="github"><GitHubPushManager /></TabsContent>
        <TabsContent value="files"><FileStructureViewer /></TabsContent>
      </Tabs>
    </div>
  );
}