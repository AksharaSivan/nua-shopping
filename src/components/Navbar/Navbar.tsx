import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../stores/CartContext';
import { ShoppingCart } from 'lucide-react';
import styles from './Navbar.module.scss';

const Navbar: React.FC = () => {
  const { items, openCart } = useCart();
  const [bounce, setBounce] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Trigger bounce animation when item count changes
  useEffect(() => {
    if (totalItems === 0) return;
    setBounce(true);
    const timer = setTimeout(() => setBounce(false), 300);
    return () => clearTimeout(timer);
  }, [totalItems]);

  return (
    <header className={styles.header}>
      <div className={`${styles.navContainer} container`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoGradient}>Nua</span>
          <span className={styles.logoText}>Shop</span>
        </Link>

        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>Shop</Link>
          <a href="#" className={styles.navLink} onClick={(e) => { e.preventDefault(); }}>Categories</a>
          <a href="#" className={styles.navLink} onClick={(e) => { e.preventDefault(); }}>Deals</a>
        </div>

        <div className={styles.navActions}>
          <button
            onClick={openCart}
            className={`${styles.cartBtn} ${bounce ? styles.bounce : ''}`}
            aria-label="Open Cart"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className={styles.cartBadge}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
