import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Shield, AlertTriangle, UserCheck, BarChart3, Zap } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  input: string;
  output: string;
  description: string;
  delay: number;
  gradient: string;
}

const FeatureCard = ({ icon, title, input, output, description, delay, gradient }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: true }}
      className="group"
    >
      <Card className={`h-full border-border hover:border-primary/50 transition-all duration-300 ${gradient} group-hover:glow-primary`}>
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              {icon}
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
          <CardDescription className="text-base leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg border">
              <div className="text-sm font-medium text-secondary mb-1">Input:</div>
              <div className="text-sm text-muted-foreground">{input}</div>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
              <div className="text-sm font-medium text-primary mb-1">Output:</div>
              <div className="text-sm text-foreground">{output}</div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full group-hover:bg-primary/10">
            View Demo
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const FeatureSection = () => {
  const features = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Adaptive Brightness Control",
      input: "Crowd detection from CCTV",
      output: "Lights brighten based on activity",
      description: "AI analyzes pedestrian, vehicle, and bicycle traffic in real-time to dynamically adjust street lighting intensity across three zones.",
      gradient: "bg-gradient-to-br from-background to-primary/5",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Women's Safety – Gesture Detection",
      input: "Raise hand or special gesture",
      output: "SOS alert triggered",
      description: "Advanced gesture recognition system detects distress signals and immediately alerts emergency services while activating full lighting.",
      gradient: "bg-gradient-to-br from-background to-secondary/5",
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Accident Detection & Emergency Routing",
      input: "Collision detection from video",
      output: "Lights ahead ON + emergency alert",
      description: "Instantly detects accidents and creates a bright pathway for emergency vehicles while notifying relevant authorities.",
      gradient: "bg-gradient-to-br from-background to-accent/5",
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Follow Me Mode",
      input: "Single person detected at night",
      output: "Lights follow user to destination",
      description: "Personal safety feature that creates a bubble of light around lone pedestrians, following them through their journey.",
      gradient: "bg-gradient-to-br from-background to-primary/5",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Energy & Safety Analytics",
      input: "Continuous monitoring data",
      output: "Comprehensive dashboard insights",
      description: "Real-time analytics showing energy savings, safety incidents, peak activity times, and optimization recommendations.",
      gradient: "bg-gradient-to-br from-background to-secondary/5",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Predictive Lighting",
      input: "Object movement patterns",
      output: "Pre-emptive brightness adjustment",
      description: "Machine learning predicts where people will move next, brightening areas before they arrive for seamless user experience.",
      gradient: "bg-gradient-to-br from-background to-accent/5",
    },
  ];

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gradient-secondary mb-6">
            Smart Features for Safer Cities
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Each feature leverages computer vision and AI to create an intelligent urban lighting ecosystem 
            that responds to real-world conditions in real-time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;