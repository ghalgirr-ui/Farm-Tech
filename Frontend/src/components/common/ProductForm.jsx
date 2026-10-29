import { useState } from "react";
import { PRODUCT_CATEGORIES } from "../../constants/productOptions";

function ProductForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  error,
  allowZeroQuantity = false
}) {
  const [form, setForm] = useState(initialValues);
  const [imageError, setImageError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleImageUpload(event) {
    const files = Array.from(event.target.files || []);
    setImageError("");
    const readers = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers)
      .then((images) => {
        setForm((current) => ({ ...current, images: [...current.images, ...images] }));
      })
      .catch(() => {
        setImageError("Some selected images could not be added.");
      });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity)
    };

    onSubmit(payload);
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          <span>Title</span>
          <input name="title" value={form.title} onChange={handleChange} minLength="2" required />
        </label>

        <label>
          <span>Category</span>
          <select name="category" value={form.category} onChange={handleChange} required>
            {PRODUCT_CATEGORIES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Listing type</span>
          <select name="type" value={form.type} onChange={handleChange} required>
            <option value="SALE">SALE</option>
            <option value="RENT">RENT</option>
            <option value="BID">BID</option>
          </select>
        </label>

        <label>
          <span>Price</span>
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          <span>Quantity</span>
          <input
            name="quantity"
            type="number"
            min={allowZeroQuantity ? "0" : "1"}
            step="1"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          <span>Unit</span>
          <input name="unit" value={form.unit} onChange={handleChange} required />
        </label>

        <label className="full-width">
          <span>Location</span>
          <input name="location" value={form.location} onChange={handleChange} required />
        </label>

        <label className="full-width">
          <span>Description</span>
          <textarea
            name="description"
            rows="5"
            value={form.description}
            onChange={handleChange}
            minLength="10"
            required
          />
        </label>

        <label className="full-width">
          <span>Add images</span>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
        </label>
      </div>

      {form.images.length > 0 && (
        <div className="image-preview-grid">
          {form.images.map((image, index) => (
            <img
              key={`${image}-${index}`}
              src={image}
              alt={`Listing preview ${index + 1}`}
              className="image-preview"
            />
          ))}
        </div>
      )}

      {imageError && <div className="status-banner error" role="alert">{imageError}</div>}
      {error && <div className="status-banner error" role="alert">{error}</div>}

      <button type="submit" className="primary-button submit-button" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default ProductForm;
