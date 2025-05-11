
import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { toast } from "sonner";
import { moodleApi } from "@/services/moodleApi";
import { Settings, Database } from "lucide-react";

export default function TeacherSettings() {
  const [moodleUrl, setMoodleUrl] = useState(localStorage.getItem('moodle_url') || "");
  const [moodleToken, setMoodleToken] = useState(localStorage.getItem('moodle_token') || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveMoodleConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate URL format
      try {
        new URL(moodleUrl);
      } catch (error) {
        throw new Error("Please enter a valid URL (include http:// or https://)");
      }

      // Store Moodle credentials
      moodleApi.setCredentials(moodleUrl, moodleToken);

      // Try to fetch courses as a test
      await moodleApi.getCourses();

      toast.success("Moodle configuration saved successfully!");
    } catch (err) {
      let message = "Failed to connect to Moodle";
      if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout requiredRole="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Settings className="h-6 w-6 text-gray-500" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Moodle Configuration
            </CardTitle>
            <CardDescription>
              Connect to your Moodle instance by providing your URL and API token
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveMoodleConfig} className="space-y-6">
              <InputWithLabel
                label="Moodle URL"
                type="url"
                value={moodleUrl}
                onChange={(e) => setMoodleUrl(e.target.value)}
                placeholder="https://yourmoodle.example.com"
                required
                className="h-12 text-base"
                labelClassName="text-base"
              />

              <InputWithLabel
                label="Moodle API Token"
                type="text"
                value={moodleToken}
                onChange={(e) => setMoodleToken(e.target.value)}
                placeholder="Your Moodle Web Service token"
                required
                className="h-12 text-base"
                labelClassName="text-base"
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-primary text-lg font-medium"
                >
                  {isLoading ? "Saving..." : "Save Configuration"}
                </Button>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                You can find your Moodle API token in your Moodle profile settings under Security Keys or by contacting your Moodle administrator.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* We can add more setting sections here in the future */}
      </div>
    </MainLayout>
  );
}
