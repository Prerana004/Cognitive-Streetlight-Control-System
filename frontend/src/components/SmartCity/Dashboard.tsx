import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Lightbulb,
  Zap,
  AlertTriangle,
  TrendingUp,
  Shield,
  Activity,
  Brain,
  Video,
  Wifi,
  Clock,
  Users2
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useSmartCity } from "./SmartCityContext";
import { Line, Bar, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatusCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: number;
  color?: "primary" | "secondary" | "accent";
}

const StatusCard = ({ title, value, subtitle, icon: Icon, trend, color = "primary" }: StatusCardProps) => {
  const colorMap = {
    primary: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    secondary: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    accent: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30"
  };

  const iconColorMap = {
    primary: "text-blue-600",
    secondary: "text-purple-600",
    accent: "text-cyan-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="glass-card group overflow-hidden relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color as keyof typeof colorMap]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">{value}</p>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <motion.div
              className={`p-4 rounded-2xl bg-gradient-to-br ${colorMap[color as keyof typeof colorMap]} backdrop-blur-sm border`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Icon className={`h-7 w-7 ${iconColorMap[color as keyof typeof iconColorMap]}`} />
            </motion.div>
          </div>
          {trend && (
            <div className="mt-4 flex items-center text-sm">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              </motion.div>
              <span className="text-green-500 font-semibold">{trend}%</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface AlertItemProps {
  type: string;
  location: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low' | 'critical';
}

const AlertItem = ({ type, location, timestamp, severity }: AlertItemProps) => (
  <div className="flex items-center gap-3 p-3 border rounded-lg">
    <AlertTriangle className={`h-4 w-4 ${severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
    <div className="flex-1">
      <p className="text-sm font-medium">{type}</p>
      <p className="text-xs text-muted-foreground">{location}</p>
    </div>
    <Badge variant={severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
      {new Date(timestamp).toLocaleTimeString()}
    </Badge>
  </div>
);

const Dashboard = () => {
  const {
    streetlights,
    alerts,
    energySavings,
    monitoredZones,
    metrics,
    setStreetlights,
    addAlert,
    setEnergySavings,
    setMonitoredZones,
    setMetrics
  } = useSmartCity();

  // History state for charts
  const [powerHistory, setPowerHistory] = useState<{ time: string, active: number, base100: number, base70: number }[]>([]);
  const [savingsHistory, setSavingsHistory] = useState<{ time: string, sav100: number, sav70: number }[]>([]);
  const [occupancyHistory, setOccupancyHistory] = useState<{ x: number, y: number }[]>([]); // x: avg brightness, y: occupancy

  const [aiLatency, setAiLatency] = useState(47);
  const [activeFeeds, setActiveFeeds] = useState(24);
  const activeLights = streetlights.length > 0 ? streetlights.length : 1247;

  // Fetch real-time data from backend
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5000/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.streetlights) {
        setStreetlights(data.streetlights);
      }

      if (data.metrics) {
        setMetrics(data.metrics);
        setEnergySavings(data.metrics.savings_vs_100);

        const timeStr = new Date().toLocaleTimeString();

        setPowerHistory(prev => [...prev, {
          time: timeStr,
          active: data.metrics.active_power,
          base100: data.metrics.baseline_100,
          base70: data.metrics.baseline_70
        }].slice(-20)); // Keep last 20 points

        setSavingsHistory(prev => [...prev, {
          time: timeStr,
          sav100: data.metrics.savings_vs_100,
          sav70: data.metrics.savings_vs_70
        }].slice(-20));

        // For scatter plot, we need avg brightness
        const avgBrightness = data.metrics.brightness_dist.length > 0
          ? data.metrics.brightness_dist.reduce((a: number, b: number) => a + b, 0) / data.metrics.brightness_dist.length
          : 0;

        setOccupancyHistory(prev => [...prev, {
          x: avgBrightness,
          y: data.metrics.occupancy
        }].slice(-50)); // Keep last 50 points
      }

      if (data.prediction === 'Accident' && data.confidence > 90 && !alerts.some(a => a.type === 'Accident Detected')) {
        addAlert({
          id: Date.now().toString(),
          type: 'Accident Detected',
          location: `Intersection ${Math.floor(Math.random() * 100)}`,
          timestamp: new Date().toISOString(),
          severity: 'high',
          status: 'active',
        });
      }

      setAiLatency(30 + Math.random() * 30);
    };

    eventSource.onerror = () => {
      console.error("EventSource failed. Is the backend running?");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [setStreetlights, setEnergySavings, addAlert, alerts, setMetrics]);

  // --- Chart Data Preparation ---

  const activeVsBaselineData = {
    labels: powerHistory.map(d => d.time),
    datasets: [
      {
        label: 'Active Power (W)',
        data: powerHistory.map(d => d.active),
        borderColor: 'rgb(34, 197, 94)', // Green
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Baseline (100%)',
        data: powerHistory.map(d => d.base100),
        borderColor: 'rgb(239, 68, 68)', // Red
        borderDash: [5, 5],
        tension: 0.4,
      },
      {
        label: 'Baseline (70%)',
        data: powerHistory.map(d => d.base70),
        borderColor: 'rgb(234, 179, 8)', // Yellow
        borderDash: [5, 5],
        tension: 0.4,
      }
    ]
  };

  const savingsData = {
    labels: savingsHistory.map(d => d.time),
    datasets: [
      {
        label: 'Savings vs 100%',
        data: savingsHistory.map(d => d.sav100),
        borderColor: 'rgb(59, 130, 246)', // Blue
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Savings vs 70%',
        data: savingsHistory.map(d => d.sav70),
        borderColor: 'rgb(168, 85, 247)', // Purple
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  // Histogram for brightness distribution
  // We need to bin the brightness values
  const brightnessBins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const brightnessCounts = new Array(brightnessBins.length - 1).fill(0);
  metrics.brightness_dist.forEach(b => {
    const binIndex = Math.min(Math.floor(b / 10), 9);
    brightnessCounts[binIndex]++;
  });

  const brightnessDistData = {
    labels: brightnessBins.slice(0, -1).map(b => `${b}-${b + 10}%`),
    datasets: [{
      label: 'Lamp Count',
      data: brightnessCounts,
      backgroundColor: 'rgba(6, 182, 212, 0.6)', // Cyan
      borderColor: 'rgb(6, 182, 212)',
      borderWidth: 1
    }]
  };

  const occupancyVsBrightnessData = {
    datasets: [{
      label: 'Occupancy vs Brightness',
      data: occupancyHistory,
      backgroundColor: 'rgba(249, 115, 22, 0.6)', // Orange
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94a3b8' }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Smart City Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring and control center</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Active Street Lights"
          value={activeLights.toLocaleString()}
          subtitle="Across all zones"
          icon={Lightbulb}
          trend={2.1}
          color="primary"
        />
        <StatusCard
          title="Energy Savings"
          value={`${Math.round(energySavings)}%`}
          subtitle="vs traditional lighting"
          icon={Zap}
          trend={5}
          color="secondary"
        />
        <StatusCard
          title="Active Power"
          value={`${metrics.active_power} W`}
          subtitle="Real-time usage"
          icon={Activity}
          color="accent"
        />
        <StatusCard
          title="Occupancy"
          value={`${metrics.occupancy}`}
          subtitle="Tracked objects"
          icon={Users2}
          color="primary"
        />
      </div>

      {/* AI System Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden border-0 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(59, 130, 246, 0.3)",
                      "0 0 40px rgba(59, 130, 246, 0.5)",
                      "0 0 20px rgba(59, 130, 246, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Brain className="h-7 w-7 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">AI Analysis System</h3>
                  <p className="text-sm text-muted-foreground font-medium">Real-time video processing and pedestrian detection</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                      <Video className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">{activeFeeds}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Active Feeds</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-green-500/10">
                      <Clock className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-3xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">{aiLatency.toFixed(0)}ms</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Avg Latency</div>
                </div>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active vs Baseline Power */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Active vs Baseline Power
            </CardTitle>
            <CardDescription>Real-time power consumption comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: '250px' }}>
              <Line data={activeVsBaselineData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Percent Energy Savings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Energy Savings (%)
            </CardTitle>
            <CardDescription>Savings relative to 100% and 70% baselines</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: '250px' }}>
              <Line data={savingsData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lamp Brightness Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Lamp Brightness Distribution
            </CardTitle>
            <CardDescription>Current brightness levels across all lamps</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: '250px' }}>
              <Bar data={brightnessDistData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Occupancy vs Brightness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-5 w-5" />
              Occupancy vs Brightness
            </CardTitle>
            <CardDescription>System responsiveness to street activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: '250px' }}>
              <Scatter
                data={occupancyVsBrightnessData}
                options={{
                  ...chartOptions,
                  scales: {
                    x: {
                      title: { display: true, text: 'Avg Brightness (%)', color: '#94a3b8' },
                      grid: { color: 'rgba(255, 255, 255, 0.05)' },
                      ticks: { color: '#94a3b8' }
                    },
                    y: {
                      title: { display: true, text: 'Occupancy Count', color: '#94a3b8' },
                      grid: { color: 'rgba(255, 255, 255, 0.05)' },
                      ticks: { color: '#94a3b8' }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Live Zone Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Zone Activity Monitor
            </CardTitle>
            <CardDescription>Real-time brightness levels across city zones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(streetlights.length > 0 ? streetlights.slice(0, 5) : [
                { zone: "Downtown Core", brightness: 95, activity: "High", color: "bg-primary" },
                { zone: "Residential North", brightness: 60, activity: "Medium", color: "bg-secondary" },
                { zone: "Industrial South", brightness: 40, activity: "Low", color: "bg-accent" },
                { zone: "Park District", brightness: 75, activity: "Medium", color: "bg-primary" },
                { zone: "Shopping Center", brightness: 85, activity: "High", color: "bg-secondary" },
              ]).map((light, index) => (
                <motion.div
                  key={light.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-24 text-sm font-medium">{light.id || light.zone}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Brightness</span>
                      <span className="text-xs font-medium">{light.brightness}%</span>
                    </div>
                    <Progress value={light.brightness} className="h-2" />
                  </div>
                  <Badge variant={light.brightness > 80 ? 'default' : light.brightness > 50 ? 'secondary' : 'outline'}>
                    {light.brightness > 80 ? "High" : light.brightness > 50 ? "Medium" : "Low"}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Live Alerts
            </CardTitle>
            <CardDescription>Recent system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <AlertItem {...alert} />
                </motion.div>
              ))}
            </div>
            <Separator className="my-4" />
          </CardContent>
        </Card>

        {/* Citizens Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-5 w-5" />
              Citizen Activity
            </CardTitle>
            <CardDescription>Current movement patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { area: "Total Pedestrians", count: metrics.pedestrians, trend: "up" },
                { area: "Total Vehicles", count: metrics.vehicles, trend: "up" },
              ].map((area, index) => (
                <motion.div
                  key={area.area}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-sm">{area.area}</div>
                    <div className="text-xs text-muted-foreground">Real-time count</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{area.count}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;