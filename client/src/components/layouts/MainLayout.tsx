import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import AuthModal from "../auth-modal";
import { User } from "@/App";

interface MainLayoutProps {
  children: ReactNode;
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
}

const MainLayout = ({ children, user, onLogin, onLogout }: MainLayoutProps) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleAuthModal = () => {
    setIsAuthModalOpen(!isAuthModalOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar 
        isVisible={isMobileSidebarOpen} 
        onToggleMobile={toggleMobileSidebar} 
      />
      
      <div className="flex-1 md:ml-64">
        <TopNav 
          user={user} 
          onToggleSidebar={toggleMobileSidebar} 
          onLoginClick={toggleAuthModal}
          onLogout={onLogout}
        />
        
        <main>
          {children}
        </main>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={toggleAuthModal} 
        onLogin={onLogin}
      />
    </div>
  );
};

export default MainLayout;
