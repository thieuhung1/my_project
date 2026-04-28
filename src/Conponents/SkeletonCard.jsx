import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonCard = () => (
  <div className="col-xl-3 col-lg-4 col-md-6">
    <motion.div
      className="card h-100 border-0 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="shimmer" style={{ height: 220 }} />
      <div className="card-body p-4">
        <span className="placeholder col-8 mb-2 rounded" />
        <span className="placeholder col-6 mb-3 rounded" />
        <span className="placeholder col-4 mb-3 rounded" />
        <span className="btn disabled placeholder col-12 mb-2 rounded-pill" />
        <span className="btn disabled placeholder col-12 rounded-pill" />
      </div>
    </motion.div>
  </div>
);

export const SkeletonProductDetail = () => (
  <div className="container my-5">
    <div className="row g-5">
      <div className="col-lg-6">
        <div className="shimmer rounded-4" style={{ height: 500 }} />
      </div>
      <div className="col-lg-6">
        <div className="shimmer rounded-3 mb-3" style={{ height: 40, width: '80%' }} />
        <div className="shimmer rounded-3 mb-3" style={{ height: 24, width: '40%' }} />
        <div className="shimmer rounded-3 mb-4" style={{ height: 60, width: '100%' }} />
        <div className="shimmer rounded-3 mb-3" style={{ height: 50, width: 200 }} />
        <div className="shimmer rounded-3" style={{ height: 45, width: '60%' }} />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
