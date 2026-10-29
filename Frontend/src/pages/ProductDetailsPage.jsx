import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createOrder, fetchProduct } from "../services/productService";

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const result = await fetchProduct(id);
        setProduct(result);
      } catch (err) {
        setError(err.message || "Unable to load this product.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  async function handleBuyNow() {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!token) {
      setError("Please sign in to place an order.");
      return;
    }

    const sellerId = typeof product.seller === "object" ? product.seller._id : product.seller;
    if (sellerId && user._id === sellerId) {
      setError("You cannot purchase your own listing.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setOrderMessage("");

      const result = await createOrder(product._id, 1, token);
      setOrderMessage(result.message || "Order placed successfully.");
    } catch (err) {
      setError(err.message || "Unable to place your order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <div className="status-banner">Loading product...</div>;
  if (error) return <div className="status-banner error">{error}</div>;
  if (!product) return <div className="status-banner error">Product not found.</div>;

  const primaryImage = product.images?.[0] || "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80";
  const canPurchase = product.status === "ACTIVE" && product.type === "SALE";

  return (
    <section className="page-shell product-detail-shell">
      <Link to="/marketplace" className="back-link">← Back to marketplace</Link>

      <div className="product-detail-card">
        <div className="product-detail-image-wrap">
          <img src={primaryImage} alt={product.title} className="product-detail-image" />
        </div>

        <div className="product-detail-content">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.title}</h1>

          <div className="detail-price-row">
            <span className="price">₹{Number(product.price).toLocaleString("en-IN")}</span>
            <span className="tag">{product.type}</span>
          </div>

          <p className="product-description">{product.description}</p>

          <div className="detail-grid">
            <div>
              <span className="detail-label">Location</span>
              <strong>{product.location}</strong>
            </div>
            <div>
              <span className="detail-label">Quantity</span>
              <strong>{product.quantity} {product.unit}</strong>
            </div>
            <div>
              <span className="detail-label">Status</span>
              <strong>{product.status}</strong>
            </div>
          </div>

          <div className="purchase-actions">
            <button type="button" className="primary-button" onClick={handleBuyNow} disabled={isSubmitting || !canPurchase}>
              {isSubmitting
                ? "Placing order..."
                : product.status !== "ACTIVE"
                  ? "Unavailable"
                  : product.type !== "SALE"
                    ? "Sale listings only"
                    : "Buy now"}
            </button>
          </div>

          {orderMessage && <div className="status-banner success">{orderMessage}</div>}
          {error && <div className="status-banner error">{error}</div>}
        </div>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
