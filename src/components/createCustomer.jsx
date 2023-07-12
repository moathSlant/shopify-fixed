import React, { useContext, useEffect, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import stripeService from '../services/stripeService';

const CreateCustomerForm = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    country: '',
    postal_code: ''
  });
  const [phone, setPhone] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState('');

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
      fetchCustomerData(user.uid);
    }
  }, [user]);

  const fetchCustomerData = async (uid) => {
    try {
      const customerId = await stripeService.getCustomerId(uid);
      if (customerId) {
        const customer = await stripeService.getCustomerData(customerId);
        setCustomerId(customerId);
        setCustomerData(customer);
        console.log(customer);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      let paymentMethodId = '';

      if (paymentMethod === 'card') {
        const cardElement = elements.getElement(CardElement);

        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        paymentMethodId = paymentMethod.id;
      }

      const response = await axios.post('https://us-central1-slant3d-shopify.cloudfunctions.net/createCustomer', {
        email,
        name,
        address,
        paymentMethodId,
        phone,
        userId,
      });

      const { success, customerId, message } = response.data;

      if (success) {
        setCustomerId(customerId);
        setError('');
      } else {
        setCustomerId('');
        setError(message);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      setCustomerId('');
      setError('Failed to create customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-4">Connect to Stripe</h2>
      {error && <p className="text-red-500">Error: {error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">Email:</label>
          <input
            id="email"
            type="email"
            value={customerData ? customerData.email : email}
            onChange={(e) => setCustomerData ? setCustomerData({ ...customerData, email: e.target.value }) : setEmail(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="name" className="block mb-1">Name:</label>
          <input
            id="name"
            type="text"
            value={customerData ? customerData.name : name}
            onChange={(e) => setCustomerData ? setCustomerData({ ...customerData, name: e.target.value }) : setName(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="address-line1" className="block mb-1">Address Line 1:</label>
          <input
            id="address-line1"
            type="text"
            value={customerData ? customerData.address.line1 : address.line1}
            onChange={(e) => {
              if (setCustomerData) {
                setCustomerData({ ...customerData, address: { ...customerData.address, line1: e.target.value } });
              } else {
                setAddress({ ...address, line1: e.target.value });
              }
            }}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="address-line2" className="block mb-1">Address Line 2:</label>
          <input
            id="address-line2"
            type="text"
            value={customerData ? customerData.address.line2 : address.line2}
            onChange={(e) => {
              if (setCustomerData) {
                setCustomerData({ ...customerData, address: { ...customerData.address, line2: e.target.value } });
              } else {
                setAddress({ ...address, line2: e.target.value });
              }
            }}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="city" className="block mb-1">City:</label>
          <input
            id="city"
            type="text"
            value={customerData ? customerData.address.city : address.city}
            onChange={(e) => {
              if (setCustomerData) {
                setCustomerData({ ...customerData, address: { ...customerData.address, city: e.target.value } });
              } else {
                setAddress({ ...address, city: e.target.value });
              }
            }}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="country" className="block mb-1">Country:</label>
          <input
            id="country"
            type="text"
            value={customerData ? customerData.address.country : address.country}
            onChange={(e) => {
              if (setCustomerData) {
                setCustomerData({ ...customerData, address: { ...customerData.address, country: e.target.value } });
              } else {
                setAddress({ ...address, country: e.target.value });
              }
            }}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="postal-code" className="block mb-1">Postal Code:</label>
          <input
            id="postal-code"
            type="text"
            value={customerData ? customerData.address.postal_code : address.postal_code}
            onChange={(e) => {
              if (setCustomerData) {
                setCustomerData({ ...customerData, address: { ...customerData.address, postal_code: e.target.value } });
              } else {
                setAddress({ ...address, postal_code: e.target.value });
              }
            }}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        {paymentMethod === 'card' ? (
  <div>
    <label htmlFor="card-details" className="block mb-1">Card Details:</label>
    <CardElement
      id="card-details"
      options={{
        style: {
          base: {
            fontSize: '16px',
            border: '1px solid #D1D5DB',
            borderRadius: '0.375rem',
            padding: '0.5rem',
          },
        },
      }}
    />
  </div>
) : (
  <div>
    <label htmlFor="last-four-digits" className="block mb-1">Last 4 Digits:</label>
    <p id="last-four-digits" className="border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500">
      {customerData && customerData.card ? `Last 4 Digits: ${customerData.card.last4}` : 'nun'}
    </p>
  </div>
)}
        <div>
          <label htmlFor="phone" className="block mb-1">Phone:</label>
          <input
            id="phone"
            type="text"
            value={customerData ? customerData.phone : phone}
            onChange={(e) => {
              if (setCustomerData) {
                setCustomerData({ ...customerData, phone: e.target.value });
              } else {
                setPhone(e.target.value);
              }
            }}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="payment-method" className="block mb-1">Payment Method:</label>
          <select
            id="payment-method"
            value={paymentMethod}
            onChange={handlePaymentMethodChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500"
          >
            <option value="card">Card</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-black text-white rounded-md py-2 px-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Customer...' : 'Create Customer'}
        </button>
      </form>
    </div>
  );
};

export default CreateCustomerForm;