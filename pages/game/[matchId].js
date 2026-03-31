import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/Layout";
import GameBoard from "../../components/GameBoard";
import StatusPanel from "../../components/StatusPanel";
import WinnerModal from "../../components/WinnerModal";
import {
  createSocket,
  decodeMatchData,
  getNakamaClient,
  restoreSession,
} from "../../lib/nakama";

const EMPTY_BOARD = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

export default function GamePage() {
  const router = useRouter();
  const { matchId } = router.query;

  const socketRef = useRef(null);

  const [sessionToken, setSessionToken] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [players, setPlayers] = useState([]);
  const [boardState, setBoardState] = useState({
    board: EMPTY_BOARD,
    players: [],
    turn: "",
    winner: "",
    moves_count: 0,
    status: "waiting",
  });
  const [error, setError] = useState("");
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const token = localStorage.getItem("nakama_token");
    const name = localStorage.getItem("player_name") || "Guest";

    if (!token) {
      router.replace("/");
      return;
    }

    setSessionToken(token);
    setPlayerName(name);
  }, [router]);

  useEffect(() => {
    if (!matchId || !sessionToken) return;

    let isMounted = true;

    async function connectAndJoin() {
      try {
        setError("");
        setConnectionStatus("connecting");

        const client = getNakamaClient();
        const socket = createSocket();
        socketRef.current = socket;

        const session = restoreSession();
        if (!session) {
          router.replace("/");
          return;
        }

        setPlayerId(session.user_id);

        socket.onmatchdata = (message) => {
          try {
            const nextState = decodeMatchData(message.data);

            if (isMounted && nextState) {
              setBoardState((prev) => ({
                ...prev,
                ...nextState,
                board: nextState.board || prev.board,
              }));
            }
          } catch (err) {
            console.error("Failed to decode match data", err);
          }
        };

        socket.onmatchpresence = (presenceEvent) => {
          const joins = presenceEvent.joins || [];
          const leaves = presenceEvent.leaves || [];

          setPlayers((prev) => {
            const map = new Map(prev.map((player) => [player.userId, player]));

            joins.forEach((presence) => {
              map.set(presence.user_id, {
                userId: presence.user_id,
                username: presence.username || "Player",
              });
            });

            leaves.forEach((presence) => {
              map.delete(presence.user_id);
            });

            return Array.from(map.values());
          });
        };

        socket.ondisconnect = () => {
          if (isMounted) {
            setConnectionStatus("disconnected");
          }
        };

        await socket.connect(session, true);
        setConnectionStatus("connected");

        const joinedMatch = await socket.joinMatch(matchId);

        const initialPlayers = [
          ...(joinedMatch.presences || []).map((presence) => ({
            userId: presence.user_id,
            username: presence.username || "Player",
          })),
        ];

        if (joinedMatch.self) {
          const alreadyExists = initialPlayers.some(
            (player) => player.userId === joinedMatch.self.user_id
          );

          if (!alreadyExists) {
            initialPlayers.push({
              userId: joinedMatch.self.user_id,
              username: joinedMatch.self.username || playerName || "You",
            });
          }
        }

        setPlayers(initialPlayers);
      } catch (err) {
        console.error("Join/connect error:", err);
        setError(err?.message || "Failed to connect or join the match.");
        setConnectionStatus("failed");
      }
    }

    connectAndJoin();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [matchId, sessionToken, playerName, router]);

  useEffect(() => {
    if (boardState.status === "finished") {
      setShowWinnerModal(true);
    }
  }, [boardState.status]);

  const currentBoard = useMemo(() => {
    return boardState.board || EMPTY_BOARD;
  }, [boardState]);

  const isMyTurn = playerId && boardState.turn === playerId;
  const gameFinished = boardState.status === "finished";

  const winnerName = useMemo(() => {
    if (!boardState.winner) return "";

    const winnerPlayer = players.find(
      (player) => player.userId === boardState.winner
    );

    return winnerPlayer?.username || "Winner";
  }, [boardState.winner, players]);

  const isDraw =
    boardState.status === "finished" &&
    !boardState.winner &&
    boardState.moves_count === 9;

  async function handleCellClick(row, col) {
    try {
      if (!socketRef.current || !matchId) return;
      if (gameFinished) return;

      await socketRef.current.sendMatchState(
        matchId,
        1,
        JSON.stringify({ row, col })
      );
    } catch (err) {
      console.error("Send move error:", err);
      setError(err?.message || "Failed to send move.");
    }
  }

  return (
    <Layout>
      <div className="top-actions">
        <button onClick={() => router.push("/")}>Back</button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="grid two">
        <StatusPanel
          playerName={playerName}
          playerId={playerId}
          players={players}
          boardState={boardState}
          connectionStatus={connectionStatus}
          matchId={matchId}
        />

        <GameBoard
          board={currentBoard}
          disabled={!isMyTurn || gameFinished}
          onCellClick={handleCellClick}
          playerLabel={
            gameFinished
              ? "Game Finished"
              : isMyTurn
              ? "Your turn"
              : "Waiting for turn"
          }
        />
      </div>

      <WinnerModal
        isOpen={showWinnerModal}
        winnerName={winnerName}
        isDraw={isDraw}
        onClose={() => setShowWinnerModal(false)}
        onBack={() => router.push("/")}
      />
    </Layout>
  );
}