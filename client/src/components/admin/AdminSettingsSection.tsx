import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Settings, User, Lock, Bell, Globe, Shield, CreditCard, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const AdminSettingsSection: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: t("admin.settings.saved", "Settings Saved"),
      description: t("admin.settings.saved_desc", "Your settings have been updated successfully."),
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="account" className="w-full">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <TabsList className="flex flex-col items-start p-0 bg-transparent h-auto space-y-1">
              <TabsTrigger 
                value="account" 
                className="w-full justify-start px-3 py-2 h-auto data-[state=active]:bg-primary/10"
              >
                <User className="h-4 w-4 mr-2" />
                {t("admin.settings.account", "Account")}
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="w-full justify-start px-3 py-2 h-auto data-[state=active]:bg-primary/10"
              >
                <Lock className="h-4 w-4 mr-2" />
                {t("admin.settings.security", "Security")}
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="w-full justify-start px-3 py-2 h-auto data-[state=active]:bg-primary/10"
              >
                <Bell className="h-4 w-4 mr-2" />
                {t("admin.settings.notifications", "Notifications")}
              </TabsTrigger>
              <TabsTrigger 
                value="appearance" 
                className="w-full justify-start px-3 py-2 h-auto data-[state=active]:bg-primary/10"
              >
                <Settings className="h-4 w-4 mr-2" />
                {t("admin.settings.appearance", "Appearance")}
              </TabsTrigger>
              <TabsTrigger 
                value="language" 
                className="w-full justify-start px-3 py-2 h-auto data-[state=active]:bg-primary/10"
              >
                <Globe className="h-4 w-4 mr-2" />
                {t("admin.settings.language", "Language & Region")}
              </TabsTrigger>
              <TabsTrigger 
                value="billing" 
                className="w-full justify-start px-3 py-2 h-auto data-[state=active]:bg-primary/10"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {t("admin.settings.billing", "Billing")}
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="w-full justify-start px-3 py-2 h-auto data-[state=active]:bg-primary/10"
              >
                <Shield className="h-4 w-4 mr-2" />
                {t("admin.settings.privacy", "Privacy & Data")}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="md:w-3/4">
            <TabsContent value="account" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.settings.account_settings", "Account Settings")}</CardTitle>
                  <CardDescription>
                    {t("admin.settings.account_desc", "Manage your account information and preferences")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("admin.settings.name", "Full Name")}</Label>
                      <Input id="name" defaultValue="Admin User" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("admin.settings.email", "Email")}</Label>
                      <Input id="email" type="email" defaultValue="admin@istanbuldentalsmile.co.uk" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">{t("admin.settings.role", "Role")}</Label>
                      <Input id="role" defaultValue="Administrator" disabled />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">{t("admin.settings.profile_picture", "Profile Picture")}</h3>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                        A
                      </div>
                      <div>
                        <Button variant="outline" size="sm" className="mb-2">
                          {t("admin.settings.upload", "Upload New")}
                        </Button>
                        <p className="text-xs text-gray-500">
                          {t("admin.settings.image_requirements", "JPG, GIF or PNG. Max size 1MB.")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <Button variant="outline">
                    {t("admin.settings.discard", "Discard Changes")}
                  </Button>
                  <Button onClick={handleSaveSettings} className="gap-2">
                    <Save className="h-4 w-4" />
                    {t("admin.settings.save_changes", "Save Changes")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.settings.security_settings", "Security Settings")}</CardTitle>
                  <CardDescription>
                    {t("admin.settings.security_desc", "Manage your password and account security preferences")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">{t("admin.settings.change_password", "Change Password")}</h3>
                    <div className="space-y-2">
                      <Label htmlFor="current-password">{t("admin.settings.current_password", "Current Password")}</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">{t("admin.settings.new_password", "New Password")}</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{t("admin.settings.confirm_password", "Confirm New Password")}</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">{t("admin.settings.two_factor", "Two-Factor Authentication")}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t("admin.settings.2fa", "Two-Factor Authentication")}</p>
                        <p className="text-sm text-gray-500">{t("admin.settings.2fa_desc", "Add an extra layer of security to your account")}</p>
                      </div>
                      <Switch id="2fa" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <Button variant="outline">
                    {t("admin.settings.discard", "Discard Changes")}
                  </Button>
                  <Button onClick={handleSaveSettings} className="gap-2">
                    <Save className="h-4 w-4" />
                    {t("admin.settings.save_changes", "Save Changes")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.settings.notification_settings", "Notification Settings")}</CardTitle>
                  <CardDescription>
                    {t("admin.settings.notification_desc", "Manage how and when you receive notifications")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">{t("admin.settings.email_notifications", "Email Notifications")}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{t("admin.settings.new_quote", "New Quote Requests")}</p>
                          <p className="text-sm text-gray-500">{t("admin.settings.new_quote_desc", "Get notified when a new quote request is submitted")}</p>
                        </div>
                        <Switch defaultChecked id="new-quote" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{t("admin.settings.booking_notifications", "Booking Confirmations")}</p>
                          <p className="text-sm text-gray-500">{t("admin.settings.booking_desc", "Receive notifications for new bookings")}</p>
                        </div>
                        <Switch defaultChecked id="bookings" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{t("admin.settings.message_notifications", "New Messages")}</p>
                          <p className="text-sm text-gray-500">{t("admin.settings.message_desc", "Get notified when you receive a new message")}</p>
                        </div>
                        <Switch defaultChecked id="messages" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{t("admin.settings.marketing", "Marketing & Updates")}</p>
                          <p className="text-sm text-gray-500">{t("admin.settings.marketing_desc", "Receive updates about new features and improvements")}</p>
                        </div>
                        <Switch id="marketing" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <Button variant="outline">
                    {t("admin.settings.discard", "Discard Changes")}
                  </Button>
                  <Button onClick={handleSaveSettings} className="gap-2">
                    <Save className="h-4 w-4" />
                    {t("admin.settings.save_changes", "Save Changes")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Placeholder for other settings tabs */}
            {['appearance', 'language', 'billing', 'privacy'].map((tab) => (
              <TabsContent key={tab} value={tab} className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t(`admin.settings.${tab}_settings`, `${tab.charAt(0).toUpperCase() + tab.slice(1)} Settings`)}
                    </CardTitle>
                    <CardDescription>
                      {t(`admin.settings.${tab}_desc`, `Settings related to ${tab}`)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                      <Settings className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      {t("admin.settings.coming_soon", "Coming Soon")}
                    </h3>
                    <p className="text-gray-500 text-center max-w-md mb-6">
                      {t("admin.settings.coming_soon_desc", `The ${tab} settings are currently under development and will be available soon.`)}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminSettingsSection;