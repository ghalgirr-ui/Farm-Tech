import Button from "../components/common/Button";
import Card from "../components/common/Card";

const featureCards = [
  {
    title: "Farmer-first marketplace",
    description: "A clean base for selling produce, tools, and equipment with trust at the center."
  },
  {
    title: "Field-ready intelligence",
    description: "Designed for future AI, weather, crop-care, and scheme guidance modules."
  },
  {
    title: "Growth-focused platform",
    description: "Built for scale, simple onboarding, and future farmer-to-company integrations."
  }
];

const stats = [
  { label: "Active categories", value: "12+" },
  { label: "Farmer support", value: "24/7" },
  { label: "Growth path", value: "AI ready" }
];

function HomePage() {
  return (
    <div className="page-section">
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">Smart agriculture platform</p>
          <h1 id="home-title">Connect. Farm. Grow.</h1>
          <p>
            FARM-TECH creates a trust-first digital foundation for Indian farmers to access trade,
            support, and future AI-powered agricultural guidance.
          </p>
          <div className="hero-actions">
            <Button>Explore marketplace</Button>
            <Button variant="secondary">View capabilities</Button>
          </div>
        </div>

        <div className="hero-panel" aria-label="Platform overview">
          <div className="panel-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="metric">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="status-box">
            <div className="status-dot" aria-hidden="true" />
            <div className="status-text">System foundation is live and ready for expansion.</div>
          </div>
        </div>
      </section>

      <section className="page-section" aria-labelledby="features-title">
        <div className="section-header">
          <h2 id="features-title">Why FARM-TECH</h2>
        </div>

        <div className="features-grid">
          {featureCards.map((feature) => (
            <Card key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
