import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [_, navigate] = useLocation();

  // Redirect to the profile page, which is the main dashboard
  useEffect(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Redirecting to dashboard...</span>
    </div>
  );
}
