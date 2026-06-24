import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './stores/CartContext';
import Navbar from './components/Navbar/Navbar';
import CartDrawer from './components/CartDrawer/CartDrawer';
import ToastList from './components/Toast/ToastList';
import ProductListing from './views/ProductListing/ProductListing';
import ProductDetail from './views/ProductDetail/ProductDetail';

const App: React.FC = () => {
  return (
    <CartProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          
          <main style={{ flex: 1, paddingBottom: '4rem' }}>
            <Routes>
              <Route path="/" element={<ProductListing />} />
              <Route path="/product/:id" element={<ProductDetail />} />
            </Routes>
          </main>
          
          <CartDrawer />
          <ToastList />
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
