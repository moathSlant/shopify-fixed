import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';

const stripeService = {
  getCustomerId: async (uid) => {
    try {
      const userDoc = await doc(db, 'users', uid);
      const userSnap = await getDoc(userDoc);
      const userData = userSnap.data();

      if (userData && userData.customerId) {
        return userData.customerId;
      }

      return null;
    } catch (error) {
      console.error('Error retrieving customer ID:', error);
      throw new Error('Failed to retrieve customer ID');
    }
  },
  getCustomerData: async (customerId) => {
    try {
      const response = await axios.get('https://us-central1-slant3d-shopify.cloudfunctions.net/getCustomer', {
        params: {
          customerId: customerId,
        },
      });

      const { success, customer } = response.data;

      if (success) {
        return customer;
      }

      return null;
    } catch (error) {
      console.error('Error retrieving customer data:', error);
      throw new Error('Failed to retrieve customer data');
    }
  },
};

export default stripeService;
