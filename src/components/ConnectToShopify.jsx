import React, { useEffect, useState, useContext } from 'react';
import './ConnectToShopify.css';
import AuthContext from '../context/AuthContext';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from '../firebase'; // Assuming you have exported auth from firebase config
import SignInWithGoogleButton from './SignInWithGoogle';

const ConnectToShopify = () => {
  const [shop, setShop] = useState('');
  const [user, setUser] = useState('')
  // const { user } = useContext(AuthContext);

  const handleConnectShopify = () => {
    const apiKey = import.meta.env.VITE_API_KEY;
    const scopes = 'read_products,write_products,read_orders,write_orders,read_assigned_fulfillment_orders,write_assigned_fulfillment_orders,read_fulfillments,write_fulfillments,read_merchant_managed_fulfillment_orders,write_merchant_managed_fulfillment_orders,read_third_party_fulfillment_orders,write_third_party_fulfillment_orders,read_assigned_fulfillment_orders,write_assigned_fulfillment_orders,read_locations ';
    const redirectUri = 'https://slant3dshopconnect.com/';
    const trimmedShop = shop.trim();
    const shopifyAuthUrl = `https://${trimmedShop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}`;
    window.location.href = shopifyAuthUrl;
  };

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
       setUser(result)
      })
      .catch((error) => {
        console.error("Error during Google sign-in:", error);
      });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const returnedShop = urlParams.get('shop');
    
    if (code && returnedShop) {
      const exchangeUrl = `https://us-central1-slant3d-shopify.cloudfunctions.net/connectShopifyStore?code=${code}&shop=${returnedShop}`;
      window.location.href = exchangeUrl;
    }
  }, []);

  return (
    <div className="modal">
      {!user ? (
        <>
          <button
            className="bg-white hover:bg-white px-3 py-1 text-dark rounded"
            onClick={handleGoogleLogin}
          >
            Log in with Google
          </button>
        </>
      ) : (
        <>
          <h2>Connect to Shopify</h2>
          <input
            type="text"
            className="inputField"
            placeholder="Your Shopify Store URL (e.g., myshop.myshopify.com)"
            value={shop}
            onChange={(e) => setShop(e.target.value)}
          />
          <button className="connectButton" onClick={handleConnectShopify}>
            Connect Shopify Store
          </button>
        </>
      )}
    </div>
  );
};

export default ConnectToShopify;
