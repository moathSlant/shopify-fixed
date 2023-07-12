import React from 'react';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import FilesPage from './pages/FilesPage';
import SalesPage from './pages/SalesPage';
import ConnectToShopify from './components/ConnectToShopify';
import { UserInfoPage } from './pages/UserInfoPage';
// import ProtectedRoute from './utils/ProtectedRoute';

const routes = [
  {
    path: '/',
    element: <ProductPage />,
    exact: true,
  },
  {
    path: '/products',
    element: (
      <ProductPage />
    ),
    exact: true,
  },
  {
    path: '/files',
    element: (
      <FilesPage />
    ),
    exact: true,
  },
  {
    path: '/sales',
    element: (
      <SalesPage />
    ),
    exact: true,
  },
  {
    path: '/userinfo',
    element: (
      <UserInfoPage/>
    ),
    exact: true,
  },
  {
    path: '/connect-to-shopify',
    element: <ConnectToShopify />,
    exact: true,
  },
];

export default routes;
