
import { Home, Target, CreditCard, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/auth/UserMenu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMonthYear, getMonthOptions } from "@/lib/utils";
import { getCurrentMonth, setCurrentMonth } from "@/lib/supabaseStore";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Budget Tracker",
    url: "/budget",
    icon: Target,
  },
  {
    title: "Expenses / Transactions",
    url: "/transactions",
    icon: CreditCard,
  },
  {
    title: "Milestones",
    url: "/milestones",
    icon: Trophy,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonthState] = useState(getCurrentMonth());
  const monthOptions = getMonthOptions();

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
    setCurrentMonthState(month);
    toast({
      title: "Month Changed",
      description: `Viewing budget for ${formatMonthYear(month)}`
    });
  };

  // Show month selector only on budget page
  const showMonthSelector = location.pathname === "/budget";

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <img 
            src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=32&h=32&fit=crop&crop=center" 
            alt="Aussie Budget Logo" 
            className="w-8 h-8 rounded-lg object-cover"
          />
          <div>
            <h2 className="font-semibold text-lg">Aussie Budget</h2>
          </div>
        </div>
        
        {showMonthSelector && (
          <div className="mt-4">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Current Month
            </label>
            <Select value={currentMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>NAVIGATION</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">
              {user?.email ? getInitials(user.email) : 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <UserMenu />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
