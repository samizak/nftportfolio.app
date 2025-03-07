"use client";

import { useState, useEffect, useCallback } from "react";

interface EventSourceOptions {
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
}

export function useEventSource(url: string | null, options: EventSourceOptions = {}) {
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!url) return;

    try {
      const newEventSource = new EventSource(url);

      newEventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        options.onOpen?.();
      };

      newEventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          options.onMessage?.(data);
        } catch (err) {
          console.error('Error parsing event data:', err);
        }
      };

      newEventSource.onerror = (event) => {
        setIsConnected(false);
        setError('EventSource connection error');
        options.onError?.(event);
      };

      setEventSource(newEventSource);

      return () => {
        newEventSource.close();
        setEventSource(null);
        setIsConnected(false);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create EventSource');
    }
  }, [url, options]);

  useEffect(() => {
    const cleanup = connect();
    return () => cleanup?.();
  }, [connect]);

  const disconnect = useCallback(() => {
    eventSource?.close();
    setEventSource(null);
    setIsConnected(false);
  }, [eventSource]);

  return {
    isConnected,
    error,
    connect,
    disconnect
  };
}