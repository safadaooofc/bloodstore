import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { StoreFront } from './pages/StoreFront';
import { AdminDashboard } from './pages/AdminDashboard';
import './index.css';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    return window.location.hash === '#/admin' || window.location.pathname.startsWith('/admin')
      ? 'admin'
      : 'store';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#/admin') {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('store');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToAdmin = () => {
    window.location.hash = '#/admin';
    setCurrentRoute('admin');
  };

  const navigateToStore = () => {
    window.location.hash = '#/';
    setCurrentRoute('store');
  };

  return (
    <StoreProvider>
      <div className="app-main-wrap">
        {currentRoute === 'admin' ? (
          <AdminDashboard onExitAdmin={navigateToStore} />
        ) : (
          <StoreFront onOpenAdmin={navigateToAdmin} />
        )}
      </div>
    </StoreProvider>
  );
}
