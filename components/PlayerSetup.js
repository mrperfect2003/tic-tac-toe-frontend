import { useState } from "react";

export default function PlayerSetup({ onContinue, loading }) {
  const [name, setName] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) return;

    onContinue(name.trim());
  }

  return (
    <div className="card">
      <h2>Enter player name</h2>

      <form onSubmit={handleSubmit} className="stack">
        <input
          type="text"
          placeholder="Your nickname"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={20}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Connecting..." : "Continue"}
        </button>
      </form>
    </div>
  );
}