import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const redirectTo = location.state?.from?.pathname || "/profile";
      navigate(redirectTo, { replace: true });
    }
  }, [user, location.state, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await login(formData);
      const redirectTo = location.state?.from?.pathname || "/profile";
      navigate(redirectTo, { replace: true });
      return response;
    } catch (submitError) {
      setError(submitError.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Welcome back</p>
          <h1>Login to FARM-TECH</h1>
          <p>Your farm dashboard is waiting for you.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormField
            id="login-email"
            label="Email"
            type="email"
            name="email"
            placeholder="farmer@example.com"
            value={formData.email}
            onChange={handleChange}
          />

          <FormField
            id="login-password"
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />

          {error && <div className="error-box">{error}</div>}

          <Button type="submit" className="full-width" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <p className="auth-footer">
          Need an account? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
