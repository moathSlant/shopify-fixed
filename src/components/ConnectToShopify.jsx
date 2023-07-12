import React, { useEffect, useState } from 'react';
import './ConnectToShopify.css'
const ConnectToShopify = () => {
  const [shop, setShop] = useState(''); // Use state to store the user's shop domain

    const handleConnectShopify = () => {
      const apiKey = '4f72768a57fa8a47af16143cbdccfe91';
      const scopes = 'read_products,write_products,read_orders,write_orders';
      const redirectUri = 'http://localhost:8080/';
      const trimmedShop = shop.trim();
    
      const shopifyAuthUrl = `https://${trimmedShop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}`;
    
      window.location.href = shopifyAuthUrl;
    };
    

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const returnedShop = urlParams.get('shop');
    
    if (code && returnedShop) {
      // Redirect to your cloud function to exchange the code for an access token
      const exchangeUrl = `https://us-central1-slant3d-shopify.cloudfunctions.net/connectShopifyStore?code=${code}&shop=${returnedShop}`;

      // Redirect the user to the exchange URL
      window.location.href = exchangeUrl;
    }
  }, []);

  return (
    <div className="modal">
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
    </div>
  );
};

export default ConnectToShopify;
