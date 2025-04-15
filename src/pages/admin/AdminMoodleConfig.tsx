
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Save, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { moodleApi } from "@/services/moodleApi";

// Mock saved Moodle configurations
const mockSavedConfigs = [
  { id: 1, name: "Production Moodle", url: "https://moodle.example.com", token: "prod_token_123", isActive: true },
  { id: 2, name: "Testing Environment", url: "https://test-moodle.example.org", token: "test_token_456", isActive: false },
];

export default function AdminMoodleConfig() {
  const { toast } = useToast();
  const [savedConfigs, setSavedConfigs] = useState(mockSavedConfigs);
  const [newConfig, setNewConfig] = useState({ name: "", url: "", token: "" });
  const [testResult, setTestResult] = useState<null | { success: boolean; message: string }>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<number | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setNewConfig({ name: "", url: "", token: "" });
    setTestResult(null);
    setIsEditMode(false);
    setCurrentEditId(null);
  };

  const handleEditConfig = (config: typeof mockSavedConfigs[0]) => {
    setNewConfig({
      name: config.name,
      url: config.url,
      token: config.token,
    });
    setCurrentEditId(config.id);
    setIsEditMode(true);
    setTestResult(null);
  };

  const handleSaveConfig = () => {
    if (!newConfig.name || !newConfig.url || !newConfig.token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All fields are required",
      });
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      if (isEditMode && currentEditId) {
        setSavedConfigs(
          savedConfigs.map(config => 
            config.id === currentEditId 
              ? { ...config, name: newConfig.name, url: newConfig.url, token: newConfig.token }
              : config
          )
        );
        toast({
          title: "Configuration updated",
          description: `${newConfig.name} has been updated successfully`,
        });
      } else {
        const newId = Math.max(...savedConfigs.map(c => c.id)) + 1;
        setSavedConfigs([
          ...savedConfigs,
          {
            id: newId,
            name: newConfig.name,
            url: newConfig.url,
            token: newConfig.token,
            isActive: false,
          }
        ]);
        toast({
          title: "Configuration added",
          description: `${newConfig.name} has been added successfully`,
        });
      }
      
      setIsSaving(false);
      resetForm();
    }, 1000);
  };

  const handleDeleteConfig = (id: number) => {
    setSavedConfigs(savedConfigs.filter(config => config.id !== id));
    toast({
      title: "Configuration deleted",
      description: "The Moodle configuration has been deleted",
    });
  };

  const handleSetActive = (id: number) => {
    const config = savedConfigs.find(c => c.id === id);
    if (!config) return;
    
    // Update Moodle API with the selected configuration
    moodleApi.setCredentials(config.url, config.token);
    
    // Update UI state
    setSavedConfigs(
      savedConfigs.map(config => ({
        ...config,
        isActive: config.id === id,
      }))
    );
    
    toast({
      title: "Active configuration changed",
      description: `${config.name} is now the active Moodle connection`,
    });
  };

  const handleTestConnection = async () => {
    if (!newConfig.url || !newConfig.token) {
      setTestResult({
        success: false,
        message: "URL and API token are required to test the connection",
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      // Store temporarily for testing
      moodleApi.setCredentials(newConfig.url, newConfig.token);
      
      // Try to fetch courses as a test
      await moodleApi.getCourses();
      
      setTestResult({
        success: true,
        message: "Connection successful! Moodle API is responding correctly.",
      });
    } catch (err) {
      let message = "Failed to connect to Moodle API";
      if (err instanceof Error) {
        message = err.message;
      }
      
      setTestResult({
        success: false,
        message,
      });
    } finally {
      setIsTestingConnection(false);
      
      // Restore original configuration if we have an active one
      const activeConfig = savedConfigs.find(c => c.isActive);
      if (activeConfig) {
        moodleApi.setCredentials(activeConfig.url, activeConfig.token);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Moodle Configuration</h1>
          <div className="space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Configuration
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? "Edit" : "Add"} Moodle Configuration</DialogTitle>
                  <DialogDescription>
                    {isEditMode 
                      ? "Update your Moodle instance connection details" 
                      : "Connect to a new Moodle instance by providing the details below"}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <InputWithLabel
                    label="Configuration Name"
                    type="text"
                    value={newConfig.name}
                    onChange={(e) => setNewConfig({...newConfig, name: e.target.value})}
                    placeholder="e.g., Production Moodle"
                    required
                  />
                  
                  <InputWithLabel
                    label="Moodle URL"
                    type="url"
                    value={newConfig.url}
                    onChange={(e) => setNewConfig({...newConfig, url: e.target.value})}
                    placeholder="https://yourmoodle.example.com"
                    required
                  />
                  
                  <InputWithLabel
                    label="API Token"
                    type="text"
                    value={newConfig.token}
                    onChange={(e) => setNewConfig({...newConfig, token: e.target.value})}
                    placeholder="Your Moodle API token"
                    required
                  />
                  
                  {testResult && (
                    <div className={`p-4 rounded-lg flex items-start space-x-2 ${
                      testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                      {testResult.success 
                        ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> 
                        : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
                      <p className="text-sm">{testResult.message}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !newConfig.url || !newConfig.token}
                  >
                    {isTestingConnection ? "Testing..." : "Test Connection"}
                  </Button>
                  
                  <Button onClick={handleSaveConfig} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Configuration"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Saved Configurations</CardTitle>
            <CardDescription>
              Manage your saved Moodle instance connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            {savedConfigs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No configurations saved yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => resetForm()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Configuration
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedConfigs.map((config) => (
                  <Card key={config.id} className={config.isActive ? "border-primary" : ""}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center">
                            {config.name}
                            {config.isActive && (
                              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                Active
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">{config.url}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Token: {config.token.substring(0, 8)}...
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {!config.isActive && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSetActive(config.id)}
                            >
                              Set Active
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditConfig(config)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteConfig(config.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Moodle API Settings</CardTitle>
            <CardDescription>
              Configure how the Moodle Hub interacts with your Moodle instance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general">
              <TabsList className="mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWithLabel
                    label="API Request Timeout"
                    type="number"
                    min="1"
                    max="60"
                    defaultValue="30"
                    placeholder="Timeout in seconds"
                  />
                  
                  <InputWithLabel
                    label="Cache Duration"
                    type="number"
                    min="1"
                    max="86400"
                    defaultValue="3600"
                    placeholder="Duration in seconds"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <InputWithLabel
                  label="Web Service Path"
                  type="text"
                  defaultValue="/webservice/rest/server.php"
                  placeholder="Custom web service path"
                />
                
                <InputWithLabel
                  label="Response Format"
                  type="text"
                  defaultValue="json"
                  placeholder="Response format (json, xml)"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" className="mr-2">
              Reset to Defaults
            </Button>
            <Button>
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}
