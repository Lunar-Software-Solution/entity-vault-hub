import { useState } from "react";
import { getGravatarUrl, getInitials } from "@/lib/gravatar";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface GravatarAvatarProps {
  email?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fallbackIcon?: React.ReactNode;
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
}: GravatarAvatarProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const gravatarUrl = getGravatarUrl(email, pixelSizes[size] * 2, "404"); // Use 404 to detect no gravatar
  const initials = getInitials(name);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If no email or gravatar failed, show initials fallback
  if (!email || hasError) {
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
        src={gravatarUrl!}
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