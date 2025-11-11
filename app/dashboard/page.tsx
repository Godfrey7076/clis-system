// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'

interface ScanEvent {
  id: string
  status: 'IDENTIFIED' | 'DENIED' | 'VISITOR'
  timestamp: string
  confidence?: number
  user?: {
    name?: string
    cardId: string
    userType: string
  }
}

export default function Dashboard() {
  const [scanEvents, setScanEvents] = useState<ScanEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const pollEvents = async () => {
      try {
        const response = await fetch('/api/scan')
        if (response.ok) {
          const data = await response.json()
          setScanEvents(data.events || [])
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Failed to fetch events:', error)
        setIsConnected(false)
      }
    }

    pollEvents()
    const interval = setInterval(pollEvents, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IDENTIFIED': return 'bg-green-100 text-green-800 border-green-300'
      case 'DENIED': return 'bg-red-100 text-red-800 border-red-300'
      case 'VISITOR': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IDENTIFIED': return '✅'
      case 'DENIED': return '❌'
      case 'VISITOR': return '👤'
      default: return '❓'
    }
  }

  const clearEvents = () => {
    setScanEvents([])
  }

  const generateTestEvent = async () => {
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faceEncoding: { simulated: true }
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Test event generated:', result)
      }
    } catch (error) {
      console.error('Failed to generate test event:', error)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                Checkpoint Live-Scan Identity System
              </h1>
              <p style={{ color: '#6b7280' }}>
                Real-time identity verification and monitoring dashboard
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                backgroundColor: isConnected ? '#dcfce7' : '#fee2e2',
                color: isConnected ? '#166534' : '#991b1b'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: isConnected ? '#22c55e' : '#ef4444'
                }}></div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <button
                onClick={generateTestEvent}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Test Scan
              </button>
              <button
                onClick={clearEvents}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Clear Events
              </button>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1.5rem'
        }}>
          {/* Stats Overview */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            border: '1px solid #bfdbfe'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#1f2937'
            }}>System Overview</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#6b7280' }}>Total Scans:</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1f2937' }}>
                  {scanEvents.length}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#6b7280' }}>Identified:</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#16a34a' }}>
                  {scanEvents.filter(e => e.status === 'IDENTIFIED').length}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#6b7280' }}>Denied:</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#dc2626' }}>
                  {scanEvents.filter(e => e.status === 'DENIED').length}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#6b7280' }}>Visitors:</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#2563eb' }}>
                  {scanEvents.filter(e => e.status === 'VISITOR').length}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>Real-time Scan Events</h2>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {scanEvents.length} events
                </span>
              </div>
            </div>
            
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {scanEvents.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', color: '#9ca3af', marginBottom: '1rem' }}>👁️</div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.5rem' }}>
                    No scan events yet
                  </h3>
                  <p style={{ color: '#9ca3af' }}>
                    Click "Test Scan" to generate demo events
                  </p>
                </div>
              ) : (
                <div style={{ borderTop: '1px solid #f3f4f6' }}>
                  {scanEvents.map((event) => (
                    <div 
                      key={event.id} 
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            border: '1px solid',
                            ...(event.status === 'IDENTIFIED' ? {
                              backgroundColor: '#dcfce7',
                              color: '#166534',
                              borderColor: '#bbf7d0'
                            } : event.status === 'DENIED' ? {
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              borderColor: '#fecaca'
                            } : {
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              borderColor: '#bfdbfe'
                            })
                          }}>
                            <span>{getStatusIcon(event.status)}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{event.status}</span>
                          </div>
                          
                          <div>
                            <div style={{ fontWeight: '500', color: '#1f2937' }}>
                              {event.user?.name || event.user?.cardId || 'Unknown User'}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              Card: {event.user?.cardId || 'N/A'} • Type: {event.user?.userType || 'UNKNOWN'}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {new Date(event.timestamp).toLocaleDateString()}
                          </div>
                          {event.confidence && (
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                              Confidence: {(event.confidence * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}