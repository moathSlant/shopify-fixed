import React, { useEffect, useState, useContext} from 'react';
import './ConnectToShopify.css'
import AuthContext from '../context/AuthContext';
const ConnectToShopify = () => {
  const [shop, setShop] = useState('');
const user = useContext(AuthContext);
    const handleConnectShopify = () => {
      const apiKey = import.meta.env.VITE_API_KEY;
      const scopes = 'read_products,write_products,read_orders,write_orders,read_assigned_fulfillment_orders,write_assigned_fulfillment_orders,read_fulfillments,write_fulfillments,read_merchant_managed_fulfillment_orders,write_merchant_managed_fulfillment_orders,read_third_party_fulfillment_orders,write_third_party_fulfillment_orders,read_assigned_fulfillment_orders,write_assigned_fulfillment_orders,read_locations ';
      const redirectUri = 'https://slantipfy.vercel.app' ;
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
      // after the exhanage, the access token is stored in the db. (allows access to most of the app.)
      const exchangeUrl = `https://us-central1-slant3d-shopify.cloudfunctions.net/connectShopifyStore?code=${code}&shop=${returnedShop}`;

      // After the exchange is completed
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
