import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "../components/common/ProductForm";
import { useAuth } from "../context/AuthContext";
import { createProduct } from "../services/productService";

const initialForm = {
  title: "",
  description: "",
  category: "Seeds",
  type: "SALE",
  price: "",
  quantity: "1",
  unit: "kg",
  location: "",
  images: []
};

function SellProductPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(form) {
    if (!token) {
      setError("Please login before listing a product.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const result = await createProduct(form, token);
      navigate(`/marketplace/${result.product._id}`);
    } catch (err) {
      setError(err.message || "Unable to publish your product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Seller Center</p>
          <h1>List a new product</h1>
        </div>
      </div>

      <ProductForm
        initialValues={initialForm}
        submitLabel="Publish product"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        error={error}
      />
    </section>
  );
}

export default SellProductPage;
