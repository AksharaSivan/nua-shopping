import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { enrichProduct } from '../../data/mockEnrichment';
import type { EnrichedProduct, ProductColor } from '../../data/mockEnrichment';
import { useCart } from '../../stores/CartContext';
import VariantSelector from '../../components/VariantSelector/VariantSelector';
import { ArrowLeft, Star, Minus, Plus, Loader, ShieldCheck, Truck } from 'lucide-react';
import styles from './ProductDetail.module.scss';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [product, setProduct] = useState<EnrichedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selected variant state
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  
  // Active view in image gallery (thumbnail)
  const [activeViewId, setActiveViewId] = useState('default');
  const [isAdding, setIsAdding] = useState(false);

  const { addToCart } = useCart();

  // 1. Fetch and Enrich Product Data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to load product detail: ${response.status}`);
        }
        const data = await response.json();
        if (!data) {
          throw new Error('Product not found.');
        }
        const enriched = enrichProduct(data);
        setProduct(enriched);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error occurred while loading product.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // 2. Rehydrate Variant from URL or choose first available
  useEffect(() => {
    if (!product) return;

    // Read parameters from URL
    const urlColorName = searchParams.get('color');
    const urlSize = searchParams.get('size');

    let initialColor = product.colors.find(c => c.name === urlColorName);
    let initialSize = product.sizes.find(s => s === urlSize);

    // Fallbacks if not provided or invalid
    if (!initialColor) {
      // Find first color that has some stock
      initialColor = product.colors[0];
    }

    if (!initialSize) {
      // Try to find first size that has stock for selected color
      const colorStock = product.stock.filter(v => v.color === initialColor?.name);
      const inStockSize = colorStock.find(v => v.quantity > 0);
      initialSize = inStockSize ? inStockSize.size : product.sizes[0];
    }

    setSelectedColor(initialColor);
    setSelectedSize(initialSize);

    // Reflect selection back to URL query string
    setSearchParams(
      { color: initialColor.name, size: initialSize },
      { replace: true }
    );
  }, [product, searchParams, setSearchParams]);

  // 3. Keep URL search parameters updated when selection changes
  const handleSelectColor = (color: ProductColor) => {
    setSelectedColor(color);
    // Find if current size is in stock for new color. If not, auto-select first in stock size
    const newColorStock = product?.stock.filter(v => v.color === color.name) || [];
    const sizeStock = newColorStock.find(v => v.size === selectedSize);
    
    let targetSize = selectedSize;
    if (!sizeStock || sizeStock.quantity === 0) {
      const firstAvailableSize = newColorStock.find(v => v.quantity > 0);
      if (firstAvailableSize) {
        targetSize = firstAvailableSize.size;
        setSelectedSize(targetSize);
      }
    }
    
    setSearchParams({ color: color.name, size: targetSize });
    setQuantity(1); // Reset quantity selector on variant change
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    if (selectedColor) {
      setSearchParams({ color: selectedColor.name, size });
    }
    setQuantity(1); // Reset quantity selector on variant change
  };

  if (loading) {
    return (
      <div className={`${styles.loadingWrapper} container`}>
        <Loader size={40} className={styles.spinner} />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product || !selectedColor) {
    return (
      <div className={`${styles.errorWrapper} container`}>
        <div className={`${styles.errorCard} glass-panel`}>
          <h2>Oops! Something went wrong</h2>
          <p>{error || 'Product not found.'}</p>
          <Link to="/" className={styles.backHomeBtn}>
            <ArrowLeft size={16} />
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  // Stock check for active variant
  const activeVariantStock = product.stock.find(
    v => v.color === selectedColor.name && v.size === selectedSize
  );
  
  const stockCount = activeVariantStock ? activeVariantStock.quantity : 0;
  const isSoldOut = stockCount === 0;
  const isLowStock = stockCount > 0 && stockCount <= 4;

  const handleAddToCart = async () => {
    if (isSoldOut || isAdding) return;

    setIsAdding(true);
    await addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      brand: product.brand,
      image: product.image,
      color: selectedColor.name,
      colorHex: selectedColor.value,
      filterClass: selectedColor.filterClass,
      size: selectedSize,
      maxStock: stockCount
    }, quantity);
    setIsAdding(false);
  };

  const activeViewStyle = product.views.find(v => v.id === activeViewId)?.style || {};

  return (
    <div className={`${styles.page} container`}>
      <Link to="/" className={styles.backLink}>
        <ArrowLeft size={16} />
        <span>Back to collection</span>
      </Link>

      <div className={styles.detailLayout}>
        {/* Left Column: Image Gallery */}
        <div className={styles.galleryCol}>
          <div className={styles.mainImageCard}>
            <div className={styles.mainImageWrapper}>
              <img
                src={product.image}
                alt={product.title}
                className={`${styles.mainImage} ${selectedColor.filterClass}`}
                style={activeViewStyle}
              />
            </div>
            {product.originalPrice && (
              <span className={styles.saleBadge}>Sale</span>
            )}
          </div>

          {/* Thumbnails Container */}
          <div className={styles.thumbnailsContainer}>
            {product.views.map((view) => {
              const isActive = view.id === activeViewId;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveViewId(view.id)}
                  className={`${styles.thumbnailBtn} ${isActive ? styles.activeThumbnail : ''}`}
                  aria-label={`View ${view.label}`}
                >
                  <div className={styles.thumbnailWrapper}>
                    <img
                      src={product.image}
                      alt={`${product.title} ${view.label}`}
                      className={`${styles.thumbnailImage} ${selectedColor.filterClass}`}
                      style={view.style}
                    />
                  </div>
                  <span className={styles.thumbnailLabel}>{view.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Product Specs and Actions */}
        <div className={styles.infoCol}>
          <div className={styles.brandRow}>
            <span className={styles.brandName}>{product.brand}</span>
            <div className={styles.rating}>
              <Star size={16} className={styles.starIcon} />
              <span className={styles.ratingVal}>{product.rating.rate}</span>
              <span className={styles.ratingCount}>({product.rating.count} reviews)</span>
            </div>
          </div>

          <h1 className={styles.title}>{product.title}</h1>

          <div className={styles.priceRow}>
            {product.originalPrice && (
              <span className={styles.originalPrice}>${product.originalPrice.toFixed(2)}</span>
            )}
            <span className={styles.price}>${product.price.toFixed(2)}</span>
          </div>

          <p className={styles.description}>{product.description}</p>

          <hr className={styles.divider} />

          {/* Color & Size Variant Selector */}
          <VariantSelector
            colors={product.colors}
            sizes={product.sizes}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onSelectColor={handleSelectColor}
            onSelectSize={handleSelectSize}
            stock={product.stock}
          />

          <hr className={styles.divider} />

          {/* Quantity & CTA Row */}
          <div className={styles.purchaseControls}>
            <div className={styles.qtySection}>
              <span className={styles.qtyLabel}>Quantity</span>
              <div className={styles.qtyPicker}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isSoldOut}
                  className={styles.qtyBtn}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className={styles.qtyVal}>{isSoldOut ? 0 : quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  disabled={quantity >= stockCount || isSoldOut}
                  className={styles.qtyBtn}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className={styles.stockNotice}>
              {isSoldOut ? (
                <span className={`${styles.noticeText} ${styles.soldOutText}`}>
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className={`${styles.noticeText} ${styles.lowStockText}`}>
                  Only {stockCount} items left!
                </span>
              ) : (
                <span className={`${styles.noticeText} ${styles.availableText}`}>
                  In Stock ({stockCount} available)
                </span>
              )}
            </div>
          </div>

          <div className={styles.actionsRow}>
            <button
              onClick={handleAddToCart}
              disabled={isSoldOut || isAdding}
              className={`${styles.addBtn} ${isSoldOut ? styles.disabledAdd : ''}`}
            >
              {isAdding ? (
                <>
                  <Loader size={18} className={styles.spinner} />
                  <span>Syncing Cart...</span>
                </>
              ) : isSoldOut ? (
                <span>Sold Out Variant</span>
              ) : (
                <span>Add to Shopping Cart</span>
              )}
            </button>
          </div>

          {/* Perks Bar */}
          <div className={styles.perks}>
            <div className={styles.perkItem}>
              <Truck size={18} />
              <div>
                <h5>Free Standard Shipping</h5>
                <p>Free delivery on orders over $100.00.</p>
              </div>
            </div>
            <div className={styles.perkItem}>
              <ShieldCheck size={18} />
              <div>
                <h5>2-Year Global Warranty</h5>
                <p>Authentic products with extended coverage.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
