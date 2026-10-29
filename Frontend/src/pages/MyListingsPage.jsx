import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";
import {
  deleteProduct,
  fetchMyListings,
  updateProductStatus
} from "../services/productService";

function MyListingsPage() {
  const { token } = useAuth();
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [summary, setSummary] = useState({ total: 0, available: 0, unavailable: 0, sold: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.success || "");
  const [busyListingId, setBusyListingId] = useState("");

  const loadListings = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setListings([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await fetchMyListings(token);
      setListings(result.listings);
      setSummary(result.summary);
    } catch (loadError) {
      setError(loadError.message || "Unable to load your listings.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  async function handleAvailability(listing, status) {
    setBusyListingId(listing._id);
    setError("");
    setSuccess("");

    try {
      const result = await updateProductStatus(listing._id, status, token);
      setSuccess(result.message);
      await loadListings();
    } catch (updateError) {
      setError(updateError.message || "Unable to update listing availability.");
    } finally {
      setBusyListingId("");
    }
  }

  async function handleDelete(listing) {
    const confirmed = window.confirm(
      `Delete "${listing.title}"? This cannot be undone. Listings with order history must be kept and marked unavailable instead.`
    );
    if (!confirmed) {
      return;
    }

    setBusyListingId(listing._id);
    setError("");
    setSuccess("");

    try {
      const result = await deleteProduct(listing._id, token);
      setSuccess(result.message);
      await loadListings();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete your listing.");
    } finally {
      setBusyListingId("");
    }
  }

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Seller Center</p>
          <h1>My listings</h1>
        </div>
        <Link to="/sell" className="primary-button">Create listing</Link>
      </div>

      <div className="seller-summary" aria-label="Listing summary">
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

      {success && <div className="status-banner success" role="status">{success}</div>}
      {error && <div className="status-banner error" role="alert">{error}</div>}
      {loading ? (
        <div className="loading-box">Loading your listings...</div>
      ) : error && listings.length === 0 ? null : listings.length === 0 ? (
        <div className="empty-state">
          <h2>No listings yet</h2>
          <p>Your products will appear here after you publish your first listing.</p>
          <Link to="/sell" className="primary-button">Create your first listing</Link>
        </div>
      ) : (
        <div className="seller-listings">
          {listings.map((listing) => {
            const isAvailable = listing.status === "ACTIVE" && listing.quantity > 0;
            const isBusy = busyListingId === listing._id;

            return (
              <article className="seller-listing-card" key={listing._id}>
                <div className="seller-listing-info">
                  <div className="product-meta">
                    <span>{listing.category}</span>
                    <span className={`listing-status ${isAvailable ? "available" : "unavailable"}`}>
                      {listing.status === "CLOSED" ? "UNAVAILABLE" : listing.status}
                    </span>
                  </div>
                  <h2>{listing.title}</h2>
                  <p>{listing.description}</p>
                  <div className="seller-listing-metrics">
                    <span>₹{Number(listing.price).toLocaleString("en-IN")} / {listing.unit}</span>
                    <span>Quantity: {listing.quantity} {listing.unit}</span>
                    <span>{listing.location}</span>
                  </div>
                </div>

                <div className="seller-listing-actions" aria-label={`Actions for ${listing.title}`}>
                  <Link to={`/marketplace/${listing._id}`} className="btn btn-secondary">View</Link>
                  <Link to={`/my-listings/${listing._id}/edit`} className="btn btn-secondary">Edit</Link>
                  {isAvailable ? (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isBusy}
                        onClick={() => handleAvailability(listing, "CLOSED")}
                      >
                        Mark unavailable
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isBusy}
                        onClick={() => handleAvailability(listing, "SOLD")}
                      >
                        Mark sold
                      </Button>
                    </>
                  ) : listing.quantity > 0 ? (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isBusy}
                      onClick={() => handleAvailability(listing, "ACTIVE")}
                    >
                      Make available
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isBusy}
                    onClick={() => handleDelete(listing)}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyListingsPage;
