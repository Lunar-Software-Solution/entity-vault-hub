import { useState, useEffect, useRef } from "react";
import { getGravatarUrl, getInitials } from "@/lib/gravatar";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { useProfileEnrichment } from "@/hooks/useProfileEnrichment";

interface GravatarAvatarProps {
  email?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fallbackIcon?: React.ReactNode;
  linkedinUrl?: string | null;
  enableEnrichment?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const textSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const pixelSizes = {
  sm: 32,
  md: 40,
  lg: 48,
};

const GravatarAvatar = ({
  email,
  name,
  size = "md",
  className = "",
  fallbackIcon,
  linkedinUrl,
  enableEnrichment = true,
}: GravatarAvatarProps) => {
  const [imageStatus, setImageStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const triedUrls = useRef<Set<string>>(new Set());

  // Use profile enrichment when enabled and we have email or LinkedIn URL
  const { data: enrichedProfile, isLoading: isEnriching } = useProfileEnrichment({
    email,
    linkedin_url: linkedinUrl,
    name,
    enabled: enableEnrichment && !!(email || linkedinUrl),
  });

  const gravatarUrl = getGravatarUrl(email, pixelSizes[size] * 2, "404");
  const initials = getInitials(name);

  // Build ordered list of avatar URLs to try
  const avatarUrls: string[] = [];
  
  // 1. Enrichment avatar (highest priority)
  if (enrichedProfile?.avatar_url) {
    avatarUrls.push(enrichedProfile.avatar_url);
  }
  
  // 2. Gravatar fallback
  if (gravatarUrl) {
    avatarUrls.push(gravatarUrl);
  }

  const currentUrl = avatarUrls[currentUrlIndex];

  // Reset when URLs change
  useEffect(() => {
    triedUrls.current.clear();
    setCurrentUrlIndex(0);
    setImageStatus("loading");
  }, [enrichedProfile?.avatar_url, gravatarUrl]);

  const handleError = () => {
    if (currentUrl) {
      triedUrls.current.add(currentUrl);
    }
    
    // Try next URL in the list
    if (currentUrlIndex < avatarUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setImageStatus("loading");
    } else {
      setImageStatus("error");
    }
  };

  const handleLoad = () => {
    setImageStatus("loaded");
  };

  // Show loading state while enriching
  if (isEnriching && enableEnrichment) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          "rounded-full bg-muted animate-pulse flex-shrink-0",
          className
        )}
      />
    );
  }

  // If no URLs available or all failed, show initials fallback
  if (avatarUrls.length === 0 || imageStatus === "error") {
    return (
      <div
        className={cn(
          sizeClasses[size],
          "rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0",
          className
        )}
      >
        {fallbackIcon || (
          initials ? (
            <span className={cn("font-medium text-primary", textSizes[size])}>
              {initials}
            </span>
          ) : (
            <User className="w-1/2 h-1/2 text-primary" />
          )
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-full overflow-hidden flex-shrink-0 bg-muted",
        className
      )}
    >
      {imageStatus === "loading" && (
        <div className={cn(sizeClasses[size], "bg-muted animate-pulse")} />
      )}
      {currentUrl && (
        <img
          key={currentUrl}
          src={currentUrl}
          alt={name}
          className={cn(
            "w-full h-full object-cover",
            imageStatus === "loading" && "hidden"
          )}
          onError={handleError}
          onLoad={handleLoad}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
};

export default GravatarAvatar;
