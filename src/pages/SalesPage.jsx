import React, { useContext, useEffect, useState } from 'react';
import ShopifyContext from '../context/ShopifyContext';

const SalesPage = () => {
  const { shop, accessToken } = useContext(ShopifyContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchShopifyOrders = async () => {
      try {
        const response = await fetch(
          `https://us-central1-slant3d-shopify.cloudfunctions.net/getShopifyOrders?shop=${shop}&accessToken=${accessToken}&apiVersion=2023-07`
        );
        const data = await response.json();
        console.log('Shopify Orders:', data);
        setOrders(data.orders || []);  
      } catch (error) {
        console.error('Error fetching Shopify orders:', error);
      }
    };

    fetchShopifyOrders();
  }, [shop, accessToken]);

  return (
    <div>
      <div>
      {orders.map(order => (
  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
    {order.line_items?.[0]?.variant?.image?.src && (
      <img src={order.line_items[0].variant.image.src} alt="order" style={{ width: '100px', height: '100px' }} />
    )}
    <p>ID: {order.id}</p>
    <p>Price: ${order.total_price}</p>
    <p>Quantity: {order.line_items.reduce((total, item) => total + item.quantity, 0)}</p>
    <p><a target='_blank' rel='noopener noreferrer' href={order.order_status_url} style={{ textDecoration: 'underline' }}>Status</a></p>
  </div>
))}

      </div>
    </div>
  );
};


export default SalesPage;
