'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import FaceScanTest from './components/FaceScanTest'

interface User {
  id: string
  cardId: string
  name: string
  email: string
  userType: string
}

interface ScanEvent {
  id: string
  status: string
  confidence: number | null
  timestamp: string
  user: User | null
}

interface Statistics {
  totalScans: number
  identified: number
  denied: number
  visitors: number
}

export default function Home() {
  const [events, setEvents] = useState<ScanEvent[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    totalScans: 0,
    identified: 0,
    denied: 0,
    visitors: 0
  })
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [scanResult, setScanResult] = useState<any>(null)

  // Fetch events and statistics
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/scan')
      const data = await response.json()
      setEvents(data.events || [])
      setStatistics(data.statistics || {
        totalScans: 0,
        identified: 0,
        denied: 0,
        visitors: 0
      })
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  }

  // Test scan function
  const handleTestScan = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faceEncoding: 'test_encoding_' + Date.now()
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Scan successful:', data)

      // Refresh events after successful scan
      await fetchEvents()

    } catch (error) {
      console.error('Scan failed:', error)
      alert('Scan failed: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Clear events function
  const handleClearEvents = async () => {
    if (confirm('Are you sure you want to clear all scan events?')) {
      // This would need a separate API endpoint to clear events
      alert('Clear events functionality would be implemented here')
      await fetchEvents()
    }
  }

  // Play notification sound
  const playNotificationSound = () => {
    // Simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('Audio not supported')
    }
  }

  // Handle scan results from FaceScanTest
  const handleScanResult = (result: any) => {
    setScanResult(result)
    if (result.success) {
      fetchEvents() // Refresh events on successful scan
    }
  }

  // Auto-refresh effect
  useEffect(() => {
    fetchEvents() // Initial load

    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchEvents()
    }, 3000) // Refresh every 3 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Play sound when new events are added
  useEffect(() => {
    if (events.length > 0) {
      playNotificationSound()
    }
  }, [events.length])

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Checkpoint Live-Scan Identity System
              </h1>
              <p className="text-gray-600">
                Real-time identity verification and monitoring dashboard
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>Last updated: {lastUpdate.toLocaleTimeString()}</div>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>

          {/* Connection Status & Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-700 font-medium">Connected</span>
            </div>
            <button
              onClick={handleTestScan}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Scanning...' : 'Test Scan'}
            </button>
            <button
              onClick={handleClearEvents}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              Clear Events
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-md ${autoRefresh
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
            >
              {autoRefresh ? 'Pause Auto-refresh' : 'Start Auto-refresh'}
            </button>
            <Link
              href="/users"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            >
              Manage Users
            </Link>
          </div>
        </div>

        {/* Facial Recognition Scanner */}
        <FaceScanTest onScanResult={handleScanResult} />

        {/* Scan Results Display */}
        {scanResult && (
          <div className={`p-4 rounded-md mb-6 ${scanResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`font-medium ${scanResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {scanResult.message || scanResult.error}
                </p>
                {scanResult.confidence && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Confidence:</span> {(scanResult.confidence * 100).toFixed(1)}%
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {scanResult.matchQuality} match
                      </span>
                    </p>
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Distance:</span> {scanResult.distance}
                    </p>
                    {scanResult.user && (
                      <p className="text-sm text-green-700">
                        <span className="font-medium">User Type:</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${scanResult.userType === 'REGULAR'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                          }`}>
                          {scanResult.userType}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setScanResult(null)}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <h3 className="text-lg font-semibold text-gray-700">Total Scans</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{statistics.totalScans}</p>
            <p className="text-sm text-gray-500 mt-1">All time scans</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <h3 className="text-lg font-semibold text-gray-700">Identified</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{statistics.identified}</p>
            <p className="text-sm text-gray-500 mt-1">Authorized access</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <h3 className="text-lg font-semibold text-gray-700">Denied</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">{statistics.denied}</p>
            <p className="text-sm text-gray-500 mt-1">Unauthorized</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <h3 className="text-lg font-semibold text-gray-700">Visitors</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">{statistics.visitors}</p>
            <p className="text-sm text-gray-500 mt-1">Temporary access</p>
          </div>
        </div>

        {/* Recent Scan Events */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Real-time Scan Events</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Showing {events.length} most recent
              </span>
              <button
                onClick={fetchEvents}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Refresh Now
              </button>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p>No scan events yet.</p>
              <p className="text-sm mt-1">Use the facial recognition scanner above to start scanning.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event, index) => (
                    <tr
                      key={event.id}
                      className={index === 0 ? 'bg-blue-50 animate-pulse' : 'hover:bg-gray-50'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {new Date(event.timestamp).toLocaleString()}
                          {index === 0 && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              NEW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.user ? (
                          <div>
                            <div className="font-medium">{event.user.name}</div>
                            <div className="text-gray-500 text-xs">{event.user.cardId}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${event.status === 'IDENTIFIED'
                            ? 'bg-green-100 text-green-800'
                            : event.status === 'VISITOR'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.confidence ? (
                          <div>
                            <div className="font-medium">{(event.confidence * 100).toFixed(1)}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${event.confidence > 0.8 ? 'bg-green-500' :
                                    event.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${event.confidence * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.user?.userType && (
                          <span className={`px-2 py-1 text-xs rounded-full ${event.user.userType === 'REGULAR'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-orange-100 text-orange-800'
                            }`}>
                            {event.user.userType}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System Status Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>CLIS System v1.0 • Facial Recognition Active • {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}