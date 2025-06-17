import { motion } from "motion/react";
import { PropsWithChildren } from "react";
const FadeWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      style={{ height: "100%" }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default FadeWrapper;
