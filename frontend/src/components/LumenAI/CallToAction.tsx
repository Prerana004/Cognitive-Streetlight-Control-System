import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Download, Star } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Quote */}
          <div className="relative">
            <div className="text-6xl text-primary/20 font-serif absolute -top-4 -left-4">"</div>
            <blockquote className="text-3xl md:text-4xl font-bold text-gradient-primary leading-relaxed">
              Let your city breathe smarter. One frame at a time.
            </blockquote>
            <div className="text-6xl text-primary/20 font-serif absolute -bottom-4 -right-4">"</div>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <Button size="lg" className="glow-primary group text-lg px-8 py-4">
              <Star className="mr-2 h-5 w-5 group-hover:animate-spin" />
              View Demo
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4">
              <Github className="mr-2 h-5 w-5" />
              Source Code
            </Button>
            <Button variant="outline" size="lg" className="border-secondary text-secondary hover:bg-secondary/10 text-lg px-8 py-4">
              <Download className="mr-2 h-5 w-5" />
              Documentation
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-border"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">85%</div>
              <div className="text-muted-foreground">Energy Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">99.7%</div>
              <div className="text-muted-foreground">Detection Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">&lt;500ms</div>
              <div className="text-muted-foreground">Response Time</div>
            </div>
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-sm pt-8"
          >
            Ready to deploy on any city infrastructure • No additional hardware required • Open source available
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;