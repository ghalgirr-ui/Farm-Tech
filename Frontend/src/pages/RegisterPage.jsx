import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  preferredLanguage: "English"
};

function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/profile", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in your name, email and password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate("/profile", { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Create account</p>
          <h1>Start with FARM-TECH</h1>
          <p>Join a trusted agricultural platform built for farmers and communities.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormField
            id="register-name"
            label="Full name"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
          />

          <FormField
            id="register-email"
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />

          <FormField
            id="register-phone"
            label="Phone"
            type="tel"
            name="phone"
            placeholder="Your phone number"
            value={formData.phone}
            onChange={handleChange}
          />

          <FormField
            id="register-password"
            label="Password"
            type="password"
            name="password"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={handleChange}
          />

          <FormField
            id="register-language"
            label="Preferred language"
            name="preferredLanguage"
            value={formData.preferredLanguage}
            onChange={handleChange}
            options={[
              { value: "English", label: "English" },
              { value: "Hindi", label: "Hindi" },
              { value: "Marathi", label: "Marathi" }
            ]}
          />

          {error && <div className="error-box">{error}</div>}

          <Button type="submit" className="full-width" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
