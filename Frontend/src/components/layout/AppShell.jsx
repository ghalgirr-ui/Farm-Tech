import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function AppShell({ children }) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = user
    ? [
        { label: "Home", path: "/" },
        { label: "Marketplace", path: "/marketplace" },
        { label: "Dashboard", path: "/dashboard" },
        { label: "My listings", path: "/my-listings" },
        { label: "Sell", path: "/sell" },
        { label: "Orders", path: "/orders" },
        { label: "Profile", path: "/profile" }
      ]
    : [
        { label: "Home", path: "/" },
        { label: "Marketplace", path: "/marketplace" },
        { label: "Login", path: "/login" },
        { label: "Register", path: "/register" }
      ];

  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="navbar" aria-label="Main navigation">
          <NavLink to="/" className="brand" aria-label="FARM-TECH home">
            <span className="brand-mark">🌾</span>FARM-TECH
          </NavLink>

          <div className="nav-links" aria-label="Desktop navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}

            {user && (
              <button type="button" className="nav-link nav-logout" onClick={logout}>
                Logout
              </button>
            )}
          </div>

          <button
            type="button"
            className="nav-toggle"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            ☰
          </button>
        </nav>

        <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
          <div className="mobile-menu-list">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            {user && (
              <button
                type="button"
                className="nav-link nav-logout"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">{children}</main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>© 2026 FARM-TECH</span>
          <span>Smart agricultural commerce foundation</span>
        </div>
      </footer>
    </div>
  );
}

export default AppShell;
