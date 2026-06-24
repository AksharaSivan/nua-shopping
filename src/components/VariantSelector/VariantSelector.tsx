import React from 'react';
import type { ProductColor, VariantStock } from '../../data/mockEnrichment';
import { Check } from 'lucide-react';
import styles from './VariantSelector.module.scss';

interface VariantSelectorProps {
  colors: ProductColor[];
  sizes: string[];
  selectedColor: ProductColor;
  selectedSize: string;
  onSelectColor: (color: ProductColor) => void;
  onSelectSize: (size: string) => void;
  stock: VariantStock[];
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onSelectColor,
  onSelectSize,
  stock
}) => {
  return (
    <div className={styles.container}>
      {/* Colors Section */}
      <div className={styles.section}>
        <div className={styles.labelRow}>
          <span className={styles.label}>Colour</span>
          <span className={styles.value}>{selectedColor.name}</span>
        </div>
        <div className={styles.colorGrid} role="radiogroup" aria-label="Select color">
          {colors.map((color) => {
            const isSelected = color.name === selectedColor.name;
            // Check if all sizes in this color are sold out
            const isColorFullySoldOut = stock
              .filter((v) => v.color === color.name)
              .every((v) => v.quantity === 0);

            return (
              <button
                key={color.name}
                onClick={() => onSelectColor(color)}
                className={`${styles.colorBtn} ${isSelected ? styles.selectedColor : ''} ${
                  isColorFullySoldOut ? styles.colorSoldOut : ''
                }`}
                style={{ '--swatch-color': color.value } as React.CSSProperties}
                title={color.name + (isColorFullySoldOut ? ' (Out of stock)' : '')}
                role="radio"
                aria-checked={isSelected}
              >
                {isSelected && <Check size={14} className={styles.checkIcon} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes Section */}
      <div className={styles.section}>
        <div className={styles.labelRow}>
          <span className={styles.label}>Size</span>
          <span className={styles.value}>
            {selectedSize || 'Select a size'}
          </span>
        </div>
        <div className={styles.sizeGrid} role="radiogroup" aria-label="Select size">
          {sizes.map((size) => {
            const isSelected = size === selectedSize;
            
            // Find stock item for this color-size combination
            const stockItem = stock.find(
              (v) => v.color === selectedColor.name && v.size === size
            );
            
            const quantity = stockItem ? stockItem.quantity : 0;
            const isSoldOut = quantity === 0;
            const isLowStock = quantity > 0 && quantity <= 4;

            let sizeStateClass = styles.available;
            let badgeText = '';

            if (isSoldOut) {
              sizeStateClass = styles.soldOut;
              badgeText = 'Sold Out';
            } else if (isLowStock) {
              sizeStateClass = styles.lowStock;
              badgeText = `${quantity} left`;
            }

            return (
              <button
                key={size}
                onClick={() => onSelectSize(size)}
                className={`${styles.sizeBtn} ${isSelected ? styles.selectedSize : ''} ${sizeStateClass}`}
                role="radio"
                aria-checked={isSelected}
              >
                <span className={styles.sizeName}>{size}</span>
                {badgeText && (
                  <span className={styles.stockBadge}>{badgeText}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VariantSelector;
