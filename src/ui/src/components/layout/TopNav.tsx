export default function TopNav() {
  return (
    <nav className="top-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <h1 className="brand-title">
            <span className="brand-icon">🧠</span>
            AlgoBrainDoctor
          </h1>
          <span className="brand-subtitle">Repository Health Monitor</span>
        </div>
        
        <div className="nav-menu">
          <a href="/" className="nav-link active">Dashboard</a>
          <a href="/operator" className="nav-link">Operator</a>
          <a href="/repos" className="nav-link">Repositories</a>
        </div>
        
        <div className="nav-actions">
          <button className="btn btn-sm">
            <span>⚙️</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
