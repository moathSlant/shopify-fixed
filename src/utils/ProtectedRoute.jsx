// import React, { useContext, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import ShopifyContext from '../context/ShopifyContext';

// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated } = useContext(ShopifyContext);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/connect-to-shopify');
//     }
//   }, [isAuthenticated, navigate]);

//   return isAuthenticated ? children : null;
// };

// export default ProtectedRoute;
