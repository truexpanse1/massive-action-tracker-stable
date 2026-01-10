import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import LearningHubPage from './pages/LearningHubPage';
import ProposalViewPage from './pages/ProposalViewPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Check if we're on the learning hub page
const isLearningHub = window.location.pathname === '/learning' || window.location.pathname === '/learning/';

// Check if we're on a proposal page
const proposalMatch = window.location.pathname.match(/^\/proposal\/([a-z0-9-]+)$/i);
const isProposal = !!proposalMatch;
const proposalSlug = proposalMatch ? proposalMatch[1] : '';

const root = ReactDOM.createRoot(rootElement);

let component;
if (isProposal) {
  component = React.createElement(ProposalViewPage, { slug: proposalSlug });
} else if (isLearningHub) {
  component = React.createElement(LearningHubPage);
} else {
  component = React.createElement(App);
}

root.render(
  React.createElement(React.StrictMode, null, component)
);