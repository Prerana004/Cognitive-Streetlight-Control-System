import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Eye, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="min-h-screen bg-gradient-hero flex items-center justify-center px-6 py-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-bold text-gradient-primary leading-tight">
              See the City Through AI's Eyes
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Real-time brightness control, accident alerts, gesture recognition, and energy dashboards — all from CCTV.
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Button 
              variant="default" 
              size="lg" 
              className="glow-primary group"
              onClick={() => navigate('/demo')}
            >
              <Play className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              Watch Demo
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary text-primary hover:bg-primary/10"
              onClick={() => navigate('/simulation')}
            >
              <Eye className="mr-2 h-5 w-5" />
              Live Simulation
            </Button>
          </motion.div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Featured capabilities:</p>
            <div className="flex flex-wrap gap-3">
              {["Real-time Detection", "Predictive Lighting", "Energy Analytics", "Emergency Response"].map((feature, index) => (
                <motion.span
                  key={feature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm border border-primary/30"
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Visual */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CCTV Feed Mock */}
            <motion.div
              className="relative bg-card border border-border rounded-lg p-4 glow-primary"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">CCTV Feed</span>
              </div>
              <div className="aspect-video bg-muted rounded border relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                <div className="absolute top-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
                  Live • 4 objects detected
                </div>
                {/* Simulated detection boxes */}
                <div className="absolute top-1/4 left-1/4 w-8 h-8 border-2 border-primary rounded animate-pulse"></div>
                <div className="absolute top-1/2 right-1/4 w-6 h-12 border-2 border-secondary rounded animate-pulse"></div>
                <div className="absolute bottom-1/4 left-1/3 w-10 h-6 border-2 border-accent rounded animate-pulse"></div>
              </div>
            </motion.div>

            {/* AI Simulation */}
            <motion.div
              className="relative bg-card border border-border rounded-lg p-4 glow-secondary"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-secondary animate-pulse" />
                <span className="text-sm font-medium">AI Simulation</span>
              </div>
              <div className="aspect-video bg-muted rounded border relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20"></div>
                <div className="absolute top-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
                  Digital Twin Active
                </div>
                {/* Simulated street lights */}
                <div className="absolute bottom-4 left-4 w-2 h-8 bg-primary rounded-full animate-pulse-glow"></div>
                <div className="absolute bottom-4 left-1/2 w-2 h-8 bg-secondary rounded-full animate-pulse-glow" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-4 right-4 w-2 h-8 bg-accent rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
              </div>
            </motion.div>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-center mt-6 text-muted-foreground italic"
          >
            "This is how we build a digital twin without extra hardware."
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;