/**
 * Demo Page - Interactive demonstration of LumenAI features
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  AlertTriangle,
  Lightbulb,
  Zap,
  Video,
  Play,
  Pause,
  RefreshCw,
  ArrowLeft,
  TrendingUp,
  MapPin,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DemoAlert {
  id: number;
  type: string;
  location: string;
  confidence: number;
  timestamp: string;
  severity: string;
}

interface Streetlight {
  id: string;
  location: { x: number; y: number };
  brightness: number;
  status: string;
}

export default function Demo() {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [accidentDetected, setAccidentDetected] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [videoSrc, setVideoSrc] = useState("");
  const [alerts, setAlerts] = useState<DemoAlert[]>([]);
  const [streetlights, setStreetlights] = useState<Streetlight[]>([
    { id: 'L1', location: { x: 0, y: 0 }, brightness: 70, status: 'active' },
    { id: 'L2', location: { x: 30, y: 0 }, brightness: 70, status: 'active' },
    { id: 'L3', location: { x: 60, y: 0 }, brightness: 70, status: 'active' },
    { id: 'L4', location: { x: 90, y: 0 }, brightness: 70, status: 'active' },
  ]);
  const [detectionConfidence, setDetectionConfidence] = useState(45);
  const [energySavings, setEnergySavings] = useState(73);

  useEffect(() => {
    if (!isRunning) return;

    // Connect to the backend event stream
    const eventSource = new EventSource("http://127.0.0.1:5000/events");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Update state with real data from the backend
        setCurrentFrame(prev => prev + 1); // Increment frame count

        // Only update confidence if it exists in the message
        if (data.confidence !== undefined) {
          setDetectionConfidence(data.confidence);
        }

        // Update streetlights if the data is available in the event
        if (data.streetlights) {
          setStreetlights(data.streetlights);
        }

        // Update energy savings if the data is available in the event
        if (data.energy_savings) {
          setEnergySavings(data.energy_savings);
        }

        if (data.prediction === 'Accident' && data.confidence > 90) {
          if (!accidentDetected) { // Trigger alert only on the first detection
            const newAlert: DemoAlert = {
              id: Date.now(),
              type: 'Accident Detected',
              location: `Intersection ${Math.floor(Math.random() * 100)}`,
              confidence: Math.round(data.confidence),
              timestamp: new Date().toISOString(),
              severity: 'critical'
            };
            setAlerts(prev => [newAlert, ...prev].slice(0, 10));
            setAccidentDetected(true);
          }
        } else if (data.prediction) {
          // Only reset if we received a prediction
          setAccidentDetected(false);
        }
      } catch (error) {
        console.error("Error parsing event data:", error);
      }
    };

    eventSource.onerror = () => {
      console.error("EventSource failed.");
      eventSource.close();
    };

    // Clean up the connection when the component unmounts or the demo stops
    return () => {
      eventSource.close();
    };
  }, [isRunning]); // Re-run effect when isRunning changes

  const startDemo = () => {
    setIsRunning(true);
    setCurrentFrame(0);
    // Use snapshot polling instead of stream
    setVideoSrc("http://127.0.0.1:5000/current_frame");
    setAlerts([]);
    setAccidentDetected(false);
  };

  // Polling effect for video frames
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRunning) {
      intervalId = setInterval(() => {
        // Update video source with timestamp to force refresh
        setVideoSrc(`http://127.0.0.1:5000/current_frame?t=${Date.now()}`);
      }, 100); // 10 FPS
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  const stopDemo = () => {
    setVideoSrc(""); // Stop the stream by clearing the src
    setIsRunning(false);
  };

  const resetDemo = () => {
    setIsRunning(false);
    setCurrentFrame(0);
    setAlerts([]);
    setVideoSrc(""); // Stop the stream
    setAccidentDetected(false);
    setDetectionConfidence(45);
    setStreetlights([
      { id: 'L1', location: { x: 0, y: 0 }, brightness: 70, status: 'active' },
      { id: 'L2', location: { x: 30, y: 0 }, brightness: 70, status: 'active' },
      { id: 'L3', location: { x: 60, y: 0 }, brightness: 70, status: 'active' },
      { id: 'L4', location: { x: 90, y: 0 }, brightness: 70, status: 'active' },
    ]);
    setEnergySavings(73);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gradient-primary">LumenAI Demo</h1>
              <p className="text-muted-foreground">Interactive demonstration of smart city management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isRunning ? "default" : "secondary"} className="gap-2">
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {isRunning ? 'Live' : 'Stopped'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Controls</CardTitle>
            <CardDescription>Start the interactive demonstration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                onClick={startDemo}
                disabled={isRunning}
                size="lg"
                className="gap-2"
              >
                <Play className="h-5 w-5" />
                Start Demo
              </Button>

              <Button
                onClick={stopDemo}
                disabled={!isRunning}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Pause className="h-5 w-5" />
                Pause
              </Button>

              <Button
                onClick={resetDemo}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Reset
              </Button>

              <div className="ml-auto text-sm text-muted-foreground">
                Frame: {currentFrame.toLocaleString()} |
                Confidence: {detectionConfidence.toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Demo Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accident Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Accident Detection System
              </CardTitle>
              <CardDescription>AI-powered real-time accident detection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Detection Status */}
              <div className="relative h-96 bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700">
                <img
                  src={videoSrc || "/placeholder.jpg"}
                  alt="Live Feed"
                  className="w-full h-full object-cover"
                />
                {!isRunning && (
                  <div className="absolute inset-0 flex items-center justify-center text-center space-y-2">
                    <Video className="h-16 w-16 mx-auto text-slate-600" />
                    <p className="text-slate-500 text-sm">Press "Start Demo" to begin live feed</p>
                  </div>
                )}

                {/* Detection overlay */}
                <AnimatePresence>
                  {accidentDetected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 flex items-center justify-center bg-red-500/20 border-4 border-red-500"
                    >
                      <div className="text-center space-y-2">
                        <AlertTriangle className="h-16 w-16 mx-auto text-red-500 animate-pulse" />
                        <div className="bg-red-500 text-white px-4 py-2 rounded-lg">
                          <p className="font-bold text-xl">ACCIDENT DETECTED</p>
                          <p className="text-sm">
                            Confidence: {alerts[0]?.confidence || 95}%
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Detection bar */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Detection Confidence</span>
                      <span className="font-bold text-white">
                        {detectionConfidence.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={detectionConfidence}
                      className="h-2"
                    />
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Status:</span>
                      <Badge variant={accidentDetected ? "destructive" : "secondary"}>
                        {accidentDetected ? "Accident Detected" : "No Accident"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{alerts.length}</div>
                  <div className="text-xs text-muted-foreground">Total Alerts</div>
                </div>
                <div className="text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{currentFrame}</div>
                  <div className="text-xs text-muted-foreground">Frames Processed</div>
                </div>
                <div className="text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">
                    {isRunning ? 'Active' : 'Idle'}
                  </div>
                  <div className="text-xs text-muted-foreground">System Status</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Streetlights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Smart Streetlight Control
              </CardTitle>
              <CardDescription>AI-controlled brightness management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Streetlights Grid */}
              <div className="grid grid-cols-2 gap-4">
                {streetlights.map((lamp, index) => (
                  <motion.div
                    key={lamp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{lamp.id}</span>
                      <Badge variant={lamp.status === 'active' ? 'default' : 'secondary'}>
                        {lamp.status}
                      </Badge>
                    </div>

                    {/* Brightness visualization */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Brightness</span>
                        <span className="font-bold">{Math.round(lamp.brightness)}%</span>
                      </div>
                      <Progress value={lamp.brightness} className="h-2" />
                    </div>

                    {/* Light glow effect */}
                    <div
                      className="w-full h-12 rounded-lg flex items-center justify-center transition-all duration-500"
                      style={{
                        backgroundColor: `rgba(255, 220, 100, ${lamp.brightness / 100})`,
                        boxShadow: `0 0 ${lamp.brightness * 0.5}px rgba(255, 220, 100, ${lamp.brightness / 100})`,
                      }}
                    >
                      <Lightbulb
                        className="h-6 w-6"
                        style={{
                          opacity: lamp.brightness / 100,
                          color: lamp.brightness > 80 ? '#fbbf24' : '#fcd34d'
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Energy Stats */}
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Energy Savings</span>
                  <Badge variant="default" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {energySavings.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={energySavings} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  vs traditional lighting system
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Real-time Alerts Feed
            </CardTitle>
            <CardDescription>Live emergency alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No alerts yet. Start the demo to see real-time alerts.</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <Alert variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{alert.type}</AlertTitle>
                        <AlertDescription className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>{alert.location}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              Confidence: {alert.confidence}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Activity className="h-8 w-8 mx-auto text-primary" />
                <div className="text-2xl font-bold">{currentFrame.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Frames Processed</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <AlertTriangle className="h-8 w-8 mx-auto text-red-500" />
                <div className="text-2xl font-bold">{alerts.length}</div>
                <div className="text-sm text-muted-foreground">Total Alerts</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Lightbulb className="h-8 w-8 mx-auto text-yellow-500" />
                <div className="text-2xl font-bold">{streetlights.length}</div>
                <div className="text-sm text-muted-foreground">Active Lights</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Zap className="h-8 w-8 mx-auto text-green-500" />
                <div className="text-2xl font-bold">{energySavings.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Energy Saved</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Info */}
        <Card>
          <CardHeader>
            <CardTitle>What's Being Demonstrated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Accident Detection
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Real-time video processing simulation</li>
                  <li>AI-powered accident detection</li>
                  <li>Confidence-based alerting system</li>
                  <li>Instant emergency notifications</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Smart Streetlights
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Dynamic brightness adjustment</li>
                  <li>Traffic-aware control</li>
                  <li>Energy consumption optimization</li>
                  <li>Multi-lamp network management</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
