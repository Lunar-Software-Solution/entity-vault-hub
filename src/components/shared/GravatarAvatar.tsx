import { useState, useEffect } from "react";
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
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  // Use Clay enrichment when enabled and we have email or LinkedIn URL
  const { data: enrichedProfile, isLoading: isEnriching } = useProfileEnrichment({
    email,
    linkedin_url: linkedinUrl,
    name,
    enabled: enableEnrichment && !!(email || linkedinUrl),
  });

  const gravatarUrl = getGravatarUrl(email, pixelSizes[size] * 2, "404");
  const initials = getInitials(name);

  // Determine which avatar URL to use (Clay first, then Gravatar)
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);

    if (enrichedProfile?.avatar_url) {
      // Clay enrichment has an avatar
      setCurrentImageUrl(enrichedProfile.avatar_url);
    } else if (gravatarUrl) {
      // Fall back to Gravatar
      setCurrentImageUrl(gravatarUrl);
    } else {
      setCurrentImageUrl(null);
      setIsLoading(false);
    }
  }, [enrichedProfile?.avatar_url, gravatarUrl]);

  const handleError = () => {
    // If Clay avatar failed, try Gravatar as fallback
    if (currentImageUrl === enrichedProfile?.avatar_url && gravatarUrl) {
      setCurrentImageUrl(gravatarUrl);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
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

  // If no image URL available or all sources failed, show initials fallback
  if (!currentImageUrl || hasError) {
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
      {isLoading && (
        <div className={cn(sizeClasses[size], "bg-muted animate-pulse")} />
      )}
      <img
        src={currentImageUrl}
        alt={name}
        className={cn(
          "w-full h-full object-cover",
          isLoading && "hidden"
        )}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};

export default GravatarAvatar;
