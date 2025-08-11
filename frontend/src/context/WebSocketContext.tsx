import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Component } from '../types';

interface UserActivity {
  user_id: string;
  activity: string;
  details?: string;
  timestamp: string;
}

interface ComponentUpdate {
  action: 'create' | 'update' | 'delete';
  component: Component;
  user_id?: string;
  timestamp: string;
}

interface AnalyticsUpdate {
  totalComponents: number;
  totalTowers: number;
  statusDistribution: Record<string, number>;
  complexityDistribution: Record<string, number>;
  lastUpdated: string;
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  userCount: number;
  recentActivities: UserActivity[];
  sendUserActivity: (activity: string, details?: string) => void;
  requestAnalyticsUpdate: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔗 Connected to real-time server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from real-time server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
    });

    // User count updates
    newSocket.on('user_count_update', (data: { count: number }) => {
      setUserCount(data.count);
    });

    // Recent activities
    newSocket.on('recent_activities', (data: { activities: UserActivity[] }) => {
      setRecentActivities(data.activities);
    });

    // User activity updates
    newSocket.on('user_activity', (activity: UserActivity) => {
      setRecentActivities(prev => {
        const updated = [...prev, activity];
        // Keep only last 20 activities
        return updated.slice(-20);
      });
    });

    // Component updates (handled by DataContext)
    newSocket.on('component_update', (update: ComponentUpdate) => {
      console.log('📦 Component update received:', update);
      // This will be handled by DataContext
      window.dispatchEvent(new CustomEvent('component_update', { detail: update }));
    });

    // Analytics updates (handled by pages that need it)
    newSocket.on('analytics_update', (data: AnalyticsUpdate) => {
      console.log('📊 Analytics update received:', data);
      window.dispatchEvent(new CustomEvent('analytics_update', { detail: data }));
    });

    // Upload progress
    newSocket.on('upload_progress', (data: any) => {
      console.log('📤 Upload progress:', data);
      window.dispatchEvent(new CustomEvent('upload_progress', { detail: data }));
    });

    // Upload complete
    newSocket.on('upload_complete', (data: any) => {
      console.log('✅ Upload complete:', data);
      window.dispatchEvent(new CustomEvent('upload_complete', { detail: data }));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const sendUserActivity = (activity: string, details?: string) => {
    if (socket && isConnected) {
      socket.emit('user_activity', { activity, details });
    }
  };

  const requestAnalyticsUpdate = () => {
    if (socket && isConnected) {
      socket.emit('request_analytics_update');
    }
  };

  const contextValue: WebSocketContextType = {
    socket,
    isConnected,
    userCount,
    recentActivities,
    sendUserActivity,
    requestAnalyticsUpdate,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;
