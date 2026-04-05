import React from 'react';
import './LoadingSpinner.css'; // Optional CSS module

const LoadingSpinner = ({ size = 'md', color = 'warning' }) => (
  <div className="spinner-container">
    <div className={`spinner-border text-${color}`} role="status" style={{ width: size === 'sm' ? '1.5rem' : size === 'lg' ? '4rem' : '2.5rem', height: size === 'sm' ? '1.5rem' : size === 'lg' ? '4rem' : '2.5rem' }}>
      <span className="visually-hidden">Đang tải...</span>
    </div>
  </div>
);

export default React.memo(LoadingSpinner);

