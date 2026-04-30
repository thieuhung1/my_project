import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './app/App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap-icons/font/bootstrap-icons.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

reportWebVitals();
