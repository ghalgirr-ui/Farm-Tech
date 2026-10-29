import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchOrders } from "../services/productService";

function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const result = await fetchOrders(token);
        setOrders(result);
      } catch (err) {
        setError(err.message || "Unable to load orders.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadOrders();
    }
  }, [token]);

  if (!token) {
    return <div className="status-banner">Please sign in to view your orders.</div>;
  }

  if (loading) return <div className="status-banner">Loading orders...</div>;
  if (error) return <div className="status-banner error">{error}</div>;

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Orders</p>
          <h1>Your purchase history</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Your recent transactions will appear here.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order._id} className="order-card">
              <div>
                <p className="eyebrow">Order #{order._id.slice(-6)}</p>
                <h3>{order.product?.title || "Product"}</h3>
              </div>
              <div className="order-metrics">
                <span>Qty: {order.quantity}</span>
                <span>Amount: ₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
                <span>Status: {order.status}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrdersPage;
