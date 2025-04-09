import React, { useState } from 'react';
import { Moon, Sun, Laptop, Palette } from 'lucide-react';
import { useTheme, ThemeAppearance, ThemeVariant } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ThemeSelector: React.FC = () => {
  const { appearance, variant, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleAppearanceChange = (value: ThemeAppearance) => {
    setTheme({ appearance: value });
  };
  
  const handleVariantChange = (value: ThemeVariant) => {
    setTheme({ variant: value });
  };
  
  // Function to get the icon based on current appearance
  const getAppearanceIcon = () => {
    switch (appearance) {
      case 'light':
        return <Sun className="h-[1.2rem] w-[1.2rem]" />;
      case 'dark':
        return <Moon className="h-[1.2rem] w-[1.2rem]" />;
      case 'system':
        return <Laptop className="h-[1.2rem] w-[1.2rem]" />;
      default:
        return <Palette className="h-[1.2rem] w-[1.2rem]" />;
    }
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {getAppearanceIcon()}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme Settings</DropdownMenuLabel>
        
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="px-1 py-2 space-y-1">
            <DropdownMenuItem 
              className={`${appearance === 'light' ? 'bg-primary/10' : ''} cursor-pointer`}
              onClick={() => handleAppearanceChange('light')}
            >
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className={`${appearance === 'dark' ? 'bg-primary/10' : ''} cursor-pointer`}
              onClick={() => handleAppearanceChange('dark')}
            >
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className={`${appearance === 'system' ? 'bg-primary/10' : ''} cursor-pointer`}
              onClick={() => handleAppearanceChange('system')}
            >
              <Laptop className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
          </TabsContent>
          
          <TabsContent value="style" className="px-1 py-2 space-y-1">
            <DropdownMenuItem 
              className={`${variant === 'vibrant' ? 'bg-primary/10' : ''} cursor-pointer`}
              onClick={() => handleVariantChange('vibrant')}
            >
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2" />
              <span>Vibrant</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className={`${variant === 'professional' ? 'bg-primary/10' : ''} cursor-pointer`}
              onClick={() => handleVariantChange('professional')}
            >
              <div className="w-4 h-4 rounded-full bg-slate-700 mr-2" />
              <span>Professional</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className={`${variant === 'tint' ? 'bg-primary/10' : ''} cursor-pointer`}
              onClick={() => handleVariantChange('tint')}
            >
              <div className="w-4 h-4 rounded-full bg-indigo-400 mr-2" />
              <span>Tint</span>
            </DropdownMenuItem>
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;