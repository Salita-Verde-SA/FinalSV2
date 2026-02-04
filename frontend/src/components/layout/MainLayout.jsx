import React from 'react';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0f1115] font-sans text-gray-200 selection:bg-brand-accent selection:text-black">
      <Header />
      {/* Ajuste de padding-top para compensar el header fixed */}
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;