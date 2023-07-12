import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import ShopifyContext from '../context/ShopifyContext';
import ProductCard from '../components/ProductCard';
import { PropagateLoader } from 'react-spinners';
import CreateCustomerForm from '../components/createCustomer';

const ProductPage = () => {
const { shop, accessToken } = useContext(ShopifyContext);
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
const fetchData = async () => {
if (shop && accessToken) {
try {
const response = await axios.get('https://us-central1-slant3d-shopify.cloudfunctions.net/getShopifyProducts', {
params: {
shop: shop,
accessToken: accessToken,
},
});


      const fetchedProducts = response.data.products;
      console.log('Shopify Products:', fetchedProducts);
      setProducts(fetchedProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Shopify products:', error);
      setLoading(false);
    }
  }
};

fetchData();
}, [shop, accessToken]);

return (
<div className="pt-3 px-3 row">
{/* <CreateCustomerForm/> */}

{loading ? (
<div className="text-center">
<PropagateLoader color="#000000" size={15} />
</div>
) : (
products.map((product) => <ProductCard key={product.id} product={product} />)
)}
</div>
);
};

export default ProductPage;