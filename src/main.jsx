import React, { useContext, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import routes from './Router';
import './index.css'
import Navbar from './components/NavBar';
import { FirebaseProvider } from './services/firebaseContext';
import AuthContextProvider from './context/AuthContext';
import ShopifyContext, { ShopifyProvider } from './context/ShopifyContext';
import ConnectToShopify from './components/ConnectToShopify';
import { Elements } from '@stripe/react-stripe-js'; // Import Elements
import { loadStripe } from '@stripe/stripe-js'; // Import loadStripe

const stripePromise = loadStripe('pk_test_51NDuydAAApZWEPmmTbN1p4eKX6VWd6UZXypbYcgAKTSonujJi1Hx9hfRNusKOQ1MBZBGooLQ2nAjYD8RUeqvg9zT009Vt49zAk'); 
function App() {
  const { isShopifyConnected, setIsShopifyConnected, handleConnectShopify } = useContext(ShopifyContext);

useEffect(() => {
  const location = window.location;
  const searchParams = new URLSearchParams(location.search);
  const accessToken = searchParams.get('accessToken');
  const error = searchParams.get('error');

  console.log('Location search:', location.search); // Log the location search value

  if (accessToken) {
    // Set the access token in the Shopify context and mark the user as connected
    handleConnectShopify(accessToken);
    setIsShopifyConnected(true);
  } else if (error) {
    console.error('Failed to connect to Shopify store:', error);
  }
}, [setIsShopifyConnected, handleConnectShopify]);


  return (
    <Router>
      <div>
        {!isShopifyConnected ? (
          <ConnectToShopify />
        ) : (
          <>
            <Navbar />
            <Routes>
              {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
      <Elements stripe={stripePromise}>
  <FirebaseProvider>
    <AuthContextProvider>
      <ShopifyProvider>
        <App />
      </ShopifyProvider>
    </AuthContextProvider>
  </FirebaseProvider>
      </Elements>
);
