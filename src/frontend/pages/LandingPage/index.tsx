import { useSelector } from "react-redux";
import { useEffect } from "react";
import { HeroSection } from "./components/HeroSection";
import { SystemOverview } from "./components/SystemOverview";
import { JobMatchingFlow } from "./components/JobMatchingFlow";
import { EmailNotifications } from "./components/EmailNotifications";
import { SmartCalendar } from "./components/SmartCalendar";
import { CryptoEscrow } from "./components/CryptoEscrow";
import { AgreementProofs } from "./components/AgreementProofs";
import { ProjectManagement } from "./components/ProjectManagement";
import { SocialMedia } from "./components/SocialMedia";
import { Footer } from "./components/Footer";
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
    console.log("Landing page theme updated:", isDarkMode ? "dark" : "light");
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
