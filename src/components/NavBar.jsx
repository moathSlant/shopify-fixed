import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ShopifyContext from '../context/ShopifyContext';
import SignInWithGoogleButton from './SignInWithGoogle';
import ConnectToShopify from './ConnectToShopify';

const NavBar = () => {
  const { user } = useContext(AuthContext);
  const { isShopifyConnected, shop, handleDisconnectShopify } = useContext(ShopifyContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);

  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
        setShowUserInfoModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear the access token and mark the user as disconnected
    localStorage.removeItem('accessToken');
    handleDisconnectShopify();

    // Refresh the page
    window.location.reload();
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleUserInfoModal = () => {
    setShowUserInfoModal(!showUserInfoModal);
  };

  return (
    <nav className="bg-black pb-3 pt-3 relative z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Link
            className="text-white text-3xl font-bold mr-8 hover:text-gray-300 transition duration-300 transform hover:scale-110"
            to="/"
          >
            <img className="h-10 w-auto" src="src\assets\Slant 3D Logo (white).png" alt="Slant 3D Logo" />
          </Link>

          {user && (
            <div className="ml-4 space-x-2">
              <NavLink
                to="/files"
                className="text-white text-lg hover:text-gray-300 transition duration-300 transform hover:scale-110"
                activeClassName="underline"
              >
                Files
              </NavLink>
              <NavLink
                to="/sales"
                className="text-white text-lg hover:text-gray-300 transition duration-300 transform hover:scale-110"
                activeClassName="underline"
              >
                Sales
              </NavLink>
            </div>
          )}
        </div>

        <div className="flex items-center relative">
          <div className="text-white mr-4">{shop}</div>

          <div className="hidden lg:flex lg:items-center lg:w-auto">
            <SignInWithGoogleButton />
          </div>

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                className="text-white hover:text-gray-300 transition duration-300 transform hover:scale-110"
                onClick={handleDropdownToggle}
              >
                <img className="h-8 w-8 rounded-full" src={user.photoURL} alt="Profile" />
              </button>

              {dropdownOpen && (
                <div className="absolute top-10 right-0 bg-white rounded-md shadow-md py-2 z-50">
                  <div className="px-4 py-2">
                    {/* <p className="text-gray-700">{user.displayName}</p> */}
                  </div>
                  <div className="px-4 py-2">
              <Link to='userinfo'>
                <p>User info</p>
              </Link>
                  </div>
                  <div className="px-4 py-2">
                    <button
                      className="text-red-500 hover:text-red-700 transition duration-300"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </nav>
  );
};

export default NavBar;
