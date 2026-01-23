"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { storageUtils } from "@/lib/storage"
import type { Notification } from "@/types/notification"

const getWebSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
  return apiUrl.replace(/^http/, "ws")
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    const token = storageUtils.getAccessToken()
    if (!token) {
      console.log("No access token found, skipping WebSocket connection")
      return
    }

    // Don't connect if already connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected")
      return
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    try {
      const wsUrl = getWebSocketUrl()
      const fullUrl = `${wsUrl}/ws/notifications?token=${encodeURIComponent(token)}`
      const maskedUrl = fullUrl.replace(token, "***")
      console.log("Connecting to WebSocket:", maskedUrl)
      console.log("WebSocket URL:", wsUrl)
      
      const ws = new WebSocket(fullUrl)
      
      let closeHandled = false
      
      ws.onopen = () => {
        setIsConnected(true)
        reconnectAttempts.current = 0
        closeHandled = false
        console.log("WebSocket connected successfully")
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === "connected") {
            console.log("WebSocket: ", data.message)
          } else if (data.type === "notification" && data.data) {
            const notification = data.data as Notification
            setNotifications((prev) => [notification, ...prev])
            setUnreadCount((prev) => prev + 1)
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error event:", error)
        console.error("WebSocket readyState:", ws.readyState)
        console.error("WebSocket URL attempted:", maskedUrl)
        setIsConnected(false)
      }

      ws.onclose = (event) => {
        if (closeHandled) return
        closeHandled = true
        
        setIsConnected(false)
        const { code, reason, wasClean } = event
        console.log(`WebSocket disconnected: code=${code}, reason=${reason || "none"}, wasClean=${wasClean}`)
        console.log(`WebSocket URL was: ${maskedUrl}`)
        
        // WebSocket close codes:
        // 1000 = Normal closure
        // 1001 = Going away
        // 1002 = Protocol error
        // 1003 = Unsupported data
        // 1006 = Abnormal closure (no close frame)
        // 1008 = Policy violation (unauthorized)
        // 1011 = Internal error
        
        if (code === 1006) {
          console.error("WebSocket connection failed - server may be unreachable or connection refused")
        } else if (code === 1008) {
          console.error("WebSocket connection rejected - unauthorized (invalid token)")
          return
        } else if (code === 1000) {
          console.log("WebSocket closed normally")
          return
        }
        
        // Attempt to reconnect for other errors
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`)
            connect()
          }, delay)
        } else {
          console.error("Max reconnection attempts reached. Please check:")
          console.error("1. Is the backend server running?")
          console.error("2. Is the WebSocket URL correct?", wsUrl)
          console.error("3. Is your access token valid?")
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      setIsConnected(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev])
    if (!notification.read) {
      setUnreadCount((prev) => prev + 1)
    }
  }, [])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notificationId && !n.read) {
          setUnreadCount((count) => Math.max(0, count - 1))
          return { ...n, read: true }
        }
        return n
      })
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    )
    setUnreadCount(0)
  }, [])

  const setNotificationsList = useCallback((list: Notification[]) => {
    setNotifications(list)
    setUnreadCount(list.filter((n) => !n.read).length)
  }, [])

  useEffect(() => {
    // Only connect in browser environment
    if (typeof window === "undefined") {
      return
    }

    // Small delay to ensure component is mounted
    const timeoutId = setTimeout(() => {
      const token = storageUtils.getAccessToken()
      if (token) {
        connect()
      } else {
        disconnect()
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      disconnect()
    }
  }, [connect, disconnect])

  useEffect(() => {
    const checkToken = () => {
      const token = storageUtils.getAccessToken()
      if (!token && isConnected) {
        disconnect()
      } else if (token && !isConnected) {
        connect()
      }
    }

    // Check periodically (every 5 seconds)
    const interval = setInterval(checkToken, 5000)
    return () => clearInterval(interval)
  }, [isConnected, connect, disconnect])

  return {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    setNotificationsList,
    reconnect: connect,
  }
}
