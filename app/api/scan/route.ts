import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserType, ScanStatus } from '@prisma/client'
import { FaceRecognition } from '@/lib/faceRecognition'

const faceRecognition = FaceRecognition.getInstance()

export async function POST(request: NextRequest) {
  try {
    const { faceEncoding } = await request.json()

    if (!faceEncoding) {
      return NextResponse.json(
        { error: 'Face encoding is required' },
        { status: 400 }
      )
    }

    // Validate face encoding format
    if (!faceRecognition.validateFaceEncoding(faceEncoding)) {
      return NextResponse.json(
        { error: 'Invalid face encoding format' },
        { status: 400 }
      )
    }

    // Find users with valid access (not expired)
    const users = await prisma.userProfile.findMany({
      where: {
        OR: [
          { expiresAt: null }, // Permanent users
          { expiresAt: { gt: new Date() } } // Not expired visitors
        ]
      }
    })

    // Perform face matching
    const match = faceRecognition.findBestMatch(faceEncoding, users, 0.6)

    let matchedUser = null
    let confidence = 0
    let distance = 0

    if (match) {
      matchedUser = match.user
      confidence = match.confidence
      distance = match.distance
    }

    // Determine status based on user type and match
    let status: ScanStatus
    if (matchedUser?.userType === UserType.VISITOR) {
      status = ScanStatus.VISITOR
    } else if (matchedUser) {
      status = ScanStatus.IDENTIFIED
    } else {
      status = ScanStatus.DENIED
    }

    const scanEvent = await prisma.scanEvent.create({
      data: {
        userId: matchedUser?.id,
        status,
        confidence: matchedUser ? confidence : null,
      },
      include: {
        user: true
      }
    })

    return NextResponse.json({
      success: true,
      status,
      user: matchedUser,
      userType: matchedUser?.userType,
      confidence: matchedUser ? Math.round(confidence * 100) / 100 : null,
      distance: matchedUser ? Math.round(distance * 1000) / 1000 : null,
      matchQuality: matchedUser ? faceRecognition.getMatchQuality(confidence) : null,
      eventId: scanEvent.id,
      message: matchedUser
        ? `Identity verified: ${matchedUser.name} (${faceRecognition.getMatchQuality(confidence)} match)`
        : 'No matching identity found'
    })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json(
      { error: 'Scan failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const events = await prisma.scanEvent.findMany({
      include: {
        user: {
          select: {
            id: true,
            cardId: true,
            name: true,
            email: true,
            userType: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50
    })

    // Calculate statistics
    const totalScans = events.length
    const identified = events.filter(e => e.status === ScanStatus.IDENTIFIED).length
    const denied = events.filter(e => e.status === ScanStatus.DENIED).length
    const visitors = events.filter(e => e.status === ScanStatus.VISITOR).length

    return NextResponse.json({
      events,
      statistics: {
        totalScans,
        identified,
        denied,
        visitors
      }
    })
  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}