import { ReactNode } from "react";
import { motion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  delayMs?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
}

const Reveal = ({ 
  children, 
  delayMs = 0, 
  className = "", 
  direction = "up",
  duration = 0.8
}: RevealProps) => {
  
  const getInitialY = () => {
    if (direction === "up") return 24;
    if (direction === "down") return -24;
    return 0;
  };

  const getInitialX = () => {
    if (direction === "left") return 24;
    if (direction === "right") return -24;
    return 0;
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: getInitialY(), 
        x: getInitialX(),
        scale: 0.98
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        x: 0,
        scale: 1
      }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ 
        duration, 
        delay: delayMs / 1000, 
        ease: [0.16, 1, 0.3, 1] // Custom refined easing for premium feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
