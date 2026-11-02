import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // keep your existing path

type Ack = { ok: boolean; error?: string };

@Injectable({ providedIn: 'root' })
export class SocketService {
  private platformId = inject(PLATFORM_ID);
  private socket: Socket | null = null;

  // Rooms to rejoin automatically after a reconnect
  private orderRooms = new Set<string>();
  private inWorkerRoom = false;
  private inAdminRoom = false;

  // CHANGE THIS if your login token is stored somewhere else
  private getToken(): string | null {
    return localStorage.getItem('userToken');
  }

  /** Safe to call many times. Called automatically by every method below. */
  connect(): void {
    if (!isPlatformBrowser(this.platformId) || this.socket) return;

    this.socket = io(environment.socketURL, {
      auth: { token: this.getToken() },
    });

    this.socket.onAny((event, ...args) => console.log('SOCKET EVENT:', event, args));
    // Rooms are lost when the connection drops, so rejoin them on every (re)connect
    this.socket.on('connect', () => {
      this.orderRooms.forEach((id) => this.socket!.emit('joinOrderRoom', id));
      if (this.inWorkerRoom) this.socket!.emit('joinWorkerRoom');
      if (this.inAdminRoom) this.socket!.emit('joinAdminRoom');
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection failed:', err.message);
    });
  }

  /** Call this on logout, so the next login connects with the new token. */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.orderRooms.clear();
    this.inWorkerRoom = false;
    this.inAdminRoom = false;
  }

  // ---------- Customer ----------
  joinOrderRoom(orderId: string, onResult?: (res: Ack) => void): void {
    this.connect();
    this.orderRooms.add(orderId);
    this.socket?.emit('joinOrderRoom', orderId, (res: Ack) => {
      if (!res?.ok) this.orderRooms.delete(orderId);
      onResult?.(res);
    });
  }

  leaveOrderRoom(orderId: string): void {
    this.orderRooms.delete(orderId);
    this.socket?.emit('leaveOrderRoom', orderId);
  }

  // ---------- Delivery worker ----------
  // workerId is accepted so your existing code compiles, but the server now
  // uses the id from the login token, so nobody can join another worker's room.
  joinWorkerRoom(workerId?: string, onResult?: (res: Ack) => void): void {
    this.connect();
    this.inWorkerRoom = true;
    this.socket?.emit('joinWorkerRoom', workerId, (res: Ack) => {
      if (!res?.ok) this.inWorkerRoom = false;
      onResult?.(res);
    });
  }

  sendLocation(orderId: string, lat: number, lng: number, onResult?: (res: Ack) => void): void {
    this.connect();
    this.socket?.emit('sendLocation', { orderId, lat, lng }, (res: Ack) => {
      if (!res?.ok) console.warn('Location rejected:', res?.error);
      onResult?.(res);
    });
  }

  // ---------- Admin ----------
  joinAdminRoom(onResult?: (res: Ack) => void): void {
    this.connect();
    this.inAdminRoom = true;
    this.socket?.emit('joinAdminRoom', undefined, (res: Ack) => {
      if (!res?.ok) this.inAdminRoom = false;
      onResult?.(res);
    });
  }

  // ---------- Listening ----------
  listen<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      this.connect();
      const handler = (data: T) => subscriber.next(data);
      this.socket?.on(event, handler);
      // remove only THIS handler, not every listener of the event
      return () => this.socket?.off(event, handler);
    });
  }
}
