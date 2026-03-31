import { Client, Session } from "@heroiclabs/nakama-js";

const host = process.env.NEXT_PUBLIC_NAKAMA_HOST || "127.0.0.1";
const port = process.env.NEXT_PUBLIC_NAKAMA_PORT || "7350";
const serverKey = process.env.NEXT_PUBLIC_NAKAMA_SERVER_KEY || "defaultkey";
const useSSL = process.env.NEXT_PUBLIC_USE_SSL === "true";

let clientInstance = null;

export function getNakamaClient() {
  if (!clientInstance) {
    clientInstance = new Client(serverKey, host, port, useSSL);
  }
  return clientInstance;
}

export function getOrCreateDeviceId() {
  if (typeof window === "undefined") return "server-device";

  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = `device-${crypto.randomUUID()}`;
    localStorage.setItem("device_id", deviceId);
  }

  return deviceId;
}

export async function authenticatePlayer(username) {
  const client = getNakamaClient();
  const deviceId = getOrCreateDeviceId();

  const session = await client.authenticateDevice(deviceId, true, username);

  localStorage.setItem("nakama_token", session.token);
  localStorage.setItem("player_name", username);

  return session;
}

export function restoreSession() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("nakama_token");
  if (!token) return null;

  return Session.restore(token);
}

export function createSocket() {
  const client = getNakamaClient();
  return client.createSocket(useSSL, false);
}

export async function createMatch(session) {
  const client = getNakamaClient();
  const response = await client.rpc(session, "create_match", "{}");

  const payload =
    typeof response.payload === "string"
      ? JSON.parse(response.payload)
      : response.payload;

  return payload.match_id;
}

export function decodeMatchData(data) {
  if (!data) return null;

  if (typeof data === "string") {
    return JSON.parse(data);
  }

  if (data instanceof Uint8Array) {
    return JSON.parse(new TextDecoder().decode(data));
  }

  if (data instanceof ArrayBuffer) {
    return JSON.parse(new TextDecoder().decode(new Uint8Array(data)));
  }

  return data;
}