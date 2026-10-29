import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchMyListings } from "../services/productService";

function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchMyListings(token)
      .then((result) => {
        if (!cancelled) {
          setSummary(result.summary);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message || "Unable to load your seller summary.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Seller Center</p>
          <h2>Seller dashboard</h2>
        </div>
      </div>

      {error && <div className="status-banner error" role="alert">{error}</div>}
      {!summary && !error ? (
        <div className="loading-box">Loading seller overview...</div>
      ) : summary ? (
        <>
          <div className="seller-summary" aria-label="Seller listing summary">
            <article className="seller-stat-card">
              <span>Total listings</span>
              <strong>{summary.total}</strong>
            </article>
            <article className="seller-stat-card">
              <span>Available</span>
              <strong>{summary.available}</strong>
            </article>
            <article className="seller-stat-card">
              <span>Unavailable</span>
              <strong>{summary.unavailable}</strong>
            </article>
            <article className="seller-stat-card">
              <span>Sold</span>
              <strong>{summary.sold}</strong>
            </article>
          </div>
          <div className="seller-dashboard-actions">
            <Link to="/my-listings" className="primary-button">Manage my listings</Link>
            <Link to="/sell" className="btn btn-secondary">Create a listing</Link>
          </div>
        </>
      ) : (
        <Link to="/my-listings" className="btn btn-secondary">View my listings</Link>
      )}
    </div>
  );
}

export default DashboardPage;
