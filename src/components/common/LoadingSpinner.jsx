// dùng để hiển thị spinner loading khi đang tải dữ liệu
import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 48, 
  color = 'var(--primary-orange)',
  fullScreen = false,
  text = 'Đang tải...' 
}) => {
  const spinner = (
    <motion.div
      className="d-flex flex-column align-items-center justify-content-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, rotate: 0 }}
          animate={{ 
            pathLength: [0, 1, 1, 0],
            rotate: [0, 360, 720, 720]
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          style={{
            strokeDasharray: "0 1",
          }}
        />
      </svg>
      {text && (
        <motion.span 
          className="mt-3 text-muted small fw-medium"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.span>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ 
          background: 'rgba(250, 250, 250, 0.9)', 
          backdropFilter: 'blur(8px)',
          zIndex: 9999 
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
