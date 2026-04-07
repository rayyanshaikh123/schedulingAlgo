
export default function Loader({ fadeOut }) {
  return (
    <section className={`loader-screen content ${fadeOut ? "fade-out" : "fade-in"}`}>
      <div className="loader-card">
        <p className="loader-tag">CPU Scheduler Studio</p>
        <h1 className="loader-title">Scheduling Algorithm Calculator</h1>
        <p className="loader-subtitle">Preparing your simulation workspace...</p>
        <div className="loader-dots" aria-label="Loading">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </section>
  );
}
