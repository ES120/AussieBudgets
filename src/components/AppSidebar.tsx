import { Home, Target, CreditCard, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/auth/UserMenu";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";

const navigationItems = [{
  title: "Dashboard",
  url: "/",
  icon: Home
}, {
  title: "Budget Tracker",
  url: "/budget",
  icon: Target
}, {
  title: "Expenses / Transactions",
  url: "/transactions",
  icon: CreditCard
}, {
  title: "Milestones",
  url: "/milestones",
  icon: Trophy
}];

export function AppSidebar() {
  const location = useLocation();
  const {
    user
  } = useAuth();
  
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar className="bg-white border-r border-gray-200">
      <SidebarHeader className="p-4 bg-white">
        <div className="flex items-center gap-3">
          <img alt="Aussie Budget Logo" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" src="/lovable-uploads/c8dddcff-1465-4d06-805d-62b7e5d8803b.png" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-lg truncate">Aussie Budget</span>
            <span className="text-xs text-muted-foreground truncate">Smart Financial Tracking</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600">NAVIGATION</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="text-gray-700 hover:bg-gray-50 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                  >
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
      
      <SidebarFooter className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 font-medium text-xs">
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
