import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Button } from "@/components/ui/button";
import { moodleApi } from "@/services/moodleApi";
import { useAuth } from "@/contexts/AuthContext";
import { MoodleCredentials } from "@/types/moodle";

export default function MoodleConfig() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [moodleUrl, setMoodleUrl] = useState("");
  const [moodleToken, setMoodleToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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

      // Redirect to the appropriate dashboard
      if (authState.user?.role === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      let message = "Failed to connect to Moodle";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-light">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Connect to Moodle</CardTitle>
          <CardDescription>
            Enter your Moodle instance URL and API token to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-white bg-red-500 rounded-lg">
                {error}
              </div>
            )}

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
                {isLoading ? "Connecting..." : "Connect"}
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              You can find your Moodle API token in your Moodle profile settings under Security Keys or by contacting your Moodle administrator.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
