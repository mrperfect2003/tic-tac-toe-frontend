export default function StatusPanel({
  playerName,
  playerId,
  players,
  boardState,
  connectionStatus,
  matchId,
}) {
  const currentTurn = boardState?.turn || "";
  const winner = boardState?.winner || "";
  const status = boardState?.status || "waiting";

  const myIndex = players.findIndex((player) => player.userId === playerId);
  const mySymbol = myIndex === 0 ? "X" : myIndex === 1 ? "O" : "-";

  const turnText =
    currentTurn && players.length
      ? players.find((player) => player.userId === currentTurn)?.username ||
        "Waiting"
      : "Waiting";

  const winnerText =
    winner && players.length
      ? players.find((player) => player.userId === winner)?.username ||
        "Winner"
      : boardState?.status === "finished" && boardState?.moves_count === 9
      ? "Draw"
      : "Not decided";

  return (
    <div className="card">
      <h2>Match Info</h2>

      <div className="info-list">
        <div>
          <span>Player</span>
          <strong>{playerName || "Guest"}</strong>
        </div>

        <div>
          <span>Your Symbol</span>
          <strong>{mySymbol}</strong>
        </div>

        <div>
          <span>Connected Players</span>
          <strong>{players.length}/2</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{status}</strong>
        </div>

        <div>
          <span>Current Turn</span>
          <strong>{turnText}</strong>
        </div>

        <div>
          <span>Winner</span>
          <strong>{winnerText}</strong>
        </div>

        <div>
          <span>Connection</span>
          <strong>{connectionStatus}</strong>
        </div>

        <div>
          <span>Match ID</span>
          <strong className="match-id">{matchId || "-"}</strong>
        </div>
      </div>
    </div>
  );
}