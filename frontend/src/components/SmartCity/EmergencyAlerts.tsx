import { useEffect, useState, useMemo, useRef } from "react";
import { useSmartCity, Alert } from "./SmartCityContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  Car, 
  Hand, 
  Users, 
  Clock,
  MapPin,
  Phone,
  Shield,
  Siren,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
// Leaflet map
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon paths for Leaflet when using Vite
(L.Icon.Default as unknown as { mergeOptions: (opts: Record<string, string>) => void }).mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
});

// Small custom user location icon (blue dot)
const userIcon = L.divIcon({
  html: `<div style="width:14px;height:14px;background:#2563EB;border-radius:50%;box-shadow:0 0 6px rgba(37,99,235,0.7);border:2px solid white"></div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const AlertCard = ({ alert }: { alert: Alert }) => {
  const getIcon = () => {
    switch (alert.type.toLowerCase()) {
      case 'accident': return Car;
      case 'gesture': return Hand;
      case 'suspicious': return Users;
      case 'fire': return AlertTriangle;
      case 'medical': return Shield;
      default: return AlertTriangle;
    }
  };

  const Icon = getIcon();
  const severityColors = {
    critical: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-black',
    low: 'bg-blue-500 text-white'
  };

  const { updateAlert } = useSmartCity();
  const [processing, setProcessing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${severityColors[alert.severity]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold capitalize">{alert.type} Alert</h3>
            <Badge variant={alert.status === 'active' ? 'destructive' : alert.status === 'investigating' ? 'secondary' : 'default'}>
              {alert.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {alert.location}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {alert.timestamp}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {alert.responders} responders
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="text-xs" disabled={processing} onClick={async () => {
              setProcessing(true);
              try {
                // optimistic UI update
                updateAlert(alert.id, { status: 'investigating', responders: (alert.responders || 0) + 1 });

                const res = await fetch('http://localhost:5000/respond', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ alertId: alert.id, action: 'dispatch' })
                });

                const json = await res.json().catch(() => null);
                if (json && json.status === 'ok') {
                  // backend acknowledged; set dispatched state
                  updateAlert(alert.id, { status: 'investigating' });
                } else {
                  // backend failed - revert or mark as active
                  updateAlert(alert.id, { status: 'active' });
                }
              } catch (e) {
                console.error('Failed to send response', e);
                updateAlert(alert.id, { status: 'active' });
              } finally {
                setProcessing(false);
              }
            }}>
              <Phone className="h-3 w-3 mr-1" />
              {processing ? 'Sending...' : 'Send Response'}
            </Button>

            <Button size="sm" variant="outline" className="text-xs" onClick={async () => {
              setProcessing(true);
              try {
                // Request ambulance through backend so dispatch can be tracked
                const res = await fetch('http://localhost:5000/respond', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ alertId: alert.id, action: 'ambulance' })
                });
                const json = await res.json().catch(() => null);

                // Open maps for navigation regardless of backend
                const coords = alert.coordinates;
                if (coords && coords.length === 2) {
                  const [lat, lng] = coords;
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
                  window.open(url, '_blank');
                } else {
                  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alert.location)}`;
                  window.open(url, '_blank');
                }

                if (json && json.status === 'ok') {
                  updateAlert(alert.id, { status: 'investigating' });
                } else {
                  updateAlert(alert.id, { status: 'active' });
                }
              } catch (e) {
                console.error('Failed to request ambulance', e);
                updateAlert(alert.id, { status: 'active' });
              } finally {
                setProcessing(false);
              }
            }}>
              <Activity className="h-3 w-3 mr-1" />
              {processing ? 'Requesting...' : 'Request Ambulance'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CityMap = () => {
  const { alerts } = useSmartCity();
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);

  useEffect(() => {
    let watcherId: number | null = null;
    const success = (pos: GeolocationPosition) => setUserLoc([pos.coords.latitude, pos.coords.longitude]);
    const error = (err: unknown) => {
      console.warn('Geolocation denied or unavailable', err);
      // fallback to IP-based geolocation
      fetch('https://ipapi.co/json/').then(res => res.json()).then((json) => {
        if (json && json.latitude && json.longitude) {
          setUserLoc([parseFloat(json.latitude), parseFloat(json.longitude)]);
        }
      }).catch(() => {
        // ignore
      });
    };

    const requestLocation = () => {
      if (!navigator.geolocation) {
        error(new Error('Geolocation not supported'));
        return;
      }

      // Prefer high accuracy and give a bit more time
      navigator.geolocation.getCurrentPosition(success, error, { timeout: 10000, maximumAge: 0, enableHighAccuracy: true });
      try {
        watcherId = navigator.geolocation.watchPosition(success, () => {/* ignore errors on watch */}, { enableHighAccuracy: true, maximumAge: 0 });
      } catch (e) {
        // ignore
      }
    };
    // Request location directly (avoid Permissions API typing issues)
    requestLocation();

    return () => {
      if (watcherId !== null && navigator.geolocation && typeof navigator.geolocation.clearWatch === 'function') {
        navigator.geolocation.clearWatch(watcherId as number);
      }
    };
  }, []);

  const center = useMemo(() => {
    if (userLoc) return userLoc;
    // fallback center: New York
    return [40.7128, -74.0060] as [number, number];
  }, [userLoc]);

  // Component to move the map when user location changes
  const MoveToLocation = ({ position }: { position: [number, number] | null }) => {
    const map = useMap();
    useEffect(() => {
      if (position) {
        try {
          map.setView(position, 15, { animate: true });
        } catch (e) {
          // ignore
        }
      }
    }, [position, map]);
    return null;
  };

  // React-Leaflet types sometimes mismatch in this workspace; temporarily allow `any` here
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const RLMap = MapContainer as unknown as any;
  const RLTile = TileLayer as unknown as any;
  const RLMarker = Marker as unknown as any;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="h-96 rounded-lg overflow-hidden">
      <div className="relative h-full w-full">
        <RLMap center={center as unknown} zoom={13} style={{ height: '100%', width: '100%' }}>
        <RLTile
          attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
          url={'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        />

        {/* Move the map to the user's location when it becomes available */}
        <MoveToLocation position={userLoc} />

        {userLoc && (
          <RLMarker position={userLoc} icon={userIcon}>
            <Popup>Your location</Popup>
          </RLMarker>
        )}

        {alerts.filter(a => a.coordinates).map(a => (
          <RLMarker key={a.id} position={a.coordinates as [number, number]}>
            <Popup>
              <div className="text-sm">
                <strong className="capitalize">{a.type}</strong>
                <div>{a.location}</div>
                <div className="mt-1">
                  <Button size="sm" variant="ghost" onClick={() => {
                    const [lat, lng] = a.coordinates as [number, number];
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
                    window.open(url, '_blank');
                  }}>Navigate</Button>
                </div>
              </div>
            </Popup>
          </RLMarker>
        ))}
      </RLMap>

        {/* Manual locate button overlay */}
        <div className="absolute top-3 right-3 z-20">
          <button
            className="bg-white p-2 rounded shadow hover:bg-gray-100 text-xs flex items-center gap-2"
            onClick={() => {
              if (!navigator.geolocation) return;
              navigator.geolocation.getCurrentPosition((pos) => {
                setUserLoc([pos.coords.latitude, pos.coords.longitude]);
              }, (err) => {
                console.warn('Manual locate failed', err);
              }, { enableHighAccuracy: true, timeout: 10000 });
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="#111827" strokeWidth="1.5"/>
            </svg>
            <span>Locate Me</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const EmergencyAlerts = () => {
  const { alerts, addAlert } = useSmartCity();
  const alertsRef = useRef(alerts);

  // keep a ref of alerts to avoid re-creating EventSource on every alert update
  useEffect(() => { alertsRef.current = alerts; }, [alerts]);

  // Fetch real-time data from backend (single EventSource)
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5000/events");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.prediction === 'Accident' && data.confidence > 90) {
          const already = alertsRef.current.some(a => a.type === 'accident' && a.status === 'active');
          if (!already) {
            addAlert({
              id: Date.now().toString(),
              type: 'accident',
              severity: 'critical',
              location: `Intersection ${Math.floor(Math.random() * 100)}`,
              coordinates: [40.7128 + (Math.random() - 0.5) * 0.1, -74.0060 + (Math.random() - 0.5) * 0.1],
              description: `Vehicle collision detected with ${data.confidence.toFixed(1)}% confidence.`,
              timestamp: 'Just now',
              status: 'active',
              responders: Math.floor(Math.random() * 3) + 1
            });
          }
        }
      } catch (e) {
        console.warn('Failed to parse SSE event', e);
      }
    };

    eventSource.onerror = () => {
      console.error("EventSource failed in EmergencyAlerts. Is the backend running?");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [addAlert]);

  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Emergency Alert Center</h1>
          <p className="text-muted-foreground">Real-time incident monitoring and emergency response</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Siren className="h-4 w-4 mr-2" />
            Emergency Broadcast
          </Button>
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Contact Control
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">{criticalAlerts}</p>
                <p className="text-xs text-muted-foreground">Critical Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-500">{activeAlerts}</p>
                <p className="text-xs text-muted-foreground">Active Incidents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-500">12</p>
                <p className="text-xs text-muted-foreground">Responders Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">2.3</p>
                <p className="text-xs text-muted-foreground">Avg Response (min)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Alerts Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Live Alert Feed
            </CardTitle>
            <CardDescription>Real-time emergency notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* City Map with Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Incident Map
            </CardTitle>
            <CardDescription>Live incident locations across the city</CardDescription>
          </CardHeader>
          <CardContent>
            <CityMap />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmergencyAlerts;