import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import DashboardSection from "@/components/dashboard/DashboardSection";
import EntitySection from "@/components/sections/EntitySection";
import BankAccountsSection from "@/components/sections/BankAccountsSection";
import CreditCardsSection from "@/components/sections/CreditCardsSection";
import SocialMediaSection from "@/components/sections/SocialMediaSection";
import AddressesSection from "@/components/sections/AddressesSection";
import ContractsSection from "@/components/sections/ContractsSection";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection />;
      case "entity":
        return <EntitySection />;
      case "bank-accounts":
        return <BankAccountsSection />;
      case "credit-cards":
        return <CreditCardsSection />;
      case "social-media":
        return <SocialMediaSection />;
      case "addresses":
        return <AddressesSection />;
      case "contracts":
        return <ContractsSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Index;
