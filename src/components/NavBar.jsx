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
      <div className="container mx-auto flex items-center justify-between  py-2">
        <div className="flex items-center">
          <Link
            className="text-white text-3xl font-bold mr-8 hover:text-gray-300 transition duration-300 transform hover:scale-110"
            to="/"
          >
       <img
              src="data:image/png;base64,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"
              alt=""
              className="h-8 mr-2"
            />
          </Link>


          {user && (
            <div className="ml-4 space-x-6">
          <NavLink
                to="/"
                className="text-white text-lg hover:text-gray-300 transition duration-300 transform hover:scale-110"
                // activeClassName="underline"
              >
                Products
              </NavLink>
              <NavLink
                to="/files"
                className="text-white text-lg hover:text-gray-300 transition duration-300 transform hover:scale-110"
                // activeClassName="underline"
              >
                Files
              </NavLink>
              <NavLink
                to="/sales"
                className="text-white text-lg hover:text-gray-300 transition duration-300 transform hover:scale-110"
                // activeClassName="underline"
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
