import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_WS_URL;

export function useDashboardTopic<T>(topic: string) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    // Không cố gắng kết nối nếu chưa cấu hình WS URL hợp lệ
    if (!SOCKET_URL || typeof SOCKET_URL !== 'string') {
      console.warn('VITE_BACKEND_WS_URL is not set. Skipping dashboard websocket connection.');
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(topic, (message) => {
          try {
            const parsed = JSON.parse(message.body) as T;
            setData(parsed);
          } catch (err) {
            console.error(`❌ Parse error on topic ${topic}`, err);
          }
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP error", frame);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [topic]);

  return data;
}
