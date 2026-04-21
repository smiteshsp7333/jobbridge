import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
let globalSocket: Socket | null = null;

export const useSocket = (onEvent: (event: string, data: any) => void, userId?: string) => {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(SOCKET_URL, { transports: ['websocket'] });
    }
    const socket = globalSocket;
    
    if (userId) {
      socket.emit('join_employer', userId);
    }

    const handleNewApp = (data: any) => handlerRef.current('new_application', data);
    const handleStatusChange = (data: any) => handlerRef.current('status_changed', data);

    socket.on('new_application', handleNewApp);
    socket.on('status_changed', handleStatusChange);

    return () => {
      socket.off('new_application', handleNewApp);
      socket.off('status_changed', handleStatusChange);
    };
  }, [userId]);
};

export default useSocket;
