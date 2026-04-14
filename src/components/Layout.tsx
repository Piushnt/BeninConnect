import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FlashNewsTicker } from './FlashNewsTicker';
import { useTenant } from '../contexts/TenantContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenant } = useTenant();

  // Apply dynamic theme colors to CSS variables
  React.useEffect(() => {
    if (tenant) {
      document.documentElement.style.setProperty('--primary-color', tenant.theme_config.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', tenant.theme_config.secondaryColor);
      document.documentElement.style.setProperty('--accent-color', tenant.theme_config.accentColor);
    }
  }, [tenant]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <FlashNewsTicker />
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};
