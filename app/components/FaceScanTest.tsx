'use client'

import { useState } from 'react'
import { FaceRecognition } from '@/lib/faceRecognition'

interface FaceScanTestProps {
    onScanResult: (result: any) => void
}

export default function FaceScanTest({ onScanResult }: FaceScanTestProps) {
    const [isScanning, setIsScanning] = useState(false)
    const [scanImage, setScanImage] = useState<string | null>(null)
    const faceRecognition = FaceRecognition.getInstance()

    const handleScan = async () => {
        setIsScanning(true)

        // Simulate camera capture delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Generate a random face encoding for testing
        const faceEncoding = faceRecognition.generateFaceEncoding()

        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ faceEncoding }),
            })

            const result = await response.json()
            onScanResult(result)

            // Generate a random face image (placeholder)
            setScanImage(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`)

        } catch (error) {
            console.error('Scan error:', error)
            onScanResult({ error: 'Scan failed' })
        } finally {
            setIsScanning(false)
        }
    }

    const handleKnownUserScan = async (userName: string) => {
        setIsScanning(true)

        // Simulate camera capture delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Generate a deterministic encoding that should match a known user
        const faceEncoding = faceRecognition.generateFaceEncoding(userName.toLowerCase().replace(' ', '_'))

        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ faceEncoding }),
            })

            const result = await response.json()
            onScanResult(result)

            // Generate a consistent face image for known users
            setScanImage(`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`)

        } catch (error) {
            console.error('Scan error:', error)
            onScanResult({ error: 'Scan failed' })
        } finally {
            setIsScanning(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Facial Recognition Scanner</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Scanner Preview */}
                <div className="lg:col-span-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center bg-gray-50 mb-4">
                        {scanImage ? (
                            <div className="text-center">
                                <img
                                    src={scanImage}
                                    alt="Scan result"
                                    className="h-24 w-24 rounded-full object-cover mx-auto mb-2"
                                />
                                <p className="text-sm text-gray-600">Face Captured</p>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <div className="text-4xl mb-2">📷</div>
                                <p>Scanner Ready</p>
                                <p className="text-xs mt-1">Position face in frame</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleScan}
                            disabled={isScanning}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {isScanning ? '🔍 Scanning...' : '🎭 Random Scan'}
                        </button>
                        <button
                            onClick={() => handleKnownUserScan('John Doe')}
                            disabled={isScanning}
                            className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {isScanning ? '🔍 Scanning...' : '👨‍💼 Test John Doe'}
                        </button>
                    </div>
                </div>

                {/* Instructions & Quick Tests */}
                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Quick Tests:</h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleKnownUserScan('Jane Smith')}
                                disabled={isScanning}
                                className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm disabled:opacity-50"
                            >
                                👩‍💼 Test Jane Smith
                            </button>
                            <button
                                onClick={() => handleKnownUserScan('Guest Visitor')}
                                disabled={isScanning}
                                className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm disabled:opacity-50"
                            >
                                🧳 Test Guest Visitor
                            </button>
                            <button
                                onClick={() => handleKnownUserScan('Unknown Person')}
                                disabled={isScanning}
                                className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm disabled:opacity-50"
                            >
                                ❌ Test Unknown Person
                            </button>
                        </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <h4 className="font-medium text-blue-800 mb-1">How it works:</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Each user has a unique 128D face encoding</li>
                            <li>• System calculates Euclidean distance</li>
                            <li>• Confidence = 1 - distance (0-1 scale)</li>
                            <li>• Match threshold: 0.6 (60% confidence)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}