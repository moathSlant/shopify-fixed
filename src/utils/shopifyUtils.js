// shopifyUtils.js
import createApp from '@shopify/app-bridge';
import { getSessionToken, isSessionTokenValid } from '@shopify/app-bridge-utils';

// Create the app instance
const app = createApp({
  apiKey: '4f72768a57fa8a47af16143cbdccfe91',
  host: 'YOUR_SHOPIFY_SHOP_DOMAIN',
});

// Function to check if the user is authenticated
export const checkAuthentication = async (apiKey) => {
  try {
    const sessionToken = await getSessionToken(app);
    const validSessionToken = isSessionTokenValid(sessionToken);
    return validSessionToken;
  } catch (error) {
    console.error('Error checking authentication:', error);
    throw error;
  }
};
