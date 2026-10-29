import Button from "../components/common/Button";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="page-section">
      <div className="empty-state">
        <h2>Page not found</h2>
        <p>The page you requested is not available yet.</p>
        <Link to="/">
          <Button type="button">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
