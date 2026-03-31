export default function GameBoard({
  board,
  disabled,
  onCellClick,
  playerLabel = "Board",
}) {
  return (
    <div className="card">
      <div className="board-header">
        <h2>{playerLabel}</h2>
      </div>

      <div className="board">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;

            return (
              <button
                key={key}
                type="button"
                className="cell"
                onClick={() => onCellClick(rowIndex, colIndex)}
                disabled={disabled || Boolean(cell)}
              >
                {cell}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}