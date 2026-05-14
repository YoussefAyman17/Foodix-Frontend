import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;

  constructor() {
    if (typeof window !== 'undefined') {
      this.socket = io('http://localhost:3000');
    }
  }

  listen<T = unknown>(eventName: string): Observable<T> {
    return new Observable((subscriber) => {
      if (!this.socket) {
        subscriber.complete();
        return undefined;
      }

      const handler = (data: T) => {
        subscriber.next(data);
      };

      this.socket.on(eventName, handler);
      return () => this.socket?.off(eventName, handler);
    });
  }

  emit<T = unknown>(eventName: string, data: T): void {
    this.socket?.emit(eventName, data);
  }
}
