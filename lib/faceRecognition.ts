// Custom face recognition utility without external dependencies

export interface FaceMatch {
    user: any
    distance: number
    confidence: number
}

export class FaceRecognition {
    private static instance: FaceRecognition

    public static getInstance(): FaceRecognition {
        if (!FaceRecognition.instance) {
            FaceRecognition.instance = new FaceRecognition()
        }
        return FaceRecognition.instance
    }

    // Simulate face encoding generation (128-dimensional vector)
    public generateFaceEncoding(seed?: string): string {
        if (seed) {
            // Deterministic encoding based on seed for consistent testing
            const encoder = new TextEncoder()
            const data = encoder.encode(seed)
            const encoding = Array.from({ length: 128 }, (_, i) => {
                const val = (data[i % data.length] / 255) * 2 - 1
                return val.toFixed(6)
            }).join(',')
            return btoa(encoding)
        } else {
            // Random encoding
            const encoding = Array(128)
                .fill(0)
                .map(() => (Math.random() * 2 - 1).toFixed(6))
                .join(',')
            return btoa(encoding)
        }
    }

    // Calculate Euclidean distance between two face encodings
    private calculateDistance(encoding1: string, encoding2: string): number {
        try {
            const arr1 = atob(encoding1).split(',').map(Number)
            const arr2 = atob(encoding2).split(',').map(Number)

            if (arr1.length !== arr2.length || arr1.length !== 128) {
                return 1.0 // Invalid encoding
            }

            let sum = 0
            for (let i = 0; i < arr1.length; i++) {
                sum += Math.pow(arr1[i] - arr2[i], 2)
            }
            return Math.sqrt(sum)
        } catch (error) {
            return 1.0 // Maximum distance if error
        }
    }

    // Find best match from available users
    public findBestMatch(
        inputEncoding: string,
        users: any[],
        threshold: number = 0.6
    ): FaceMatch | null {
        let bestMatch: FaceMatch | null = null
        let minDistance = Infinity

        for (const user of users) {
            if (!user.faceEncoding) continue

            const distance = this.calculateDistance(inputEncoding, user.faceEncoding)

            if (distance < minDistance) {
                minDistance = distance
                bestMatch = {
                    user,
                    distance,
                    confidence: Math.max(0, 1 - distance)
                }
            }
        }

        // Only return match if confidence meets threshold
        if (bestMatch && bestMatch.confidence >= threshold) {
            return bestMatch
        }

        return null
    }

    // Validate face encoding format
    public validateFaceEncoding(encoding: string): boolean {
        try {
            const decoded = atob(encoding)
            const numbers = decoded.split(',').map(Number)
            return numbers.length === 128 && numbers.every(n => !isNaN(n) && n >= -1 && n <= 1)
        } catch {
            return false
        }
    }

    // Get match quality description
    public getMatchQuality(confidence: number): string {
        if (confidence >= 0.9) return 'Excellent'
        if (confidence >= 0.8) return 'Very Good'
        if (confidence >= 0.7) return 'Good'
        if (confidence >= 0.6) return 'Fair'
        return 'Poor'
    }
}