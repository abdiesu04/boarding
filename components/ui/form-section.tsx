import { ReactNode } from "react";
import { motion } from "framer-motion";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  delay?: number;
}

export function FormSection({ title, children, delay = 0 }: FormSectionProps) {
  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </motion.div>
  );
}

