import { WebSocket } from "ws";

export class RoomManager {
  private static instance: RoomManager;
  // Map should also contain user names also
  private rooms: Map<string, Map<string, { ws: WebSocket, name: string }>> = new Map();

  private constructor() {}

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  public joinRoom(roomId: string, userId: string, name: string, ws: WebSocket): boolean {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
    }
    const room = this.rooms.get(roomId)!;
    const isNewUser = !room.has(userId);
    room.set(userId, { ws, name}); // Assuming name is same as userId for now
    return isNewUser; // true = first time joining, false = reconnecting
  }

  public leaveRoom(roomId: string, userId: string, ws: WebSocket): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      const currentWs = room.get(userId)?.ws;
      // Only remove if this is the active socket for this user
      if (currentWs === ws) {
        room.delete(userId);
        if (room.size === 0) {
          this.rooms.delete(roomId);
        }
        return true;
      }
    }
    return false; // stale socket — user already reconnected with a new one
  }

  public broadcast(roomId: string, message: string, excludeUserId?: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.forEach(({ ws }, userId) => {
        if (!excludeUserId || userId !== excludeUserId) {
          ws.send(message);
        }
      });
    }
  }

  public getUsersInRoom(roomId: string): { userId: string, name: string }[] | undefined {
    const room = this.rooms.get(roomId);
    if( room ){
      return Array.from(room.entries()).map(([userId, { name }]) => ({ userId, name }));
    }
  }

  public getRoomByUserId(userId: string): string | null {
    for (const [roomId, users] of this.rooms.entries()) {
      if (users.has(userId)) {
        return roomId;
      }
    }
    return null;
  }
}
