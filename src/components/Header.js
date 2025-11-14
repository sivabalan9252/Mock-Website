import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="text-2xl font-bold text-[#e53935]">
            Stellar
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/home" className="text-gray-700 hover:text-[#e53935]">Home</Link>
            <Link to="/contact" className="text-gray-700 hover:text-[#e53935]">Contact</Link>
            
            {isAuthenticated ? (
              <>
                <button 
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-[#e53935]"
                >
                  Logout
                </button>
                <div className="text-sm text-gray-500">
                  Welcome, {user?.email?.split('@')[0] || 'User'}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-[#e53935]">Login</Link>
                <Link to="/signup" className="bg-[#e53935] text-white px-4 py-2 rounded hover:bg-red-700">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link to="/home" className="block text-gray-700 hover:text-[#e53935]">Home</Link>
            <Link to="/contact" className="block text-gray-700 hover:text-[#e53935]">Contact</Link>
            
            {isAuthenticated ? (
              <>
                <button 
                  onClick={handleLogout}
                  className="block text-gray-700 hover:text-[#e53935]"
                >
                  Logout
                </button>
                <div className="text-sm text-gray-500">
                  Welcome, {user?.email?.split('@')[0] || 'User'}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-[#e53935]">Login</Link>
                <Link to="/signup" className="block bg-[#e53935] text-white px-4 py-2 rounded hover:bg-red-700 w-full text-center">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
