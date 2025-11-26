import { useCallback, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SmartCitySimulation = () => {
  const navigate = useNavigate();

  const onViewSimulation = useCallback(() => {
    navigate("/simulation");
  }, [navigate]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Smart Street Lighting Simulation</CardTitle>
        <CardDescription>Preview available — open full simulation page</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-black rounded-lg overflow-hidden border">
          <div className="text-center px-4">
            <div className="mb-3 text-sm text-muted-foreground">The embedded 3D preview has been moved to a full-page simulation to improve performance.</div>
            <Button onClick={onViewSimulation} className="!px-6 !py-3">
              View Simulation
            </Button>
          </div>
        </div>
        <div className="mt-4 p-3 bg-muted rounded-lg flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm font-medium mb-2">Notes</div>
            <div className="text-xs text-muted-foreground">Click "View Simulation" to open the full AI Predictive Streetlight demo in a dedicated page.</div>
          </div>
          <div className="flex-shrink-0">
            <Button asChild variant="secondary" className="!px-4 !py-2">
              <a href="/demo-fixed-brightness.html" target="_blank" rel="noreferrer">Demo</a>
            </Button>
          </div>
        </div>

        {/* Streetlight Health Dashboard (4 lamps) */}
        <div className="mt-4 bg-card/60 border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Streetlights Health</h3>
              <div className="text-xs text-muted-foreground">Focused overview for 4 critical lamps (live)</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Systems</div>
                <div className="text-sm font-semibold text-emerald-400">All Systems Functional</div>
              </div>
              <Badge className="bg-slate-700/60">4 Lamps</Badge>
            </div>
          </div>

          <LampDashboard />
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartCitySimulation;

// --- Lamp Dashboard Component (inline) ---
function LampDashboard() {
  type Incident = { ts: string; msg: string };
  type Lamp = {
    id: string;
    code: string;
    district: string;
    health: number; // 0-100
    status: 'Operational' | 'Degraded' | 'Critical';
    online: boolean;
    lastUpdate: number; // timestamp
    brightnessResponse: number; // 0-100
    uptime: number; // percent
    incidents: Incident[];
    latencyMs: number;
  };

  const now = Date.now();
  const initial: Lamp[] = [
    {
      id: '1', code: 'SL-001', district: 'Downtown', health: 98, status: 'Operational', online: true,
      lastUpdate: now - 30 * 1000, brightnessResponse: 99, uptime: 99.9, incidents: [], latencyMs: 120
    },
    {
      id: '2', code: 'SL-002', district: 'Shopping District', health: 91, status: 'Operational', online: true,
      lastUpdate: now - 75 * 1000, brightnessResponse: 96, uptime: 98.7, incidents: [{ ts: new Date(now - 3600*1000).toISOString(), msg: 'Temporary fallback to fixed brightness' }], latencyMs: 180
    },
    {
      id: '3', code: 'SL-003', district: 'Residential', health: 84, status: 'Degraded', online: true,
      lastUpdate: now - 5 * 60 * 1000, brightnessResponse: 70, uptime: 92.1, incidents: [{ ts: new Date(now - 2*3600*1000).toISOString(), msg: 'Lost comms briefly' }], latencyMs: 420
    },
    {
      id: '4', code: 'SL-004', district: 'Industrial', health: 60, status: 'Critical', online: false,
      lastUpdate: now - 60 * 60 * 1000, brightnessResponse: 20, uptime: 78.4, incidents: [{ ts: new Date(now - 86400*1000).toISOString(), msg: 'Power-cycle detected, unreachable' }], latencyMs: 0
    }
  ];

  const [lamps, setLamps] = useState<Lamp[]>(initial);
  const [selected, setSelected] = useState<string | null>(lamps[0].id);

  // simulate small live updates for health/lastUpdate/latency
  useEffect(() => {
    const t = setInterval(() => {
      setLamps(prev => prev.map(l => {
        // small jitter for online lamps
        if (!l.online) return l;
        const jitter = (Math.random() - 0.5) * 2; // -1..1
        const nh = Math.max(50, Math.min(100, Math.round(l.health + jitter)));
        return { ...l, health: nh, lastUpdate: Date.now(), latencyMs: Math.max(50, Math.round(100 + (Math.random() * 200))) };
      }));
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const aggregated = useMemo(() => {
    const total = lamps.length;
    const online = lamps.filter(l => l.online).length;
    const issues = lamps.filter(l => l.status !== 'Operational' || !l.online).length;
    const avgHealth = Math.round(lamps.reduce((s, x) => s + x.health, 0) / total);
    return { total, online, issues, avgHealth };
  }, [lamps]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-background/50 rounded border">
          <div className="text-xs text-muted-foreground">Lamps Active</div>
          <div className="text-2xl font-bold">{aggregated.online}/{aggregated.total}</div>
        </div>
        <div className="p-3 bg-background/50 rounded border">
          <div className="text-xs text-muted-foreground">Avg Health</div>
          <div className="text-2xl font-bold">{aggregated.avgHealth}%</div>
        </div>
        <div className="p-3 bg-background/50 rounded border">
          <div className="text-xs text-muted-foreground">Lamps with Issues</div>
          <div className="text-2xl font-bold text-amber-400">{aggregated.issues}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lamps.map(l => (
              <div key={l.id} className="p-3 bg-background/50 rounded border flex items-start gap-3">
                <div className="w-12">
                  <div className={`w-3 h-3 rounded-full mt-1 ${!l.online ? 'bg-red-500' : l.status === 'Operational' ? 'bg-emerald-400' : l.status === 'Degraded' ? 'bg-amber-400' : 'bg-red-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{l.code} <span className="text-xs text-muted-foreground">• {l.district}</span></div>
                      <div className="text-xs text-muted-foreground">Last: {new Date(l.lastUpdate).toLocaleTimeString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{l.health}%</div>
                      <div className="text-xs text-muted-foreground">Uptime {l.uptime}%</div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground">Brightness Response</div>
                    <div className="w-full h-2 bg-slate-700 rounded overflow-hidden mt-1">
                      <div style={{ width: `${l.brightnessResponse}%` }} className={`h-full ${l.brightnessResponse > 85 ? 'bg-emerald-400' : l.brightnessResponse > 60 ? 'bg-amber-400' : 'bg-red-400'}`} />
                    </div>
                    <div className="text-xs mt-1">Latency: {l.latencyMs}ms • Incidents: {l.incidents.length}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="p-3 bg-background/50 rounded border mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Incident / Alert Log</div>
                <div className="text-xs text-muted-foreground">Recent events across the 4 lamps</div>
              </div>
              <div className="text-xs text-muted-foreground">{lamps.reduce((s, x) => s + x.incidents.length, 0)} events</div>
            </div>
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {lamps.flatMap(l => l.incidents.map(it => ({ lamp: l.code, ...it }))).sort((a,b)=> b.ts.localeCompare(a.ts)).map((e, idx) => (
                <div key={idx} className="text-xs bg-muted/10 p-2 rounded">
                  <div className="flex items-center justify-between">
                    <div><strong className="text-[13px]">{e.lamp}</strong> <span className="text-muted-foreground">• {new Date(e.ts).toLocaleString()}</span></div>
                    <div className="text-xs text-red-400">!</div>
                  </div>
                  <div className="text-[13px] mt-1">{e.msg}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-background/50 rounded border">
            <div className="text-sm font-medium">System Diagnostics</div>
            <div className="text-xs text-muted-foreground mt-2">MTBF: ~{Math.round(1000/Math.max(1, lamps.reduce((s,x)=> s + (x.incidents.length), 0) ))}h (est)</div>
            <div className="text-xs text-muted-foreground">Avg Command Latency: {Math.round(lamps.reduce((s,x)=> s + x.latencyMs, 0) / lamps.length)}ms</div>
            <div className="text-xs text-muted-foreground">Uptime avg: {Math.round(lamps.reduce((s,x)=> s + x.uptime, 0) / lamps.length)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}