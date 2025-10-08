import * as signalR from '@microsoft/signalr'
import { getToken } from './auth'

const BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7034'

let connection

export function getConnection() {
  return connection
}

export async function startLeaderboardConnection() {
  if (connection?.state === 'Connected') return connection
  // Create connection with Hub URL and provide jwt token to server
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${BASE_URL}/hubs/leaderboard`, {
      accessTokenFactory: () => getToken() || '' // provide jwt token to server
    })
    // Automatically reconnect
    .withAutomaticReconnect()
    .build()

  await connection.start()
  return connection
}

export async function stopLeaderboardConnection() {
  // Stop connection when leaving page to avoid memory leak
  if (connection && (connection.state === 'Connected' || connection.state === 'Connecting')) {
    await connection.stop()
  }
}

let messageConnection;

export function getMessageConnection() {
  return messageConnection;
}

export async function startMessageConnection() {
  if (messageConnection?.state === 'Connected') return messageConnection;

  messageConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hubs/message`, {
          accessTokenFactory: () => getToken() || ''
      })
      .withAutomaticReconnect()
      .build();

  messageConnection.on("ReceiveMessage", (senderId, message) => {
      console.log(`Message from ${senderId}: ${message}`);
  });

  await messageConnection.start();
  return messageConnection;
}

export async function stopMessageConnection() {
  if (messageConnection && (messageConnection.state === 'Connected' || messageConnection.state === 'Connecting')) {
      await messageConnection.stop();
  }
}