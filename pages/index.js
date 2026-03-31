import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../components/Layout";
import PlayerSetup from "../components/PlayerSetup";
import MatchControls from "../components/MatchControls";
import { authenticatePlayer, createMatch } from "../lib/nakama";

export default function HomePage() {
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue(name) {
    try {
      setAuthLoading(true);
      setError("");

      const newSession = await authenticatePlayer(name);
      setSession(newSession);
      setPlayerName(name);

      localStorage.setItem("player_name", name);
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err?.message || "Failed to authenticate player.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleCreateMatch() {
    try {
      setCreateLoading(true);
      setError("");

      const matchId = await createMatch(session);
      router.push(`/game/${encodeURIComponent(matchId)}`);
    } catch (err) {
      console.error("Create match error:", err);
      setError(err?.message || "Failed to create match.");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleJoinMatch(matchId) {
    try {
      setJoinLoading(true);
      setError("");

      router.push(`/game/${encodeURIComponent(matchId)}`);
    } catch (err) {
      console.error("Join match error:", err);
      setError(err?.message || "Failed to join match.");
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <Layout>
      {!session ? (
        <PlayerSetup onContinue={handleContinue} loading={authLoading} />
      ) : (
        <MatchControls
          onCreateMatch={handleCreateMatch}
          onJoinMatch={handleJoinMatch}
          creating={createLoading}
          joining={joinLoading}
        />
      )}

      {playerName ? (
        <div className="card small">
          <p>
            Signed in as <strong>{playerName}</strong>
          </p>
        </div>
      ) : null}

      {error ? <div className="error-box">{error}</div> : null}
    </Layout>
  );
}