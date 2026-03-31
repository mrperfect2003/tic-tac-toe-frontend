import { useState } from "react";

export default function MatchControls({
  onCreateMatch,
  onJoinMatch,
  creating,
  joining,
}) {
  const [matchId, setMatchId] = useState("");

  function handleJoin(event) {
    event.preventDefault();

    if (!matchId.trim()) return;

    onJoinMatch(matchId.trim());
  }

  return (
    <div className="grid two">
      <div className="card">
        <h2>Create match</h2>
        <p>Create a new room and share the match ID with another player.</p>
        <button onClick={onCreateMatch} disabled={creating}>
          {creating ? "Creating..." : "Create Match"}
        </button>
      </div>

      <div className="card">
        <h2>Join match</h2>

        <form onSubmit={handleJoin} className="stack">
          <input
            type="text"
            placeholder="Enter match ID"
            value={matchId}
            onChange={(event) => setMatchId(event.target.value)}
          />

          <button type="submit" disabled={joining}>
            {joining ? "Joining..." : "Join Match"}
          </button>
        </form>
      </div>
    </div>
  );
}