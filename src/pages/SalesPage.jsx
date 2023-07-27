import React, { useContext, useEffect, useState } from 'react';
import ShopifyContext from '../context/ShopifyContext';
import axios from 'axios';

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
        {orders.map(order => {
          const imageUrl = order.line_items[0]?.variant?.image?.src;
          const orderDate = new Date(order.created_at);
          const formattedDate = `${orderDate.getFullYear()}-${orderDate.getMonth()+1}-${orderDate.getDate()}`;
          const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.total_price);
          console.log(imageUrl)
          return (
            <div key={order.id} style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
              {imageUrl && (
                <img src={imageUrl} alt="order item" style={{ width: '100px', height: '100px' }} />
              )}
              <p>ID: {order.id}</p>
              <p>Date: {formattedDate}</p>
              <p>Income: {formattedPrice}</p>
              <p>Quantity: {order.line_items.reduce((total, item) => total + item.quantity, 0)}</p>
              <p><a target='_blank' rel='noopener noreferrer' href={order.order_status_url} style={{ textDecoration: 'underline' }}>Order Summary</a></p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SalesPage;
