import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const imageUrl = product.images?.[0] || "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80";

  return (
    <article className="product-card">
      <img src={imageUrl} alt={product.title} className="product-image" />

      <div className="product-content">
        <div className="product-header-row">
          <span className="tag">{product.category}</span>
          <span className="price">₹{Number(product.price).toLocaleString("en-IN")}</span>
        </div>

        <h3>{product.title}</h3>
        <p className="product-location">📍 {product.location}</p>

        <div className="product-meta">
          <span>{product.type}</span>
          <span>{product.quantity} {product.unit}</span>
        </div>

        <Link to={`/marketplace/${product._id}`} className="primary-button">
          View Details
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
