
import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import GitHubStatus from './GitHubStatus';
import { View, Role } from '../types';

interface HeaderProps {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  setView: (view: View) => void;
  currentView: View;
  userRole: Role;
  onLogout: () => void;
  userName: string;
  isDemoMode: boolean;
}

const NavItem: React.FC<{ children: React.ReactNode; onClick: () => void; active?: boolean }> = ({ children, onClick, active }) => (
  <button onClick={onClick} className={`block w-full text-left px-4 py-2 text-sm ${
    active 
      ? 'bg-brand-red text-white' 
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-brand-gray/50'
  }`}>
    {children}
  </button>
);

const Dropdown: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; }> = ({ title, children, isOpen, onToggle }) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="py-2 px-3 text-xs font-bold rounded-md transition-colors text-gray-400 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-brand-gray/50"
    >
      {title}
    </button>
    {isOpen && (
      <div className="absolute mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-brand-navy ring-1 ring-black ring-opacity-5 z-20">
        <div className="py-1">
          {children}
        </div>
      </div>
    )}
  </div>
);

const Header: React.FC<HeaderProps> = ({ theme, setTheme, setView, currentView, userRole, onLogout, userName, isDemoMode }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggle = (title: string) => {
    setOpenDropdown(openDropdown === title ? null : title);
  };
  
  const handleSetView = (view: View) => {
      setView(view);
      setOpenDropdown(null);
  }

  return (
    <header className="bg-brand-light-card dark:bg-brand-navy border-b border-brand-light-border dark:border-brand-gray sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-black tracking-tighter text-brand-light-text dark:text-white uppercase cursor-pointer" onClick={() => handleSetView('day-view')}>
              TRUE<span className="text-brand-red">X</span>PANSE
            </h1>
          </div>
          <div className="flex items-center">
            <nav className="hidden md:flex items-center space-x-1">
              <Dropdown title="Activity" isOpen={openDropdown === 'activity'} onToggle={() => handleToggle('activity')}>
                <NavItem onClick={() => handleSetView('day-view')} active={currentView === 'day-view'}>Day View</NavItem>
                <NavItem onClick={() => handleSetView('month-view')} active={currentView === 'month-view'}>Month View</NavItem>
              </Dropdown>
              <Dropdown title="Pipeline" isOpen={openDropdown === 'pipeline'} onToggle={() => handleToggle('pipeline')}>
                <NavItem onClick={() => handleSetView('prospecting')} active={currentView === 'prospecting'}>Prospecting</NavItem>
                <NavItem onClick={() => handleSetView('hot-leads')} active={currentView === 'hot-leads'}>Hot Leads</NavItem>
                <NavItem onClick={() => handleSetView('new-clients')} active={currentView === 'new-clients'}>New Clients</NavItem>
                 <NavItem onClick={() => handleSetView('revenue')} active={currentView === 'revenue'}>Revenue</NavItem>
              </Dropdown>
              <Dropdown title="Marketing" isOpen={openDropdown === 'marketing'} onToggle={() => handleToggle('marketing')}>
                 <NavItem onClick={() => handleSetView('ai-content')} active={currentView === 'ai-content'}>AI Content</NavItem>
                 <NavItem onClick={() => handleSetView('coaching')} active={currentView === 'coaching'}>Coaching</NavItem>
              </Dropdown>
              
              {userRole === 'Manager' && (
                <Dropdown title="Leadership" isOpen={openDropdown === 'leadership'} onToggle={() => handleToggle('leadership')}>
                    <NavItem onClick={() => handleSetView('team-control')} active={currentView === 'team-control'}>Team Control Panel</NavItem>
                    <NavItem onClick={() => handleSetView('performance-dashboard')} active={currentView === 'performance-dashboard'}>Performance Dashboard</NavItem>
                </Dropdown>
              )}

               <button onClick={() => handleSetView('eod-report')} className={`py-2 px-3 text-xs font-bold rounded-md transition-colors ${currentView === 'eod-report' ? 'bg-brand-red text-white' : 'text-gray-400 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-brand-gray/50'}`}>
                EOD Report
              </button>
            </nav>
            <div className="flex items-center ml-4">
                <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400 mr-3">Welcome, {userName?.split(' ')[0] || ""}
</span>
                <button onClick={onLogout} className="py-2 px-3 text-xs font-bold rounded-md transition-colors text-gray-400 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-brand-gray/50">
                    Logout
                </button>
                <GitHubStatus />
                <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
          </div>
        </div>
      </div>
      {isDemoMode && (
        <div className="bg-yellow-400 text-black text-xs font-bold text-center py-1">
            DEMO MODE
        </div>
      )}
    </header>
  );
};

export default Header;
