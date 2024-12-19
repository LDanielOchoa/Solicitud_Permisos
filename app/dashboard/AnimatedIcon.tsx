import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface AnimatedIconProps {
  Icon: LucideIcon;
  color: string;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ Icon, color }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2
      }}
      className={`rounded-full p-3 ${color}`}
    >
      <Icon size={40} className="text-white" />
    </motion.div>
  );
};

export default AnimatedIcon;

