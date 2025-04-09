import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/App";
import { Settings as SettingsIcon, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTheme, ThemeVariant, ThemeAppearance } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SettingsProps {
  user: User | null;
}

const Settings = ({ user }: SettingsProps) => {
  const { toast } = useToast();
  const { variant, appearance, primaryColor, radius, setTheme } = useTheme();
  const { enabled: notificationsEnabled, setEnabled: setNotificationsEnabled, addNotification } = useNotifications();
  const [questionCount, setQuestionCount] = useState(5);
  
  // Theme settings
  const [selectedAppearance, setSelectedAppearance] = useState<ThemeAppearance>(appearance);
  const [selectedVariant, setSelectedVariant] = useState<ThemeVariant>(variant);
  const [selectedRadius, setSelectedRadius] = useState(radius);
  
  // We don't need darkMode state anymore as we use theme context
  // This is derived from appearance now
  const isDarkMode = appearance === 'dark';
  
  // Update local state when theme context changes
  useEffect(() => {
    setSelectedAppearance(appearance);
    setSelectedVariant(variant);
    setSelectedRadius(radius);
  }, [appearance, variant, radius]);
  
  // Handle appearance change
  const handleAppearanceChange = (value: string) => {
    setSelectedAppearance(value as ThemeAppearance);
    setTheme({ appearance: value as ThemeAppearance });
  };
  
  // Handle theme variant change
  const handleVariantChange = (value: string) => {
    setSelectedVariant(value as ThemeVariant);
    setTheme({ variant: value as ThemeVariant });
  };
  
  // Handle radius change
  const handleRadiusChange = (value: number) => {
    setSelectedRadius(value);
    setTheme({ radius: value });
  };
  
  // Handle notifications change
  const handleNotificationsChange = (checked: boolean) => {
    setNotificationsEnabled(checked);
    
    // Show a test notification if enabled
    if (checked) {
      addNotification({
        title: "Notifications Enabled",
        message: "You will now receive notifications from Ai Tutor",
        type: "success"
      });
    }
  };

  const handleSaveSettings = () => {
    // In a real app, we would save these settings to the server
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully",
    });
    
    // Show a test notification if notifications are enabled
    if (notificationsEnabled) {
      addNotification({
        title: "Settings Updated",
        message: "Your settings have been saved successfully",
        type: "info"
      });
    }
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all your data? This action cannot be undone.")) {
      // In a real app, we would clear the user's data from the server
      toast({
        title: "Data cleared",
        description: "All your documents and questions have been removed",
      });
      
      // Show a notification if notifications are enabled
      if (notificationsEnabled) {
        addNotification({
          title: "Data Cleared",
          message: "All your documents and questions have been removed",
          type: "warning"
        });
      }
    }
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Settings
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account and preferences
            </p>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-8 text-center">
          <SettingsIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in</h3>
          <p className="text-gray-500 mb-6">
            Sign in to manage your settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account and preferences
          </p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Username</Label>
                <div className="mt-1 text-sm text-gray-700 font-medium">{user.username}</div>
              </div>
              <div>
                <Label>Email</Label>
                <div className="mt-1 text-sm text-gray-700 font-medium">{user.email}</div>
              </div>
            </div>
            
            <div className="pt-2">
              <Button variant="outline">Change Password</Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications</Label>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications about generated questions
                </div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationsChange}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <Label>Theme Settings</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Customize the appearance of the application
              </div>
              
              <Tabs defaultValue="appearance" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="roundness">Roundness</TabsTrigger>
                </TabsList>
                
                <TabsContent value="appearance" className="pt-4">
                  <RadioGroup value={selectedAppearance} onValueChange={handleAppearanceChange} className="grid grid-cols-3 gap-4">
                    <div>
                      <RadioGroupItem value="light" id="light" className="peer sr-only" />
                      <Label
                        htmlFor="light"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <span className="mb-2">☀️</span>
                        <span className="font-medium">Light</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                      <Label
                        htmlFor="dark"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <span className="mb-2">🌙</span>
                        <span className="font-medium">Dark</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem value="system" id="system" className="peer sr-only" />
                      <Label
                        htmlFor="system"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <span className="mb-2">💻</span>
                        <span className="font-medium">System</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </TabsContent>
                
                <TabsContent value="style" className="pt-4">
                  <RadioGroup value={selectedVariant} onValueChange={handleVariantChange} className="grid grid-cols-3 gap-4">
                    <div>
                      <RadioGroupItem value="vibrant" id="vibrant" className="peer sr-only" />
                      <Label
                        htmlFor="vibrant"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <span className="mb-2 font-bold text-blue-500">A</span>
                        <span className="font-medium">Vibrant</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem value="professional" id="professional" className="peer sr-only" />
                      <Label
                        htmlFor="professional"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <span className="mb-2 font-bold text-gray-700">A</span>
                        <span className="font-medium">Professional</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem value="tint" id="tint" className="peer sr-only" />
                      <Label
                        htmlFor="tint"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <span className="mb-2 font-bold text-indigo-400">A</span>
                        <span className="font-medium">Tint</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </TabsContent>
                
                <TabsContent value="roundness" className="pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[0.25, 0.75, 1.5].map((r) => (
                      <div key={r} onClick={() => handleRadiusChange(r)}>
                        <div 
                          className={`flex flex-col items-center justify-between rounded-md border-2 ${selectedRadius === r ? 'border-primary bg-primary/5' : 'border-muted'} bg-white p-4 hover:bg-gray-50 hover:border-primary cursor-pointer`}
                        >
                          <div 
                            className={`h-12 w-12 bg-gray-200 mb-2`}
                            style={{ borderRadius: `${r * 0.5}rem` }}
                          ></div>
                          <span className="font-medium">{r === 0.25 ? 'Square' : r === 0.75 ? 'Rounded' : 'Pill'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Default Question Count</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Set the default number of questions to generate
              </div>
              <div className="flex space-x-2">
                {[5, 10, 15, 20].map((count) => (
                  <Button
                    key={count}
                    variant={questionCount === count ? "default" : "outline"}
                    className="px-3 py-1 h-auto"
                    onClick={() => setQuestionCount(count)}
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="pt-2">
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your documents and questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Clearing your data will permanently delete all your uploaded documents and generated questions.
                This action cannot be undone.
              </AlertDescription>
            </Alert>
            
            <div className="pt-2">
              <Button variant="destructive" onClick={handleClearData}>
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* API Keys (Mock for demo purposes) */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Configure AI services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>OpenAI API Key</Label>
              <div className="flex items-center">
                <div className="bg-gray-100 px-3 py-2 rounded-md text-sm text-gray-600 font-mono w-full">
                  ••••••••••••••••••••••••••••••
                </div>
                <Button variant="outline" className="ml-2 whitespace-nowrap">
                  Change Key
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Your API key is stored securely and never shared
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
