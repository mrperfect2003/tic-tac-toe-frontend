export default function WinnerModal({
  isOpen,
  winnerName,
  isDraw,
  onClose,
  onBack,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="winner-modal">
        <div className="winner-badge">
          {isDraw ? "Game Over" : "Winner"}
        </div>

        <h2 className="winner-title">
          {isDraw ? "It's a Draw" : `${winnerName} Wins`}
        </h2>

        <p className="winner-subtitle">
          {isDraw
            ? "Both players played well. No winner this time."
            : "Congratulations on winning this match."}
        </p>

        <div className="winner-actions">
          <button onClick={onClose} className="secondary-btn">
            Continue
          </button>
          <button onClick={onBack} className="primary-btn">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}