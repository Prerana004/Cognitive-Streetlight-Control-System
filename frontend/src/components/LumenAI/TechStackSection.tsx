import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, Database, Eye, Cpu, Globe, Zap, BarChart3 } from "lucide-react";

const TechStackSection = () => {
  const techStacks = [
    {
      category: "Computer Vision & AI",
      icon: <Eye className="w-6 h-6" />,
      description: "Real-time object detection and tracking",
      technologies: ["YOLOv8", "SORT/DeepSORT", "OpenCV", "NumPy"],
      gradient: "bg-gradient-to-br from-primary/10 to-primary/5",
    },
    {
      category: "Backend & Processing",
      icon: <Database className="w-6 h-6" />,
      description: "High-performance data processing and APIs",
      technologies: ["Python", "FastAPI", "WebSocket", "Pandas"],
      gradient: "bg-gradient-to-br from-secondary/10 to-secondary/5",
    },
    {
      category: "Frontend & Visualization",
      icon: <Globe className="w-6 h-6" />,
      description: "Interactive 3D digital twin interface",
      technologies: ["React", "Three.js", "TypeScript", "Tailwind CSS"],
      gradient: "bg-gradient-to-br from-accent/10 to-accent/5",
    },
    {
      category: "Analytics & Insights",
      icon: <BarChart3 className="w-6 h-6" />,
      description: "Energy monitoring and safety analytics",
      technologies: ["Chart.js", "Matplotlib", "Real-time Dashboards"],
      gradient: "bg-gradient-to-br from-primary/10 to-secondary/5",
    },
  ];

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gradient-primary mb-6">
            Digital Twin Simulation & Tech Stack
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-xl text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Digital Twin Simulation:</strong> We recreated city streets using advanced 
              computer vision and 3D rendering — matched frame-by-frame to CCTV input for pixel-perfect accuracy.
            </p>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">Core Algorithm: LumenAI Intelligence</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <strong>Object Detection:</strong> YOLOv8 detects persons, vehicles, bikes<br/>
                  <strong>Tracking:</strong> SORT algorithm assigns unique IDs<br/>
                  <strong>Speed Calculation:</strong> Pixel movement analysis
                </div>
                <div>
                  <strong>Zone Analysis:</strong> NEAR, MID, FAR street divisions<br/>
                  <strong>Predictive Lighting:</strong> 1-second lookahead<br/>
                  <strong>Smart Cooldown:</strong> Activity-based timing
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {techStacks.map((stack, index) => (
            <motion.div
              key={stack.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`h-full border-border hover:border-primary/50 transition-all duration-300 ${stack.gradient}`}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                      {stack.icon}
                    </div>
                    <CardTitle className="text-lg">{stack.category}</CardTitle>
                  </div>
                  <CardDescription>{stack.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {stack.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Algorithm Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-card border border-border rounded-lg p-8"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-gradient-secondary">
            LumenAI Algorithm Flow
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: "1", title: "CCTV Input", desc: "Live video feed" },
              { step: "2", title: "AI Detection", desc: "YOLOv8 object detection" },
              { step: "3", title: "Zone Analysis", desc: "NEAR/MID/FAR scoring" },
              { step: "4", title: "Brightness Calc", desc: "Activity-based lighting" },
              { step: "5", title: "Light Control", desc: "Real-time adjustment" },
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-background font-bold text-lg mx-auto mb-3">
                  {item.step}
                </div>
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {index < 4 && (
                  <div className="hidden md:block absolute top-6 left-full w-8 h-0.5 bg-primary/30 translate-x-2"></div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStackSection;