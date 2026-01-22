import { useState } from "react";
import { Building2 } from "lucide-react";

const LOGO_DEV_API_KEY = "pk_RziJ9gEGSbmf8rMrVGy_9w";

interface CompanyLogoProps {
  domain?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  fallbackIcon?: React.ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

const CompanyLogo = ({ 
  domain, 
  name, 
  size = "md", 
  fallbackIcon,
  className = "" 
}: CompanyLogoProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Extract domain from website URL if provided
  const extractDomain = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      return urlObj.hostname.replace("www.", "");
    } catch {
      // If it's already just a domain
      return url.replace("www.", "");
    }
  };

  const cleanDomain = extractDomain(domain);
  const logoUrl = cleanDomain 
    ? `https://img.logo.dev/${cleanDomain}?token=${LOGO_DEV_API_KEY}&size=128&format=png`
    : null;

  if (!logoUrl || hasError) {
    return (
      <div className={`${sizeClasses[size]} rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 ${className}`}>
        {fallbackIcon || <Building2 className="w-1/2 h-1/2 text-primary-foreground" />}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-xl overflow-hidden flex-shrink-0 bg-white border border-border ${className}`}>
      {isLoading && (
        <div className="w-full h-full animate-pulse bg-muted" />
      )}
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={`w-full h-full object-contain p-1 ${isLoading ? "hidden" : "block"}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default CompanyLogo;
