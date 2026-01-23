import { useState } from "react";
import { 
  LayoutDashboard, Building2, CreditCard, Wallet, Share2, MapPin, 
  FileText, Settings, LogOut, User, ChevronUp, ChevronDown, ChevronRight,
  Phone, Receipt, Calendar, Briefcase, Mail, Users, PieChart, Globe,
  PanelLeftClose, PanelLeft, Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import braxLogo from "@/assets/brax-logo.png";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import GravatarAvatar from "@/components/shared/GravatarAvatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ProfileDialog from "./ProfileDialog";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface MenuGroup {
  id: string;
  label: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuGroups: MenuGroup[] = [
  {
    id: "main",
    label: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "entity", label: "Entities", icon: Building2 },
    ],
  },
  {
    id: "corporate",
    label: "Corporate",
    items: [
      { id: "directors-ubo", label: "Directors & UBOs", icon: Users },
      { id: "cap-table", label: "Cap Table", icon: PieChart },
      { id: "service-providers", label: "Service Providers", icon: Briefcase },
      { id: "filings", label: "Filings", icon: Calendar },
    ],
  },
  {
    id: "financial",
    label: "Financial",
    items: [
      { id: "bank-accounts", label: "Bank Accounts", icon: Wallet },
      { id: "credit-cards", label: "Credit Cards", icon: CreditCard },
      { id: "tax-ids", label: "Tax IDs", icon: Receipt },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    items: [
      { id: "phone-numbers", label: "Phone Numbers", icon: Phone },
      { id: "emails", label: "Emails", icon: Mail },
      { id: "social-media", label: "Social Media", icon: Share2 },
      { id: "addresses", label: "Addresses", icon: MapPin },
    ],
  },
  {
    id: "digital",
    label: "Digital",
    items: [
      { id: "websites", label: "Websites", icon: Globe },
      { id: "software", label: "Software", icon: Monitor },
    ],
  },
  {
    id: "legal",
    label: "Legal & Docs",
    items: [
      { id: "documents", label: "Documents", icon: FileText },
      { id: "contracts", label: "Contracts", icon: FileText },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    items: [
      { id: "users", label: "Users", icon: Users },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const Sidebar = ({
  activeSection,
  onSectionChange,
  collapsed = false,
  onCollapsedChange,
}: SidebarProps) => {
  const { user, signOut } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>(["main"]);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const userEmail = user?.email || "user@example.com";
  const userInitials = userEmail.split("@")[0].slice(0, 2).toUpperCase();

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isGroupActive = (group: MenuGroup) => {
    return group.items.some((item) => item.id === activeSection);
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = activeSection === item.id;
    const IconComponent = item.icon;

    if (collapsed) {
      return (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>
            <button
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center justify-center p-2 rounded-md transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <IconComponent className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground border border-border">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => onSectionChange(item.id)}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-sidebar-accent text-sidebar-primary"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
      >
        <IconComponent className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  const renderGroup = (group: MenuGroup) => {
    const isOpen = openGroups.includes(group.id);
    const hasActiveItem = isGroupActive(group);

    if (collapsed) {
      return (
        <div key={group.id} className="space-y-1">
          {group.items.map(renderMenuItem)}
        </div>
      );
    }

    return (
      <Collapsible
        key={group.id}
        open={isOpen}
        onOpenChange={() => toggleGroup(group.id)}
      >
        <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-sidebar-foreground transition-colors">
          <span>{group.label}</span>
          {isOpen ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 mt-1">
          {group.items.map(renderMenuItem)}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
          collapsed ? "w-14" : "w-56"
        )}
      >
        {/* Header */}
        <div className={cn("p-3 border-b border-sidebar-border", collapsed && "px-2")}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white p-1">
              <img src={braxLogo} alt="Entity Hub" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="font-semibold text-sm text-sidebar-foreground truncate">Entity Hub</h1>
                <p className="text-xs text-muted-foreground truncate">Management Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <div className={cn("p-2", collapsed && "px-1")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCollapsedChange?.(!collapsed)}
                className={cn(
                  "w-full justify-center text-muted-foreground hover:text-sidebar-foreground",
                  collapsed ? "px-2" : "px-3"
                )}
              >
                {collapsed ? (
                  <PanelLeft className="w-4 h-4" />
                ) : (
                  <>
                    <PanelLeftClose className="w-4 h-4 mr-2" />
                    <span className="text-xs">Collapse</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-popover text-popover-foreground border border-border">
                Expand sidebar
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-3">
          {menuGroups.map(renderGroup)}
        </nav>

        {/* User Menu */}
        <div className={cn("p-2 border-t border-sidebar-border", collapsed && "px-1")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-200",
                  collapsed && "justify-center"
                )}
              >
                <GravatarAvatar
                  email={userEmail}
                  name={userEmail.split("@")[0]}
                  size="sm"
                />
                {!collapsed && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs font-medium text-sidebar-foreground truncate">
                        {userEmail.split("@")[0]}
                      </p>
                    </div>
                    <ChevronUp className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={collapsed ? "right" : "top"}
              align={collapsed ? "end" : "start"}
              className="w-56 bg-popover border border-border shadow-lg"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-popover-foreground">Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setProfileOpen(true)}
                className="cursor-pointer text-popover-foreground"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Profile Dialog */}
        <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
