import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  Settings
} from "lucide-react";

interface SidebarProps {
  isVisible: boolean;
  onToggleMobile: () => void;
}

const Sidebar = ({ isVisible, onToggleMobile }: SidebarProps) => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const linkClasses = (path: string) => {
    return `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive(path)
        ? "bg-primary/10 text-primary font-semibold"
        : "text-gray-600 hover:bg-gray-50 hover:text-primary"
    }`;
  };

  return (
    <div className={`bg-white shadow-md md:w-64 md:fixed md:h-screen z-10 ${
      isVisible ? "block" : "hidden md:block"
    }`}>
      {/* Logo */}
      <div className="flex items-center justify-center md:justify-start py-5 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
        <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M4.75 14L12 18.25L19.25 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
        <div className="ml-3">
          <span className="text-2xl font-bold text-white">Ai</span>
          <span className="text-2xl font-semibold text-white"> Tutor</span>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="py-6 px-4">
        <div className="space-y-2">
          <Link href="/" onClick={onToggleMobile}>
            <div className={linkClasses("/")}>
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </div>
          </Link>
          <Link href="/documents" onClick={onToggleMobile}>
            <div className={linkClasses("/documents")}>
              <FileText className="mr-3 h-5 w-5" />
              My Documents
            </div>
          </Link>
          <Link href="/questions" onClick={onToggleMobile}>
            <div className={linkClasses("/questions")}>
              <ClipboardList className="mr-3 h-5 w-5" />
              Generated Questions
            </div>
          </Link>
          <Link href="/settings" onClick={onToggleMobile}>
            <div className={linkClasses("/settings")}>
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
