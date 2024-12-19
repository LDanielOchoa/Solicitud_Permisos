import { motion } from 'framer-motion';
import { Bell, User } from 'lucide-react';

const WelcomeBar = ({ userName = "Usuario" }) => {
  return (
    <motion.div 
      className="bg-white shadow-md rounded-lg p-4 mb-8 flex justify-between items-center"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h2 className="text-2xl font-bold text-green-700">Bienvenido, {userName}</h2>
        <p className="text-green-600">¿Qué deseas hacer hoy?</p>
      </div>
      <div className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 bg-green-100 rounded-full text-green-600 hover:bg-green-200"
        >
          <Bell size={24} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 bg-green-100 rounded-full text-green-600 hover:bg-green-200"
        >
          <User size={24} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default WelcomeBar;

