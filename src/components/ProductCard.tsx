import { Link } from 'react-router-dom';
import type { Product } from '../data/products';
import { getStorageUrl } from '../lib/storage';
import { timeAgo } from '../utils/timeAgo';
import './ProductCard.css';

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
    const imageUrl = getStorageUrl(mainImage);

    return (
        <Link to={`/product/${product.id}`} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            {product.featured && <span className="featured-badge">Featured</span>}

            <div className="product-image">
                <img src={imageUrl} alt={product.title} />
            </div>

            <div className="product-info">
                <h3 className="product-title">Account #{product.id.slice(0, 8)}</h3>
                <p className="product-time">{product.created_at ? timeAgo(product.created_at) : 'Just now'}</p>

                <div className="product-footer">
                    <div className="product-price">৳{product.price.toLocaleString()}</div>
                    <span className="btn btn-primary btn-buy">
                        Buy Now
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
