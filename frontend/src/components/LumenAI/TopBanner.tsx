import { motion } from "framer-motion";

const TopBanner = () => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full bg-gradient-primary py-4 px-6 text-center border-b border-border"
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-background mb-2">
          LumenAI: A CCTV-Powered Digital Twin for Adaptive Street Lighting and Urban Safety
        </h1>
        <p className="text-lg text-background/90 italic">
          Turning city lights smart, safe, and energy-efficient — using only CCTV footage.
        </p>
      </div>
    </motion.section>
  );
};

export default TopBanner;