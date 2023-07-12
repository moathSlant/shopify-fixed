import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const ShopifyContext = React.createContext();

export const ShopifyProvider = ({ children }) => {
  const [isShopifyConnected, setIsShopifyConnected] = useState(false);
  const [shop, setShop] = useState('');

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      setIsShopifyConnected(true);
      console.log('Access Token:', accessToken);
      getShopFromFirestore(accessToken);
    }
  }, []);

  const getShopFromFirestore = async (accessToken) => {
    try {
      const q = query(collection(db, 'shopifyTokens'), where('accessToken', '==', accessToken));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Assuming there's only one matching document
        const document = querySnapshot.docs[0];
        const shopname = document.data().shopName;  // Fetch shopname from the document data
        setShop(shopname);
        console.log('Shop:', shopname);
      } else {
        // setShop('quick-start-e59b37dd.myshopify.com');
        console.log('No document found with the given access token');
      }
    } catch (error) {
      console.error('Error retrieving shop from Firestore:', error);
    }
  };
  

  const handleConnectShopify = (accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    setIsShopifyConnected(true);
    console.log('Access Token:', accessToken);
    getShopFromFirestore(accessToken);
  };

  const handleDisconnectShopify = () => {
    localStorage.removeItem('accessToken');
    setIsShopifyConnected(false);
    setShop(''); // Clear the shop value
  };

  return (
    <ShopifyContext.Provider
      value={{
        isShopifyConnected,
        setIsShopifyConnected,
        shop,
        setShop,
        accessToken: localStorage.getItem('accessToken'), // Add this line
        handleConnectShopify,
        handleDisconnectShopify,
      }}
    >
      {children}
    </ShopifyContext.Provider>
  );
};

export default ShopifyContext;
