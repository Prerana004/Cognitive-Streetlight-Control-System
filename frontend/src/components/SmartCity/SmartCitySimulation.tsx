import { useCallback } from "react";
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

        {/* Streetlight Health Monitor */}
        <div className="mt-4 bg-card/60 border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Streetlights Health Monitor</h3>
              <div className="text-xs text-muted-foreground">28 streetlights in the simulation</div>
            </div>
            <Badge className="bg-slate-700/60">28</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 28 }).map((_, i) => {
              const idx = i + 1;
              const code = `SL-${String(idx).padStart(3, "0")}`;
              const districts = ["Shopping District", "Downtown", "Industrial", "Residential", "Civic"];
              const district = districts[i % districts.length];
              // Deterministic-ish health values for display
              const health = 88 + (i * 3) % 13; // between ~88-100
              const status = health >= 92 ? "Operational" : health >= 85 ? "Degraded" : "Critical";
              const power = 150 + (i % 3) * 10; // 150,160,170W

              return (
                <div key={code} className="flex items-center justify-between p-3 bg-background/50 rounded border">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium truncate">{code}</div>
                      <div className="text-xs text-muted-foreground">• {district}</div>
                    </div>
                    <div className="text-xs mt-1">
                      <span className={"inline-block px-2 py-0.5 rounded text-[11px] " + (status === 'Operational' ? 'bg-emerald-600/10 text-emerald-400' : status === 'Degraded' ? 'bg-amber-600/10 text-amber-400' : 'bg-red-600/10 text-red-400')}>
                        {status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-4 w-56 md:w-48">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Health</div>
                      <div className="w-full h-2 bg-slate-700 rounded overflow-hidden mt-1">
                        <div style={{ width: `${health}%` }} className="h-full bg-emerald-400" />
                      </div>
                      <div className="text-xs mt-1">{health}%</div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="text-muted-foreground">Power</div>
                      <div className="font-medium">{power}W</div>
                      <div className="text-muted-foreground text-[11px] mt-1">Last Check</div>
                      <div className="text-[12px]">Today</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartCitySimulation;