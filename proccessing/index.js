const axios = require('axios');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const util = require('util');
const exists = util.promisify(fs.exists);
const unlink = util.promisify(fs.unlink);
const mkdir = util.promisify(fs.mkdir);
const FormData = require('form-data');
const https = require('https');
const serviceAccount = require("./slant3d-shopify-firebase-adminsdk-knmkx-80fb30db49.json");
const dotenv = require('dotenv');
const stripe = require('stripe')('your-stripe-secret-key');

dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const processedOrdersRef = db.collection('processedOrders');

const downloadFile = async (url, dest) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
        await mkdir(dir, { recursive: true });
    }
    const file = fs.createWriteStream(dest);
    return new Promise((resolve, reject) => {
        https.get(url, response => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve(true));
            });
        }).on('error', err => {
            fs.unlink(dest);
            reject(err.message);
        });
    });
};

const sendMatchedProductToApi = async (matchedProduct, order, item, customerInfo) => {
    const productIdString = item.product_id.toString();
    const filename = `${matchedProduct.filename}-${productIdString}-${order.id}.stl`; // Include order ID in the filename
    const fileUrl = matchedProduct.fileUrl;
    const localFilePath = path.join(__dirname, 'uploads', filename);
    let file;
    try {
        console.log(`[Order ${order.id}] Downloading STL file for product ${productIdString}...`);
        await downloadFile(fileUrl, localFilePath);

        // Prepare form data
        const form = new FormData();
        file = fs.createReadStream(localFilePath);
        form.append('uploaded_file', file); 
        form.append('name', customerInfo.first_name || 'moath');
        form.append('phone', customerInfo.phone || 190871520);
        form.append('order_quantity', item.quantity || '2');
        form.append('order_item_name', item.name || 'snow');
        form.append('order_item_color', 'black'); 
        form.append('email', customerInfo.email || 'moathabdulrazak12@gmail.com');
        form.append('bill_to_street_1', order.billing_address.address1 || '2419 w fairview');
        form.append('bill_to_street_2', order.billing_address.address2 || '');
        form.append('bill_to_street_3', '');
        form.append('bill_to_city', order.billing_address.city || 'boise');
        form.append('bill_to_state', 'id');
        form.append('bill_to_zip', 83702);
        form.append('bill_to_country_as_iso', (order.billing_address.country_code || 'us').toLowerCase());
        form.append('bill_to_is_US_residential', 'true');
        form.append('ship_to_name', customerInfo.first_name || '');
        form.append('ship_to_street_1', order.shipping_address.address1 || '2419 w fairview');
        form.append('ship_to_street_2', order.shipping_address.address2 || '');
        form.append('ship_to_street_3', '');
        form.append('ship_to_city', order.shipping_address.city || 'boise');
        form.append('ship_to_state', 'id');
        form.append('ship_to_zip', 83702);
        form.append('ship_to_country_as_iso', (order.shipping_address.country_code || 'us').toLowerCase());
        form.append('ship_to_is_US_residential', 'true');
        console.log(`[Order ${order.id}] Sending product ${productIdString} to API...`);
        const apiResponse = await axios.post(
            'http://localhost:3001/api2/public/order',
            form,
            { headers: { ...form.getHeaders(), 'api_key': '80jkdjfj9832yfjld' } }
        );

        console.log(`[Order ${order.id}] API response: ${JSON.stringify(apiResponse.data, null, 2)}`);

        // Here is where you'd get the ShipStation order ID
        const shipStationOrderId = apiResponse.data.orderId;

        try {
            const shipStationResponse = await axios.get(
                `http://localhost:3001/api2/public/order/${shipStationOrderId}/shipping-details`,
                { headers: { 'api_key': '80jkdjfj9832yfjld' } }
            );
            console.log(`[Order ${order.id}] ShipStation response: ${JSON.stringify(shipStationResponse.data, null, 2)}`);

            // Now you can check the order status
            if (shipStationResponse.data.orderStatus === 'shipped') {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: item.price * 100,  // Stripe expects amounts in cents
                    currency: 'usd',
                    description: `Payment for product ${productIdString} for order ${order.id}`,
                    metadata: {
                        order_id: order.id,
                    },
                });

                console.log(`[Order ${order.id}] Payment Intent created: ${JSON.stringify(paymentIntent, null, 2)}`);
            }
        } catch (shipStationError) {
            console.error(`[Order ${order.id}] Error getting shipping details from ShipStation: ${shipStationError}`);
        }
    } catch (apiError) {
        console.error(`[Order ${order.id}] Error sending product to API: ${apiError}`);
    } finally {
        if (file) {
            file.on('close', async () => {
                if (await exists(localFilePath)) {
                    await unlink(localFilePath);
                    console.log(`[Order ${order.id}] Deleted local STL file for product ${productIdString}.`);
                }
            });
        }
    }
};

async function fetchShopifyOrders() {
    const res = await fetch('https://us-central1-slant3d-shopify.cloudfunctions.net/getShopifyOrders?shop=quick-start-e59b37dd.myshopify.com&accessToken=shpua_61ab12c12becd31eaa843e0fb758ffbc&apiVersion=2023-07');
    const data = await res.json();
    return data.orders;
}

async function getProductFromFirestore(productId) {
    const productsRef = db.collection('matchedProducts');
    const snapshot = await productsRef.where('productId', '==', productId).get();
    if (snapshot.empty) {
        console.log(`No match found for product ${productId}.`);
        return null;
    } else {
        const doc = snapshot.docs[0];
        return doc.data();
    }
}
async function getAllMatchedProducts() {
  const matchedProductsRef = db.collection('matchedProducts');
  const snapshot = await matchedProductsRef.get();
  const matchedProducts = [];
  snapshot.forEach((doc) => {
    matchedProducts.push(doc.data());
  });
  return matchedProducts;
}

async function processOrders() {
  const orders = await fetchShopifyOrders();
  const matchedProducts = await getAllMatchedProducts(); // New function to fetch all matched products

  for (let order of orders) {
    const orderId = order.id.toString();  // convert orderId to string

    // Check if the order has already been processed
    const processedOrderSnapshot = await processedOrdersRef.doc(orderId).get();
    if (processedOrderSnapshot.exists) {
      console.log(`Order ${orderId} already processed, skipping.`);
      continue;  // Skip to the next order if this one is already processed
    }

    console.log(`Processing order ${orderId}...`);

    for (let lineItem of order.line_items) {
      const productId = lineItem.product_id;
      const matchedProduct = matchedProducts.find(product => product.productId === productId);

      if (matchedProduct) {
        console.log(`Product ${productId} matched!`);
        await sendMatchedProductToApi(matchedProduct, order, lineItem, order.customer);

        // After processing the order, add it to the Firestore 'processedOrders' collection
        await processedOrdersRef.doc(orderId).set({
          orderId: orderId,
          productId: matchedProduct.productId,
          processed: true
        });

        console.log(`Order ${orderId} with product ${productId} has been successfully processed and sent to API.`);
        break; // We stop after the first match since the order has been processed
      }
    }
  }

  console.log("Finished processing all orders.");
}


processOrders();


