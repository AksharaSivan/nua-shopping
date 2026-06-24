import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../stores/CartContext';
import type { EnrichedProduct } from '../../data/mockEnrichment';
import { Loader, ShoppingCart } from 'lucide-react';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: EnrichedProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const { id, title, price, originalPrice, brand, image, colors, sizes, stock } = product;

  // Find the first available variant (or default to the first variant if all sold out)
  const defaultColor = colors[0];
  let defaultSize = sizes[0];
  
  // Find first size for default color that has stock
  const availableVariant = stock.find(v => v.color === defaultColor.name && v.quantity > 0);
  if (availableVariant) {
    defaultSize = availableVariant.size;
  }

  const currentVariantStock = stock.find(
    v => v.color === defaultColor.name && v.size === defaultSize
  );
  
  // Check if ALL variants are sold out
  const isFullySoldOut = stock.every(v => v.quantity === 0);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page when clicking the button
    if (isFullySoldOut || isAdding) return;

    setIsAdding(true);
    await addToCart({
      productId: id,
      title,
      price,
      brand,
      image,
      color: defaultColor.name,
      colorHex: defaultColor.value,
      filterClass: defaultColor.filterClass,
      size: defaultSize,
      maxStock: currentVariantStock?.quantity || 10
    }, 1);
    setIsAdding(false);
  };

  return (
    <div className={`${styles.card} glass-panel`}>
      <Link to={`/product/${id}`} className={styles.imageLink}>
        <div className={styles.imageWrapper}>
          <img
            src={image}
            alt={title}
            className={`${styles.image} ${defaultColor.filterClass}`}
            loading="lazy"
          />
          {originalPrice && (
            <span className={styles.saleBadge}>Sale</span>
          )}
          {isFullySoldOut && (
            <div className={styles.soldOutOverlay}>
              <span>Sold Out</span>
            </div>
          )}
        </div>
      </Link>

      <div className={styles.info}>
        <span className={styles.brand}>{brand}</span>
        
        <Link to={`/product/${id}`} className={styles.titleLink}>
          <h3 className={styles.title} title={title}>{title}</h3>
        </Link>

        <div className={styles.footerRow}>
          <div className={styles.priceContainer}>
            {originalPrice && (
              <span className={styles.originalPrice}>${originalPrice.toFixed(2)}</span>
            )}
            <span className={styles.price}>${price.toFixed(2)}</span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isFullySoldOut || isAdding}
            className={styles.quickAddBtn}
            aria-label={isFullySoldOut ? "Sold Out" : "Quick Add to Cart"}
            title={isFullySoldOut ? "Sold Out" : "Quick Add to Cart"}
          >
            {isAdding ? (
              <Loader size={18} className={styles.spinner} />
            ) : (
              <ShoppingCart size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
