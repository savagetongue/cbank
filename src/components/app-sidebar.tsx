import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Settings, Handshake, Package, Send, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const isActive = (path: string) => location.pathname === path;
  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-1">
          <span className="text-xl font-semibold text-primary">ChronoBank</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/')}>
              <Link to="/"><Handshake /> <span>Browse Offers</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/my-offers')}>
              <Link to="/my-offers"><Package /> <span>My Offers</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/my-requests')}>
              <Link to="/my-requests"><Send /> <span>My Requests</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/profile')}>
              <Link to="/profile"><User /> <span>My Profile</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/settings')}>
              <Link to="/settings"><Settings /> <span>Settings</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {user?.isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/admin')}>
                <Link to="/admin"><Shield /> <span>Admin</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 text-xs text-muted-foreground">
          Built with ❤️ at Cloudflare
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}