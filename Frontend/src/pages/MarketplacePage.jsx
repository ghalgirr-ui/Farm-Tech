import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Input from "../components/common/Input";
import { PRODUCT_CATEGORIES } from "../constants/productOptions";
import { fetchProducts } from "../services/productService";

function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchProducts({ search, category });
        if (!cancelled) {
          setProducts(data.products);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Something went wrong. Please try again.");
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [category, search]);

  return (
    <div className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h2>Farm essentials</h2>
        </div>
      </div>

      <div className="marketplace-controls" aria-label="Marketplace controls">
        <Input
          id="search-products"
          label=""
          type="search"
          placeholder="Search products"
          aria-label="Search products"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <label className="field-label">
          <span className="sr-only">Filter by category</span>
          <select
            className="select-field"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="All">All categories</option>
            {PRODUCT_CATEGORIES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="loading-box">Loading marketplace...</div>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : products.length === 0 ? (
        <div className="empty-state">No products found.</div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <article key={product._id} className="product-card">
              <div className="product-image" aria-label={`${product.title} thumbnail`}>🌾</div>
              <div className="product-body">
                <div className="product-meta">
                  <span>{product.category}</span>
                  <span>{product.location || "Local market"}</span>
                </div>
                <h3 className="product-title">{product.title}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">₹{product.price}</span>
                  <Link to={`/marketplace/${product._id}`} className="btn btn-secondary">
                    View
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MarketplacePage;
