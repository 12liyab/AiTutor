import React from "react";
import { Menu, Bell } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "@/App";

interface TopNavProps {
  user: User | null;
  onToggleSidebar: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
}

const TopNav = ({ user, onToggleSidebar, onLoginClick, onLogout }: TopNavProps) => {
  return (
    <header className="bg-white shadow-md border-b border-gray-100">
      <div className="flex justify-between items-center px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <div className="md:hidden mr-2">
            <button 
              type="button" 
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={onToggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          <h1 className="text-xl md:text-2xl font-bold hidden md:block gradient-heading">
            Ai Tutor
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notifications */}
              <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <Bell className="h-6 w-6" />
              </button>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      <span className="sr-only">Open user menu</span>
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-2 border-b">
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-red-500" onClick={onLogout}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={onLoginClick} className="font-medium">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
