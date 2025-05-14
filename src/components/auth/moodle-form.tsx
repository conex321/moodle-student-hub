
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export function MoodleForm() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Store Moodle credentials in localStorage for now
      localStorage.setItem('moodle_url', url);
      localStorage.setItem('moodle_token', token);
      
      toast({
        title: "Moodle configured successfully",
        description: "Your Moodle credentials have been saved.",
      });
      
      // Redirect to the appropriate dashboard
      if (authState.user?.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      console.error('Error saving Moodle configuration:', error);
      toast({
        variant: "destructive",
        title: "Configuration failed",
        description: "There was an error saving your Moodle configuration.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="moodle-url" className="text-sm font-medium">
          Moodle URL
        </label>
        <Input
          id="moodle-url"
          placeholder="https://your-moodle-instance.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="moodle-token" className="text-sm font-medium">
          API Token
        </label>
        <Input
          id="moodle-token"
          type="password"
          placeholder="Your Moodle API token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500">
          You can generate an API token in your Moodle account settings.
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting || !url || !token}
      >
        {isSubmitting ? "Saving..." : "Save Configuration"}
      </Button>
    </form>
  );
}
