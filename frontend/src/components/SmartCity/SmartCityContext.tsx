import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

interface Streetlight {
  id: string;
  brightness: number;
  status: string;
}

export interface Alert {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  coordinates?: [number, number];
  description?: string;
  timestamp: string;
  status?: 'active' | 'resolved' | 'investigating';
  responders?: number;
}

interface SmartCityState {
  streetlights: Streetlight[];
  alerts: Alert[];
  energySavings: number;
  monitoredZones: number;
  activeIncidents: number;
  metrics: {
    active_power: number;
    baseline_100: number;
    baseline_70: number;
    savings_vs_100: number;
    savings_vs_70: number;
    brightness_dist: number[];
    occupancy: number;
    pedestrians: number;
    vehicles: number;
    sim_time: number;
  };
}

interface SmartCityContextType extends SmartCityState {
  setStreetlights: (lights: Streetlight[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (alertId: string, updates: Partial<Alert>) => void;
  setEnergySavings: (savings: number) => void;
  setMonitoredZones: (zones: number) => void;
  setMetrics: (metrics: SmartCityState['metrics']) => void;
}

const SmartCityContext = createContext<SmartCityContextType | undefined>(undefined);

export const SmartCityProvider = ({ children }: { children: ReactNode }) => {
  const [streetlights, setStreetlights] = useState<Streetlight[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [energySavings, setEnergySavings] = useState(73);
  const [monitoredZones, setMonitoredZones] = useState(23);
  const [metrics, setMetrics] = useState<SmartCityState['metrics']>({
    active_power: 0,
    baseline_100: 0,
    baseline_70: 0,
    savings_vs_100: 0,
    savings_vs_70: 0,
    brightness_dist: [],
    occupancy: 0,
    pedestrians: 0,
    vehicles: 0,
    sim_time: 0
  });

  const addAlert = useCallback((newAlert: Alert) => {
    setAlerts(prev => [newAlert, ...prev].slice(0, 20));
  }, []);

  const updateAlert = useCallback((alertId: string, updates: Partial<Alert>) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, ...updates } : alert
      )
    );
  }, []);

  const activeIncidents = useMemo(() =>
    alerts.filter(a => a.status === 'active' || a.status === 'investigating').length
    , [alerts]);

  const value = {
    streetlights,
    alerts,
    energySavings,
    monitoredZones,
    activeIncidents,
    metrics,
    setStreetlights: useCallback((lights: Streetlight[]) => setStreetlights(lights), []),
    addAlert,
    updateAlert,
    setEnergySavings: useCallback((savings: number) => setEnergySavings(savings), []),
    setMonitoredZones: useCallback((zones: number) => setMonitoredZones(zones), []),
    setMetrics: useCallback((metrics: SmartCityState['metrics']) => setMetrics(metrics), []),
  };

  return (
    <SmartCityContext.Provider value={value}>
      {children}
    </SmartCityContext.Provider>
  );
};

export const useSmartCity = () => {
  const context = useContext(SmartCityContext);
  if (context === undefined) {
    throw new Error('useSmartCity must be used within a SmartCityProvider');
  }
  return context;
};