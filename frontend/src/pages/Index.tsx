import Dashboard from "@/components/SmartCity/Dashboard";
import SmartCitySimulation from "@/components/SmartCity/SmartCitySimulation";  
import EmergencyAlerts from "@/components/SmartCity/EmergencyAlerts";
import CCTVStreams from "@/components/SmartCity/CCTVStreams";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, BarChart3, Globe, AlertTriangle, Video, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen space-y-8 p-6 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Welcome Header */}
      <div className="relative glass-card p-8 animate-slide-up overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center glow-primary animate-glow">
                <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-display font-extrabold text-gradient-primary tracking-tight leading-none mb-2">
                  LumenAI Control Center
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-1 w-20 gradient-primary rounded-full"></div>
                  <p className="text-muted-foreground text-lg font-medium">Smart city lighting management and monitoring system</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/demo')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
            <Badge className="bg-green-600/10 text-green-700 border-green-600/20 px-4 py-2 text-sm animate-pulse">
              ● All Systems Operational
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6 relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <TabsList className="grid w-full grid-cols-5 glass-card p-2 h-auto">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="simulation" 
            className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300"
          >
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Live Simulation</span>
          </TabsTrigger>
          <TabsTrigger 
            value="alerts" 
            className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300"
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Emergency Alerts</span>
          </TabsTrigger>
          <TabsTrigger 
            value="cctv" 
            className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300"
          >
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">CCTV Streams</span>
          </TabsTrigger>
          <TabsTrigger 
            value="citymap" 
            className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">City Map</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Dashboard />
        </TabsContent>

        {/* Live Simulation Tab */}
        <TabsContent value="simulation" className="space-y-6">
          <SmartCitySimulation />
        </TabsContent>

        {/* Emergency Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <EmergencyAlerts />
        </TabsContent>

        {/* CCTV Streams Tab */}
        <TabsContent value="cctv" className="space-y-6">
          <CCTVStreams />
        </TabsContent>

        {/* City Map Tab */}
        <TabsContent value="citymap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Smart City Infrastructure Map</CardTitle>
              <CardDescription>Real-time view of all connected street lights and emergency incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] bg-slate-100 rounded-lg border relative overflow-hidden shadow-lg">
                {/* Realistic City Map */}
                <div className="absolute inset-0">
                  <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      {/* Park gradient */}
                      <radialGradient id="parkGradient">
                        <stop offset="0%" stopColor="#86efac" stopOpacity="0.6"/>
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0.4"/>
                      </radialGradient>
                      {/* Water gradient */}
                      <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.5"/>
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6"/>
                      </linearGradient>
                      {/* Light glow */}
                      <radialGradient id="lightGlow">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6"/>
                        <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
                      </radialGradient>
                    </defs>
                    
                    {/* River */}
                    <path d="M 0 200 Q 200 180 400 200 Q 600 220 800 200 L 800 280 Q 600 300 400 280 Q 200 260 0 280 Z" 
                          fill="url(#waterGradient)" stroke="#0ea5e9" strokeWidth="2"/>
                    
                    {/* Parks */}
                    <rect x="50" y="50" width="120" height="100" rx="8" fill="url(#parkGradient)" stroke="#22c55e" strokeWidth="2"/>
                    <rect x="630" y="380" width="140" height="120" rx="8" fill="url(#parkGradient)" stroke="#22c55e" strokeWidth="2"/>
                    
                    {/* Major Roads - Light gray with lane markings */}
                    <rect x="0" y="165" width="800" height="30" fill="#e2e8f0"/>
                    <line x1="0" y1="180" x2="800" y2="180" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="20,15"/>
                    
                    <rect x="385" y="0" width="30" height="600" fill="#e2e8f0"/>
                    <line x1="400" y1="0" x2="400" y2="600" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="20,15"/>
                    
                    {/* Secondary Roads */}
                    {[100, 240, 320, 450, 540].map((y, i) => (
                      <rect key={`h-road-${i}`} x="0" y={y} width="800" height="15" fill="#f1f5f9"/>
                    ))}
                    {[120, 220, 280, 520, 640, 720].map((x, i) => (
                      <rect key={`v-road-${i}`} x={x} y="0" width="15" height="600" fill="#f1f5f9"/>
                    ))}
                    
                    {/* Commercial District - Tall Buildings (Left side) */}
                    <rect x="60" y="220" width="50" height="90" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
                    <rect x="130" y="230" width="45" height="80" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
                    <rect x="190" y="210" width="60" height="100" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
                    <rect x="260" y="225" width="50" height="85" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
                    <rect x="320" y="215" width="55" height="95" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
                    
                    {/* Residential District - Small Buildings (Right side, top) */}
                    <rect x="430" y="30" width="40" height="55" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
                    <rect x="480" y="35" width="35" height="50" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
                    <rect x="530" y="40" width="38" height="48" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
                    <rect x="580" y="32" width="42" height="58" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
                    <rect x="640" y="38" width="36" height="52" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
                    <rect x="430" y="110" width="38" height="45" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
                    <rect x="480" y="115" width="40" height="42" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
                    <rect x="535" y="108" width="35" height="48" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
                    
                    {/* Industrial District - Large Buildings (Bottom) */}
                    <rect x="50" y="340" width="80" height="50" fill="#c4b5fd" stroke="#a78bfa" strokeWidth="1"/>
                    <rect x="145" y="350" width="70" height="45" fill="#c4b5fd" stroke="#a78bfa" strokeWidth="1"/>
                    <rect x="230" y="345" width="75" height="48" fill="#c4b5fd" stroke="#a78bfa" strokeWidth="1"/>
                    <rect x="50" y="465" width="65" height="60" fill="#c4b5fd" stroke="#a78bfa" strokeWidth="1"/>
                    <rect x="130" y="470" width="70" height="55" fill="#c4b5fd" stroke="#a78bfa" strokeWidth="1"/>
                    <rect x="215" y="460" width="85" height="65" fill="#c4b5fd" stroke="#a78bfa" strokeWidth="1"/>
                    
                    {/* Mixed Use Buildings (Right bottom) */}
                    <rect x="435" y="330" width="55" height="65" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
                    <rect x="505" y="340" width="48" height="55" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
                    <rect x="565" y="335" width="52" height="60" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"/>
                    <rect x="440" y="460" width="60" height="70" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
                    <rect x="515" y="470" width="55" height="60" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
                    
                    {/* Street Lights - More realistic positioning */}
                    {[
                      // Along main horizontal road
                      [80, 165], [120, 165], [180, 165], [240, 165], [300, 165], [360, 165],
                      [440, 165], [500, 165], [560, 165], [620, 165], [680, 165], [740, 165],
                      [80, 195], [120, 195], [180, 195], [240, 195], [300, 195], [360, 195],
                      [440, 195], [500, 195], [560, 195], [620, 195], [680, 195], [740, 195],
                      // Along main vertical road
                      [385, 50], [385, 110], [385, 140], [385, 220], [385, 270], [385, 330],
                      [385, 390], [385, 450], [385, 510], [385, 560],
                      [415, 50], [415, 110], [415, 140], [415, 220], [415, 270], [415, 330],
                      [415, 390], [415, 450], [415, 510], [415, 560],
                      // Intersections with secondary roads
                      [100, 100], [220, 100], [520, 100], [640, 100], [720, 100],
                      [100, 240], [220, 240], [520, 240], [640, 240], [720, 240],
                      [100, 320], [220, 320], [520, 320], [640, 320], [720, 320],
                      [100, 450], [220, 450], [520, 450], [640, 450], [720, 450],
                      [100, 540], [220, 540], [520, 540], [640, 540], [720, 540],
                    ].map(([x, y], i) => (
                      <g key={`light-${i}`}>
                        <circle cx={x} cy={y} r="12" fill="url(#lightGlow)" className="animate-pulse"/>
                        <circle cx={x} cy={y} r="4" fill="#0891b2" className="animate-pulse"/>
                        <line x1={x} y1={y+4} x2={x} y2={y+12} stroke="#94a3b8" strokeWidth="1.5"/>
                      </g>
                    ))}
                    
                    {/* Emergency Incidents with pulsing effects */}
                    <g className="animate-pulse">
                      <circle cx="280" cy="280" r="20" fill="#ef4444" fillOpacity="0.2"/>
                      <circle cx="280" cy="280" r="12" fill="#ef4444" fillOpacity="0.4"/>
                      <circle cx="280" cy="280" r="6" fill="#ef4444"/>
                    </g>
                    <g className="animate-pulse" style={{animationDelay: '0.5s'}}>
                      <circle cx="550" cy="420" r="16" fill="#f59e0b" fillOpacity="0.2"/>
                      <circle cx="550" cy="420" r="10" fill="#f59e0b" fillOpacity="0.4"/>
                      <circle cx="550" cy="420" r="5" fill="#f59e0b"/>
                    </g>
                    
                    {/* District Labels */}
                    <text x="150" y="280" fill="#1e293b" fontSize="12" fontWeight="bold">DOWNTOWN</text>
                    <text x="520" y="80" fill="#334155" fontSize="10">Residential</text>
                    <text x="140" y="420" fill="#334155" fontSize="10">Industrial</text>
                    <text x="680" y="450" fill="#334155" fontSize="10" textAnchor="middle">Central Park</text>
                  </svg>
                </div>
                
                {/* Map Legend */}
                <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-border">
                  <div className="text-sm font-semibold mb-3 text-primary">Map Legend</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
                      <span>Street Lights ({Math.floor(Math.random() * 100 + 900)})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                      <span>Critical Alert</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"></div>
                      <span>Warning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded"></div>
                      <span>Parks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-600 rounded"></div>
                      <span>Water Bodies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-slate-700 rounded"></div>
                      <span>Buildings</span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Status Panel */}
                <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-border">
                  <div className="text-sm font-semibold mb-3 text-primary">Live Status</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between gap-6">
                      <span className="text-muted-foreground">Total Lights:</span>
                      <span className="text-cyan-400 font-bold">1,247</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-muted-foreground">Active Now:</span>
                      <span className="text-green-400 font-bold">1,198</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-muted-foreground">Districts:</span>
                      <span className="text-blue-400 font-bold">4</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-muted-foreground">Incidents:</span>
                      <span className="text-red-400 font-bold animate-pulse">2 Active</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-muted-foreground">Energy Use:</span>
                      <span className="text-yellow-400 font-bold">87%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
