const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);
const cors = require('cors')({ origin: true });

admin.initializeApp();

exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
      const { paymentMethodId, totalPrice, customerId } = req.body;
  
      try {
        // Create a payment intent
        const paymentIntentParams = {
          amount: totalPrice , // Stripe requires the amount to be in cents
          currency: 'usd',
          payment_method: paymentMethodId,
          confirm: true,
          customer: customerId, // Include the customer ID
        };
  
        const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
  
        res.json({ paymentIntentId: paymentIntent.id });
      } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'An error occurred while creating the payment intent.' });
      }
    });
  });
  
  exports.createCustomer = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
      const { email, name, address, paymentMethodId, userId, phone } = req.body;
      const { country } = address;
  
      try {
        const userDocRef = admin.firestore().collection('users').doc(String(userId));
        const userDoc = await userDocRef.get();
  
        if (userDoc.exists && userDoc.data().customerId) {
          res.status(200).json({ success: true, customerId: userDoc.data().customerId });
        } else {
          const customer = await stripe.customers.create({
            email: email,
            name: name,
            address: {
              country: country,
              ...address,
            },
            phone: phone,
          });
  
          // Check if paymentMethodId exists
          if (paymentMethodId) {
            // Attach the payment method to the newly created customer
            await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
  
            // Update the customer's default payment method
            await stripe.customers.update(customer.id, {
              invoice_settings: {
                default_payment_method: paymentMethodId,
              },
            });
          }
  
          await userDocRef.set({
            customerId: customer.id,
          }, { merge: true });
  
          res.status(200).json({ success: true, customerId: customer.id });
        }
      } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ success: false, message: error.message });
      }
    });
  });







exports.getCustomer = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { customerId } = req.query; // We get the customerId from the query parameters

    try {
      const customer = await stripe.customers.retrieve(customerId, {
        expand: ['invoice_settings.default_payment_method'], // Expand this field to get more info
      }); // Retrieve customer data from Stripe
      res.status(200).json({ success: true, customer });
    } catch (error) {
      console.error('Error getting customer:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
});
