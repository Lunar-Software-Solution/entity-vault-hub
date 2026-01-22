import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import EntityFilter from "@/components/layout/EntityFilter";
import GlobalSearch from "@/components/layout/GlobalSearch";
import DashboardSection from "@/components/dashboard/DashboardSection";
import EntitySection from "@/components/sections/EntitySection";
import BankAccountsSection from "@/components/sections/BankAccountsSection";
import CreditCardsSection from "@/components/sections/CreditCardsSection";
import SocialMediaSection from "@/components/sections/SocialMediaSection";
import AddressesSection from "@/components/sections/AddressesSection";
import ContractsSection from "@/components/sections/ContractsSection";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Sections that support entity filtering
  const filterableSections = ["bank-accounts", "credit-cards", "addresses", "contracts"];
  const showFilter = filterableSections.includes(activeSection);

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection onNavigate={setActiveSection} />;
      case "entity":
        return <EntitySection />;
      case "bank-accounts":
        return <BankAccountsSection entityFilter={selectedEntityId} />;
      case "credit-cards":
        return <CreditCardsSection entityFilter={selectedEntityId} />;
      case "social-media":
        return <SocialMediaSection />;
      case "addresses":
        return <AddressesSection entityFilter={selectedEntityId} />;
      case "contracts":
        return <ContractsSection entityFilter={selectedEntityId} />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {/* Top bar with search and optional filter */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
            <GlobalSearch onNavigate={setActiveSection} />
            {showFilter && (
              <div className="ml-auto">
                <EntityFilter 
                  selectedEntityId={selectedEntityId} 
                  onEntityChange={setSelectedEntityId} 
                />
              </div>
            )}
          </div>
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Index;