import { useSmartCity } from "./SmartCityContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Play,
} from "lucide-react";

export function SmartCitySidebar() {
  const navigate = useNavigate();
  const { 
    streetlights, 
    monitoredZones, 
    energySavings, 
    activeIncidents,
    alerts
  } = useSmartCity();

  const latestAlert = alerts.length > 0 ? alerts[0] : null;

  return (
    <Sidebar className="w-64">
      <SidebarContent className="bg-card border-r border-border">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-primary flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-background" />
            </div>
            <div>
              <h2 className="font-bold text-lg">LumenAI</h2>
              <p className="text-xs text-muted-foreground">Smart City Control</p>
            </div>
          </div>
        </div>

        {/* Demo Button */}
        <div className="p-3 border-b border-border">
          <Button
            onClick={() => navigate('/demo')}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            size="sm"
          >
            <Play className="mr-2 h-4 w-4" />
            Watch Demo
          </Button>
        </div>

        {/* System Status */}
        <SidebarGroup>
          <SidebarGroupLabel>System Status</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">All Systems Online</span>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Lights:</span>
                  <span className="font-medium text-cyan-400">{streetlights.length > 0 ? streetlights.length.toLocaleString() : '1,247'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monitored Zones:</span>
                  <span className="font-medium text-green-400">{monitoredZones}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Energy Savings:</span>
                  <span className="font-medium text-primary">{Math.round(energySavings)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Incidents:</span>
                  <span className="font-medium text-red-400">{activeIncidents}</span>
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Info */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Info</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2 space-y-2 text-xs">
              {latestAlert ? (
                <div className="p-2 bg-muted rounded-md">
                  <div className="font-medium text-amber-500">Recent Alert</div>
                  <div className="text-muted-foreground truncate">{latestAlert.type} - {latestAlert.location}</div>
                </div>
              ) : (
              <div className="p-2 bg-muted rounded-md">
                <div className="font-medium text-primary">System Status</div>
                <div className="text-muted-foreground">Nominal</div>
              </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}