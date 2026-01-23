import { CreditCard } from "lucide-react";
import { CardBrand } from "@/lib/cardBrandUtils";

interface CardBrandIconProps {
  brand: CardBrand;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-5 w-auto",
  md: "h-7 w-auto",
  lg: "h-10 w-auto",
};

// SVG brand icons
const VisaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none">
    <rect width="48" height="32" rx="4" fill="white"/>
    <path d="M19.5 21.5L21 10.5H24L22.5 21.5H19.5Z" fill="#1A1F71"/>
    <path d="M32.5 10.7C31.8 10.4 30.7 10.1 29.4 10.1C26.4 10.1 24.3 11.7 24.3 14C24.3 15.7 25.8 16.6 26.9 17.2C28.1 17.8 28.5 18.2 28.5 18.7C28.5 19.5 27.5 19.9 26.6 19.9C25.3 19.9 24.6 19.7 23.5 19.2L23.1 19L22.6 22C23.5 22.4 25.1 22.7 26.8 22.7C30 22.7 32.1 21.1 32.1 18.7C32.1 17.4 31.3 16.4 29.6 15.5C28.6 15 28 14.6 28 14.1C28 13.6 28.6 13.1 29.7 13.1C30.7 13.1 31.4 13.3 31.9 13.5L32.2 13.7L32.5 10.7Z" fill="#1A1F71"/>
    <path d="M37.5 10.5H35.2C34.4 10.5 33.8 10.7 33.5 11.5L29 21.5H32.2L32.8 19.8H36.7L37.1 21.5H40L37.5 10.5ZM33.7 17.5C33.7 17.5 34.9 14.2 35.1 13.6C35.1 13.6 35.4 12.7 35.6 12.2L35.8 13.5L36.5 17.5H33.7Z" fill="#1A1F71"/>
    <path d="M17.3 10.5L14.3 18.1L14 16.5C13.4 14.6 11.6 12.5 9.5 11.4L12.3 21.5H15.5L20.5 10.5H17.3Z" fill="#1A1F71"/>
    <path d="M12 10.5H7.1L7 10.7C10.7 11.6 13.1 13.9 14 16.5L13 11.5C12.9 10.8 12.3 10.5 12 10.5Z" fill="#F9A533"/>
  </svg>
);

const MastercardIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none">
    <rect width="48" height="32" rx="4" fill="white"/>
    <circle cx="19" cy="16" r="9" fill="#EB001B"/>
    <circle cx="29" cy="16" r="9" fill="#F79E1B"/>
    <path d="M24 9.7C25.8 11.2 27 13.5 27 16C27 18.5 25.8 20.8 24 22.3C22.2 20.8 21 18.5 21 16C21 13.5 22.2 11.2 24 9.7Z" fill="#FF5F00"/>
  </svg>
);

const AmexIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none">
    <rect width="48" height="32" rx="4" fill="#006FCF"/>
    <path d="M8 16L10.5 10H13L15.5 16M9.5 14H14M33 10V16H35.5L38 13L40.5 16H43V10H40.5V14L38.5 11.5H37.5L35.5 14V10H33Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 10H22V11.5H18V12.5H21.5V14H18V14.5H22V16H16V10Z" fill="white"/>
    <path d="M22 10H25L26.5 13L28 10H31V16H28.5V12.5L26.5 16H26.5L24.5 12.5V16H22V10Z" fill="white"/>
    <path d="M8 22L10.5 16H13L15.5 22M9.5 20H14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 16H19L20 17.5L21 16H24V22H21.5V18.5L20 20.5L18.5 18.5V22H16V16Z" fill="white"/>
    <path d="M25 16H31V17.5H27.5V18.5H30.5V20H27.5V20.5H31V22H25V16Z" fill="white"/>
    <path d="M32 16H35L36.5 19L38 16H40L37 22H35.5L32 16Z" fill="white"/>
    <path d="M40 16H43V22H40V16Z" fill="white"/>
  </svg>
);

const DiscoverIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none">
    <rect width="48" height="32" rx="4" fill="#white"/>
    <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" stroke="#E5E7EB"/>
    <path d="M0 16H24C24 16 36 16 48 8V32H0V16Z" fill="#F47216"/>
    <circle cx="30" cy="14" r="6" fill="#F47216"/>
    <text x="6" y="18" fontSize="7" fontWeight="bold" fill="#1A1F71">DISCOVER</text>
  </svg>
);

const DinersIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none">
    <rect width="48" height="32" rx="4" fill="white"/>
    <circle cx="24" cy="16" r="10" fill="#0079BE"/>
    <circle cx="20" cy="16" r="6" stroke="white" strokeWidth="2" fill="none"/>
    <circle cx="28" cy="16" r="6" stroke="white" strokeWidth="2" fill="none"/>
  </svg>
);

const JcbIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none">
    <rect width="48" height="32" rx="4" fill="white"/>
    <rect x="8" y="6" width="10" height="20" rx="3" fill="#0B4EA2"/>
    <rect x="19" y="6" width="10" height="20" rx="3" fill="#E4002B"/>
    <rect x="30" y="6" width="10" height="20" rx="3" fill="#009C3A"/>
    <text x="10" y="18" fontSize="5" fill="white" fontWeight="bold">J</text>
    <text x="21" y="18" fontSize="5" fill="white" fontWeight="bold">C</text>
    <text x="32" y="18" fontSize="5" fill="white" fontWeight="bold">B</text>
  </svg>
);

const UnionPayIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none">
    <rect width="48" height="32" rx="4" fill="#FFFFFF"/>
    <path d="M10 6H20C21.1 6 22 6.9 22 8V24C22 25.1 21.1 26 20 26H10C8.9 26 8 25.1 8 24V8C8 6.9 8.9 6 10 6Z" fill="#E21836"/>
    <path d="M18 6H28C29.1 6 30 6.9 30 8V24C30 25.1 29.1 26 28 26H18C16.9 26 16 25.1 16 24V8C16 6.9 16.9 6 18 6Z" fill="#00447C"/>
    <path d="M26 6H38C39.1 6 40 6.9 40 8V24C40 25.1 39.1 26 38 26H26C24.9 26 24 25.1 24 24V8C24 6.9 24.9 6 26 6Z" fill="#007B84"/>
  </svg>
);

const CardBrandIcon = ({ brand, size = "md", className = "" }: CardBrandIconProps) => {
  const sizeClass = sizeClasses[size];
  const combinedClass = `${sizeClass} ${className}`;

  switch (brand) {
    case "visa":
      return <VisaIcon className={combinedClass} />;
    case "mastercard":
      return <MastercardIcon className={combinedClass} />;
    case "amex":
      return <AmexIcon className={combinedClass} />;
    case "discover":
      return <DiscoverIcon className={combinedClass} />;
    case "diners":
      return <DinersIcon className={combinedClass} />;
    case "jcb":
      return <JcbIcon className={combinedClass} />;
    case "unionpay":
      return <UnionPayIcon className={combinedClass} />;
    default:
      return <CreditCard className={`${size === "sm" ? "w-5 h-5" : size === "lg" ? "w-10 h-10" : "w-7 h-7"} text-white/80 ${className}`} />;
  }
};

export default CardBrandIcon;
