import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { fetchProducts } from '../data/products';
import type { Product } from '../data/products';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const Shop = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState<string>('');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchProducts();
                setProducts(data || []);
            } catch (err) {
                console.error('Error loading products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const filterProducts = () => {
        let filtered = products;

        // Price range filter with validation
        const min = minPrice ? parseFloat(minPrice) : null;
        const max = maxPrice ? parseFloat(maxPrice) : null;

        // Validate price range
        if (min !== null && max !== null && min > max) {
            // Swap if min is greater than max
            filtered = filtered.filter(p => p.price >= max && p.price <= min);
        } else {
            if (min !== null) {
                filtered = filtered.filter(p => p.price >= min);
            }
            if (max !== null) {
                filtered = filtered.filter(p => p.price <= max);
            }
        }

        // Search filter (title, description, or account ID)
        if (search.trim()) {
            const term = search.toLowerCase();
            filtered = filtered.filter(p => {
                // Search in title
                const titleMatch = p.title.toLowerCase().includes(term);
                // Search in description only if search starts with #
                const descMatch = search.startsWith('#') && p.description
                    ? p.description.toLowerCase().includes(term.substring(1))
                    : false;
                // Search in account ID (first 8 characters)
                const accountIdMatch = p.id.toLowerCase().includes(term);
                return titleMatch || descMatch || accountIdMatch;
            });
        }

        return filtered;
    };

    const filteredProducts = filterProducts();

    if (loading) {
        return (
            <div className="shop-page">
                <div className="container">
                    <div className="loading-spinner" style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <p>Loading products...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="shop-page">
                <div className="container">
                    <div className="error-message" style={{ textAlign: 'center', padding: '3rem 0', color: '#dc2626' }}>
                        <p>{error}</p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '1rem' }}
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="shop-page">
            <div className="container">
                {/* Search & Filter Toolbar */}
                <div className="shop-toolbar">
                    <div className="search-container">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title, ID, or #tag..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filters-container">
                        <div className="price-filter">
                            <span className="filter-label">Price Range:</span>
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="price-input"
                                    min="0"
                                    step="0.01"
                                />
                                <span className="price-separator">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="price-input"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {(minPrice || maxPrice || search) && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setMinPrice('');
                                    setMaxPrice('');
                                }}
                                className="btn-clear-filters"
                            >
                                <X size={16} /> Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>No accounts found</h3>
                        <p>Try adjusting your search or filters to find what you're looking for.</p>
                        <button
                            onClick={() => {
                                setSearch('');
                                setMinPrice('');
                                setMaxPrice('');
                            }}
                            className="btn-reset"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;
