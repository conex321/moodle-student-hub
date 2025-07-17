
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { StickyHeader } from "@/components/layout/sticky-header";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <StickyHeader />
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center pt-16">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
        <p className="text-gray-500 max-w-md mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
