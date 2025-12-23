
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-brand-gray/50 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

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
                  <NavItem onClick={() => handleSetView('dream-avatars')} active={currentView === 'dream-avatars'}>Dream Client Studio</NavItem>
                  <NavItem onClick={() => handleSetView('scorecard-dashboard')} active={currentView === 'scorecard-dashboard'}>Scorecard Dashboard</NavItem>
                  <NavItem onClick={() => handleSetView('ai-images')} active={currentView === 'ai-images'}>AI Images</NavItem>
                  <NavItem onClick={() => handleSetView('ai-content')} active={currentView === 'ai-content'}>AI Content</NavItem>
                  <NavItem onClick={() => handleSetView('coaching')} active={currentView === 'coaching'}>Coaching</NavItem>
               </Dropdown>
              
              {(userRole === 'Admin' || userRole === 'Manager') && (
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
                <Dropdown title="Settings" isOpen={openDropdown === 'settings'} onToggle={() => handleToggle('settings')}>
                  <NavItem onClick={() => handleSetView('account-settings')} active={currentView === 'account-settings'}>Account Settings</NavItem>
                  <NavItem onClick={() => handleSetView('billing-plans')} active={currentView === 'billing-plans'}>Billing & Plans</NavItem>
                  {(userRole === 'Admin' || userRole === 'Manager') && (
                    <NavItem onClick={() => handleSetView('ghl-integration')} active={currentView === 'ghl-integration'}>GHL Integration</NavItem>
                  )}
                </Dropdown>
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-brand-navy border-b border-brand-light-border dark:border-brand-gray">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Activity Section */}
            <div className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Activity</div>
            <button onClick={() => { handleSetView('day-view'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm rounded-md ${currentView === 'day-view' ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              Day View
            </button>
            <button onClick={() => { handleSetView('month-view'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm rounded-md ${currentView === 'month-view' ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              Month View
            </button>

            {/* Pipeline Section */}
            <div className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mt-3">Pipeline</div>
            <button onClick={() => { handleSetView('prospecting'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm rounded-md ${currentView === 'prospecting' ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              Prospecting
            </button>
            <button onClick={() => { handleSetView('hot-leads'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm rounded-md ${currentView === 'hot-leads' ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              Hot Leads
            </button>
            <button onClick={() => { handleSetView('new-clients'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm rounded-md ${currentView === 'new-clients' ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              New Clients
            </button>
            <button onClick={() => { handleSetView('revenue'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm rounded-md ${currentView === 'revenue' ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              Revenue
            </button>

            {/* Marketing Section */}
            <div className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mt-3">Marketing</div>
            <button onClick={() => { handleSetView('dream-avatars'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm rounded-md ${currentView === 'dream-avatars' ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              Dream Client Studio
            </button>
            <button onClick={() => { handleSetView('scorecard-dashboard'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm rounded-md ${currentView === 'scorecard-dashboard' ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              Scorecard Dashboard
            </button>
            <button onClick={() => { handleSetView('ai-images'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm rounded-md ${currentView === 'ai-images' ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              AI Images
            </button>
            <button onClick={() => { handleSetView('ai-content'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm rounded-md ${currentView === 'ai-content' ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              AI Content
            </button>
            <button onClick={() => { handleSetView('coaching'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm rounded-md ${currentView === 'coaching' ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              Coaching
            </button>

            {/* Leadership Section (Manager only) */}
            {(userRole === 'Admin' || userRole === 'Manager') && (
              <>
                <div className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mt-3">Leadership</div>
                <button onClick={() => { handleSetView('team-control'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm rounded-md ${currentView === 'team-control' ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  Team Control Panel
                </button>
                <button onClick={() => { handleSetView('performance-dashboard'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm rounded-md ${currentView === 'performance-dashboard' ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  Performance Dashboard
                </button>
              </>
            )}

            {/* EOD Report */}
            <button onClick={() => { handleSetView('eod-report'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm rounded-md mt-3 ${currentView === 'eod-report' ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              EOD Report
            </button>

            {/* User info and logout */}
            <div className="border-t border-gray-200 dark:border-brand-gray mt-3 pt-3">
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                Welcome, {userName?.split(' ')[0] || ""}
              </div>
              <button onClick={() => { handleSetView('account-settings'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                Account Settings
              </button>
              {(userRole === 'Admin' || userRole === 'Manager') && (
                <button onClick={() => { handleSetView('ghl-integration'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  GHL Integration
                </button>
              )}
              <button 
                onClick={(e) => { 
                  e.preventDefault();
                  e.stopPropagation();
                  onLogout(); 
                  setMobileMenuOpen(false); 
                }} 
                className="block w-full text-left px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors active:bg-red-100 dark:active:bg-red-900/30"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
