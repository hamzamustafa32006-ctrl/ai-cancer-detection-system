import { useLocation, Link } from "wouter";
import {
  Home,
  Stethoscope,
  BarChart3,
  FlaskConical,
  Cpu,
  FileText,
  Atom,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Overview", url: "/", icon: Home },
  { title: "Diagnosis", url: "/diagnosis", icon: Stethoscope },
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Research", url: "/research", icon: FlaskConical },
  { title: "Technology", url: "/technology", icon: Cpu },
  { title: "Publications", url: "/publications", icon: FileText },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" data-testid="link-logo">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/20">
              <Atom className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                Cellytics
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                AI Cancer Platform
              </span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`link-nav-${item.title.toLowerCase()}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Research Phase
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-chart-4 animate-pulse" />
            <span className="text-xs text-muted-foreground">Active Development</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
