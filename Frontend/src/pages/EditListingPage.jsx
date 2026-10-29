import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProductForm from "../components/common/ProductForm";
import { useAuth } from "../context/AuthContext";
import { fetchProduct, updateProduct } from "../services/productService";

function EditListingPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadListing() {
      try {
        setLoading(true);
        setError("");
        const product = await fetchProduct(id);
        const sellerId = typeof product.seller === "object" ? product.seller._id : product.seller;

        if (sellerId !== user?._id) {
          throw new Error("You are not allowed to edit this listing.");
        }

        if (!cancelled) {
          setListing(product);
          setInitialValues({
            title: product.title,
            description: product.description,
            category: product.category,
            type: product.type,
            price: String(product.price),
            quantity: String(product.quantity),
            unit: product.unit,
            location: product.location,
            images: product.images || []
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Unable to load this listing.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (token && id) {
      loadListing();
    }

    return () => {
      cancelled = true;
    };
  }, [id, token, user?._id]);

  async function handleSubmit(values) {
    try {
      setIsSubmitting(true);
      setError("");
      await updateProduct(id, values, token);
      navigate("/my-listings", {
        replace: true,
        state: { success: "Listing updated successfully." }
      });
    } catch (submitError) {
      setError(submitError.message || "Unable to update your listing.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="loading-box">Loading listing...</div>;
  }

  if (error || !listing) {
    return (
      <section className="page-shell">
        <div className="status-banner error" role="alert">{error || "Listing not found."}</div>
        <Link to="/my-listings" className="btn btn-secondary">Back to my listings</Link>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Seller Center</p>
          <h1>Edit listing</h1>
        </div>
        <Link to="/my-listings" className="btn btn-secondary">Cancel</Link>
      </div>
      <ProductForm
        key={listing._id}
        initialValues={initialValues}
        allowZeroQuantity
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        error={error}
      />
    </section>
  );
}

export default EditListingPage;
