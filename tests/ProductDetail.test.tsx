import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductDetail from '../src/views/ProductDetail/ProductDetail';
import { CartProvider } from '../src/stores/CartContext';

// Mock product returned by API
const mockApiProduct = {
  id: 1,
  title: "Premium Cotton Tee",
  price: 29.99,
  description: "A premium cotton t-shirt built for comfort.",
  category: "men's clothing",
  image: "https://fakestoreapi.com/img/1.jpg",
  rating: { rate: 4.2, count: 100 }
};

describe('ProductDetail & VariantSelector Tests', () => {
  beforeEach(() => {
    // Reset fetch mocks
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiProduct),
      })
    ));
  });

  const renderComponent = () => {
    return render(
      <CartProvider>
        <MemoryRouter initialEntries={['/product/1']}>
          <Routes>
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </MemoryRouter>
      </CartProvider>
    );
  };

  it('renders product details correctly after fetching', async () => {
    renderComponent();

    // Verify loading screen is shown initially, then disappears
    expect(screen.getByText(/Loading product details/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Premium Cotton Tee')).toBeInTheDocument();
    });

    expect(screen.getByText('VeloSport')).toBeInTheDocument(); // Deterministic brand for ID 1 (1 % 4 = 1)
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText(/A premium cotton t-shirt/)).toBeInTheDocument();
  });

  it('displays correct stock states for sizes', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Premium Cotton Tee')).toBeInTheDocument();
    });

    // Our deterministic mock stock logic maps ID 1, Color 'Navy Blue', and sizes to stock.
    // Let's verify size text renders in the document with exact matching names
    expect(screen.getByText(/^S$/)).toBeInTheDocument();
    expect(screen.getByText(/^M$/)).toBeInTheDocument();
    expect(screen.getAllByText(/^L$/).length).toBeGreaterThan(0); // L is selected by default, so it appears twice
    expect(screen.getByText(/^XL$/)).toBeInTheDocument();
    expect(screen.getByText(/^XXL$/)).toBeInTheDocument();
  });

  it('caps the quantity picker based on variant stock and handles increments', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Premium Cotton Tee')).toBeInTheDocument();
    });

    // Select size XL (which has 4 left)
    const sizeBtnXL = screen.getByText(/^XL$/);
    await user.click(sizeBtnXL);

    // Find the quantity value
    const qtyVal = screen.getByText('1');
    expect(qtyVal).toBeInTheDocument();

    // Verify the stock count notice says "Only 4 items left!"
    expect(screen.getByText(/Only 4 items left!/i)).toBeInTheDocument();

    // Click the increment (+) button 3 times to reach 4
    const plusBtn = screen.getByRole('button', { name: /increase quantity/i });
    
    await user.click(plusBtn);
    await user.click(plusBtn);
    await user.click(plusBtn);
    
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(plusBtn).toBeDisabled(); // Should be disabled now that we reached max stock (4)
  });

  it('disables the CTA button when a sold out variant is selected', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Premium Cotton Tee')).toBeInTheDocument();
    });

    // XXL is sold out for ID 1 / Navy Blue
    const sizeBtnXXL = screen.getByText(/^XXL$/);
    await user.click(sizeBtnXXL);

    // Verify the stock tag shows "Out of Stock"
    expect(screen.getByText(/Out of Stock/i)).toBeInTheDocument();

    // Verify the quantity picker shows 0 and plus/minus are disabled
    expect(screen.getByText('0')).toBeInTheDocument();
    const plusBtn = screen.getByRole('button', { name: /increase quantity/i });
    const minusBtn = screen.getByRole('button', { name: /decrease quantity/i });
    expect(plusBtn).toBeDisabled();
    expect(minusBtn).toBeDisabled();

    // Add to cart CTA button should be disabled and show "Sold Out Variant"
    const addBtn = screen.getByRole('button', { name: /Sold Out Variant/i });
    expect(addBtn).toBeDisabled();
  });
});
