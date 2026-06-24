import React, { useEffect, useRef } from 'react';
import { useCart } from '../../stores/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import styles from './CartDrawer.module.scss';

const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };

    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingThreshold = 100;
  const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 9.99;
  const grandTotal = subtotal + shippingCost;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isCartOpen ? styles.showBackdrop : ''}`}
        onClick={closeCart}
      />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${isCartOpen ? styles.open : ''}`}
        aria-modal="true"
        role="dialog"
        aria-label="Shopping Cart"
      >
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <ShoppingBag size={20} />
            <h2>Your Cart</h2>
            <span className={styles.countBadge}>{items.length}</span>
          </div>
          <button onClick={closeCart} className={styles.closeBtn} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconContainer}>
                <ShoppingBag size={48} className={styles.emptyIcon} />
              </div>
              <h3>Your cart is empty</h3>
              <p>Add items from the store to start shopping.</p>
              <button onClick={closeCart} className={styles.shopBtn}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {items.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.imageContainer}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`${styles.itemImage} ${item.filterClass}`}
                    />
                  </div>

                  <div className={styles.details}>
                    <span className={styles.brand}>{item.brand}</span>
                    <h4 className={styles.title}>{item.title}</h4>
                    
                    <div className={styles.meta}>
                      <span className={styles.colorTag}>
                        <span
                          className={styles.colorSwatch}
                          style={{ backgroundColor: item.colorHex }}
                        />
                        {item.color}
                      </span>
                      <span className={styles.sizeTag}>Size: {item.size}</span>
                    </div>

                    <div className={styles.priceRow}>
                      <span className={styles.price}>${item.price.toFixed(2)}</span>
                      
                      <div className={styles.quantityPicker}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className={styles.qtyBtn}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className={styles.qtyVal}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className={styles.qtyBtn}
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className={styles.removeBtn}
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.billSummary}>
              <div className={styles.billRow}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.billRow}>
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className={styles.freeShipping}>FREE</span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              {shippingCost > 0 && (
                <div className={styles.shippingPromo}>
                  Spend <strong>${(shippingThreshold - subtotal).toFixed(2)}</strong> more for FREE shipping!
                </div>
              )}
              <hr className={styles.divider} />
              <div className={`${styles.billRow} ${styles.totalRow}`}>
                <span>Grand Total</span>
                <span className={styles.grandTotalVal}>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => alert('Checkout demo: order submitted!')}
              className={styles.checkoutBtn}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
