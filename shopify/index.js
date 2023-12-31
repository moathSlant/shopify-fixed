// connectShopifyStore.js
const functions = require('firebase-functions');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
const Shopify = require('shopify-api-node');
require('dotenv').config();

admin.initializeApp();
const corsHandler = cors({ origin: true });

exports.redirectToShopifyOAuth = functions.https.onRequest(async (req, res) => {
  const { shop } = req.query;

  const apiKey = process.env.API_KEY;
  const scopes = 'read_orders,write_orders,write_assigned_fulfillment_orders,read_assigned_fulfillment_orders';
  const redirectUri = `https://slant3dshopconnect.com?accessToken=${access_token}&shop=${shop}`;

  if (!shop) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  const installUrl =
    `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}`;

  return res.redirect(installUrl);
});


exports.connectShopifyStore = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { code, shop } = req.query;
      const apiKey = process.env.API_KEY;
      const apiSecret = process.env.API_SECRET;

      if (!code || !shop) {
        throw new Error('Invalid request parameters');
      }

      const response = await axios.post(`https://${shop}/admin/oauth/access_token`, {
        client_id: apiKey,
        client_secret: apiSecret,
        code,
      });

      const { access_token } = response.data;

      if (!access_token) {
        throw new Error('Failed to obtain access token');
      }

      // Store the access token in your Firestore
      const db = admin.firestore();
      const docRef = db.collection('shopifyTokens').doc(shop);
      await docRef.set({ accessToken: access_token, shopName: shop });
      // `http://localhost:8080/?accessToken=${access_token}&shop=${shop}`) 
      res.redirect (`https://slant3dshopconnect.com/?accessToken=${access_token}&shop=${shop}`);
    } catch (error) {
      console.error('Error connecting Shopify store:', error);
      res.redirect(`https://slant3dshopconnect.com/?error=Failed to connect to Shopify store`);
    }
  });
});




exports.getShopifyProducts = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { shop, accessToken } = req.query;

      // Replace with your actual Shopify API credentials
      const apiKey = process.env.API_KEY;
      const apiSecret = process.env.API_SECRET;


      // Create a new Shopify instance
      const shopify = new Shopify({
        shopName: shop,
        accessToken: accessToken,
      });

      // Fetch all products from the Shopify store
      const products = await shopify.product.list();

      res.status(200).json({ message: 'Products fetched successfully', products });
    } catch (error) {
      console.error('Error fetching Shopify products:', error);
      res.status(500).json({ message: 'Error fetching Shopify products', error: error.toString() });
    }
  });
});

exports.getShopifyOrders = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { shop, accessToken, apiVersion } = req.query;

      const shopifyConfig = {
        shopName: shop,
        accessToken: accessToken,
        apiVersion: '2023-07'
      };

      if (apiVersion) {
        shopifyConfig.apiVersion = apiVersion;
      }

      const shopify = new Shopify(shopifyConfig);

      const orders = await shopify.order.list();

      res.status(200).json({ message: 'Orders fetched successfully', orders });
    } catch (error) {
      console.error('Error fetching Shopify orders:', error);
      res.status(500).json({ message: 'Error fetching Shopify orders', error: error.toString() });
    }
  });
});


// exports.createShopifyFulfillment = functions.https.onRequest((req, res) => {
//   corsHandler(req, res, async () => {
//     try {
//       const { shop, accessToken, apiVersion } = req.query;  // access query parameters here
//       const { orderId, lineItems, trackingNumber } = req.body;

//       const shopify = new Shopify({
//         shopName: shop,
//         accessToken: accessToken,
//         apiVersion: apiVersion || '2023-10'  // use the passed API version or default to '2022-04'
//       });

//       const fulfillment = {
//         location_id: '84429537558',
//         tracking_number: trackingNumber,
//         notify_customer: false,
//         line_items: lineItems
//       };

//       const response = await shopify.fulfillment.create(orderId, fulfillment);

//       res.status(200).json({ message: 'Fulfillment created successfully', fulfillment: response });
//     } catch (error) {
//       console.error('Error creating Shopify fulfillment:', error);
//       res.status(500).json({ message: 'Error creating Shopify fulfillment', error: error.toString() });
//     }
//   });
// });




