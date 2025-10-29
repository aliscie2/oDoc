import { useEffect } from "react";
import { useSelector } from "react-redux";
import { AgreementProofs } from "./components/AgreementProofs";
import { CryptoEscrow } from "./components/CryptoEscrow";
import { EmailNotifications } from "./components/EmailNotifications";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { JobMatchingFlow } from "./components/JobMatchingFlow";
import { ProjectManagement } from "./components/ProjectManagement";
import { SmartCalendar } from "./components/SmartCalendar";
import { SocialMedia } from "./components/SocialMedia";
import { SystemOverview } from "./components/SystemOverview";
import "./styles/globals.css";

export default function App() {
  const { isDarkMode } = useSelector((state: any) => state.uiState);

  useEffect(() => {
    // Sync the dark class with Redux state
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-bg-primary)",
        transition: "background-color 0.3s",
      }}
    >
      <HeroSection />
      <SystemOverview />
      <JobMatchingFlow />
      <EmailNotifications />
      <SmartCalendar />
      <CryptoEscrow />
      <AgreementProofs />
      <ProjectManagement />
      <SocialMedia />
      <Footer />
    </div>
  );
}
