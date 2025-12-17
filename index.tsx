import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import LearningHubPage from './pages/LearningHubPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Check if we're on the learning hub page
const isLearningHub = window.location.pathname === '/learning' || window.location.pathname === '/learning/';

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(React.StrictMode, null, 
    isLearningHub ? React.createElement(LearningHubPage) : React.createElement(App)
  )
);