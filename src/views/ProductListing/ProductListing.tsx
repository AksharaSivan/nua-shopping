import React, { useEffect, useState } from 'react';
import { enrichProduct } from '../../data/mockEnrichment';
import type { EnrichedProduct } from '../../data/mockEnrichment';
import ProductCard from '../../components/ProductCard/ProductCard';
import { Search, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import styles from './ProductListing.module.scss';

const ProductListing: React.FC = () => {
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://fakestoreapi.com/products');
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      const data = await response.json();
      const enrichedData = data.map((item: any) => enrichProduct(item));
      setProducts(enrichedData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong while fetching products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Get unique categories and normalize them
  const categories = ['all', ...new Set(products.map(p => p.category))];

  // Filter products based on search query and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return 'All Products';
    // capitalize
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <div className={`${styles.page} container`}>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={14} />
            <span>Summer Collection 2026</span>
          </div>
          <h1>Discover Our Premium Collection</h1>
          <p>Carefully curated high-quality goods designed for everyday luxury.</p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className={`${styles.filterBar} glass-panel`}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Search items by name, brand, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={styles.clearSearch}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <div className={styles.categoriesWrapper}>
          <div className={styles.categoryScroll}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`${styles.categoryTab} ${
                  selectedCategory === category ? styles.activeTab : ''
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className={`${styles.errorState} glass-panel`}>
          <AlertTriangle size={48} className={styles.errorIcon} />
          <h2>Unable to Load Products</h2>
          <p>{error}</p>
          <button onClick={fetchProducts} className={styles.retryBtn}>
            <RefreshCw size={16} />
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading && (
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className={`${styles.skeletonCard} glass-panel`}>
              <div className={`${styles.skeletonImage} shimmer`} />
              <div className={styles.skeletonInfo}>
                <div className={`${styles.skeletonBrand} shimmer`} />
                <div className={`${styles.skeletonTitle} shimmer`} />
                <div className={`${styles.skeletonTitle} shimmer` } style={{ width: '60%', marginTop: '4px' }} />
                <div className={styles.skeletonFooter}>
                  <div className={`${styles.skeletonPrice} shimmer`} />
                  <div className={`${styles.skeletonButton} shimmer`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listing Grid */}
      {!loading && !error && (
        <>
          {filteredProducts.length === 0 ? (
            <div className={`${styles.noResults} glass-panel`}>
              <h3>No items match your search</h3>
              <p>Try adjusting your search keywords or category filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className={styles.resetFiltersBtn}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredProducts.map((product) => (
                <div key={product.id} className={styles.gridItem}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductListing;
