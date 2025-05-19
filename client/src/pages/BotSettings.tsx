import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { BotSettings } from "@shared/schema";

export default function BotSettings() {
  // Default chat ID for demo purposes
  const defaultChatId = "123456789";
  const [chatId, setChatId] = useState(defaultChatId);
  const [settings, setSettings] = useState<Partial<BotSettings>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: botSettings, isLoading } = useQuery<BotSettings>({
    queryKey: [`/api/settings/${chatId}`],
    onSuccess: (data) => {
      setSettings(data);
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (updatedSettings: Partial<BotSettings>) => {
      await apiRequest("PATCH", `/api/settings/${chatId}`, updatedSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/settings/${chatId}`] });
      toast({
        title: "Success",
        description: "Bot settings have been updated",
      });
      setIsEditing(false);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Failed to update bot settings",
        variant: "destructive",
      });
      console.error(err);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: typeof botSettings?.[name as keyof BotSettings] === 'number' ? parseInt(value) : value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(settings);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset to original settings
    if (botSettings) {
      setSettings(botSettings);
    }
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bot Settings</h1>
        <p className="text-gray-600">Configure your Telegram moderator bot's behavior</p>
      </header>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="bg-primary text-white px-4 py-3 flex justify-between items-center">
            <h2 className="font-semibold">Bot Configuration</h2>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${botSettings ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-sm">{botSettings ? 'Connected' : 'Connecting...'}</span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="text-center py-8">
                <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-gray-600">Loading bot settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="chatId">Chat ID</Label>
                    <Input 
                      id="chatId" 
                      name="chatId" 
                      value={chatId} 
                      onChange={(e) => setChatId(e.target.value)}
                      disabled={!isEditing || updateSettings.isPending}
                      placeholder="Enter Telegram chat ID"
                    />
                    <p className="text-xs text-gray-500">The Telegram chat ID where this bot operates</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="defaultMuteDuration">Default Mute Duration (minutes)</Label>
                      <Input 
                        id="defaultMuteDuration" 
                        name="defaultMuteDuration" 
                        type="number"
                        min="1"
                        value={settings.defaultMuteDuration || 1440} 
                        onChange={handleInputChange}
                        disabled={!isEditing || updateSettings.isPending}
                      />
                      <p className="text-xs text-gray-500">How long to mute users by default (in minutes)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warningThreshold">Warning Threshold</Label>
                      <Input 
                        id="warningThreshold" 
                        name="warningThreshold" 
                        type="number"
                        min="1" 
                        value={settings.warningThreshold || 3} 
                        onChange={handleInputChange}
                        disabled={!isEditing || updateSettings.isPending}
                      />
                      <p className="text-xs text-gray-500">Number of warnings before automatic action</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="muteThreshold">Mute Threshold</Label>
                      <Input 
                        id="muteThreshold" 
                        name="muteThreshold" 
                        type="number"
                        min="1" 
                        value={settings.muteThreshold || 5} 
                        onChange={handleInputChange}
                        disabled={!isEditing || updateSettings.isPending}
                      />
                      <p className="text-xs text-gray-500">Number of warnings before muting user</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="banThreshold">Ban Threshold</Label>
                      <Input 
                        id="banThreshold" 
                        name="banThreshold" 
                        type="number"
                        min="1" 
                        value={settings.banThreshold || 8} 
                        onChange={handleInputChange}
                        disabled={!isEditing || updateSettings.isPending}
                      />
                      <p className="text-xs text-gray-500">Number of warnings before banning user</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-gray-900">Default Behavior Options</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="deleteOnFilter">Delete Filtered Messages</Label>
                        <p className="text-xs text-gray-500">Automatically delete messages containing filtered words</p>
                      </div>
                      <Switch 
                        id="deleteOnFilter" 
                        name="deleteOnFilter"
                        checked={settings.deleteOnFilter !== undefined ? settings.deleteOnFilter : true}
                        onCheckedChange={(checked) => handleSwitchChange("deleteOnFilter", checked)}
                        disabled={!isEditing || updateSettings.isPending}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="warnOnFilter">Warn on Filtered Words</Label>
                        <p className="text-xs text-gray-500">Issue warnings when users send filtered words</p>
                      </div>
                      <Switch 
                        id="warnOnFilter" 
                        name="warnOnFilter"
                        checked={settings.warnOnFilter !== undefined ? settings.warnOnFilter : true}
                        onCheckedChange={(checked) => handleSwitchChange("warnOnFilter", checked)}
                        disabled={!isEditing || updateSettings.isPending}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifyAdmins">Notify Admins</Label>
                        <p className="text-xs text-gray-500">Send notifications to group admins on serious violations</p>
                      </div>
                      <Switch 
                        id="notifyAdmins" 
                        name="notifyAdmins"
                        checked={settings.notifyAdmins !== undefined ? settings.notifyAdmins : true}
                        onCheckedChange={(checked) => handleSwitchChange("notifyAdmins", checked)}
                        disabled={!isEditing || updateSettings.isPending}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="customWelcomeMessage">Custom Welcome Message (Optional)</Label>
                    <Textarea 
                      id="customWelcomeMessage" 
                      name="customWelcomeMessage" 
                      value={settings.customWelcomeMessage || ''} 
                      onChange={handleInputChange}
                      placeholder="Enter a welcome message for new users"
                      disabled={!isEditing || updateSettings.isPending}
                      className="min-h-[100px]"
                    />
                    <p className="text-xs text-gray-500">Message sent to new members when they join the group</p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-amber-800">Important Note</h3>
                          <div className="mt-2 text-sm text-amber-700">
                            <p>To use this bot, you must add it to your Telegram group as an administrator with permissions to delete messages, ban users, and restrict members.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="px-6 py-4 border-t flex justify-end gap-2 bg-gray-50">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={updateSettings.isPending}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleSubmit} disabled={updateSettings.isPending}>
                  {updateSettings.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit}>
                Edit Settings
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="bg-primary text-white px-4 py-3">
            <h2 className="font-semibold">Bot Token Management</h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Your Telegram bot token is securely stored as an environment variable. If you need to update your bot token, you'll need to update the <code className="bg-gray-100 px-1 py-0.5 rounded">TELEGRAM_BOT_TOKEN</code> environment variable.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-md border">
                <h3 className="text-sm font-medium mb-2">Current Bot Status</h3>
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full ${botSettings ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                  <span className="text-sm text-gray-700">{botSettings ? 'Bot is active and running' : 'Bot is not connected'}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button variant="outline" className="w-full md:w-auto">
                  Test Bot Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
