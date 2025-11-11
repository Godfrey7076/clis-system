// app/api/scan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { faceEncoding } = await request.json()
    
    const users = await prisma.userProfile.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    })
    
    let matchedUser = null
    let confidence = 0
    
    if (users.length > 0) {
      matchedUser = users[Math.floor(Math.random() * users.length)]
      confidence = 0.7 + Math.random() * 0.3
    }
    
    const status = matchedUser ? 'IDENTIFIED' : 'DENIED'
    
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
      confidence: matchedUser ? Math.round(confidence * 100) / 100 : null,
      eventId: scanEvent.id
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
        user: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50
    })
    
    return NextResponse.json({ events })
  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}