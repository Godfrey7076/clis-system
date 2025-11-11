// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { cardId, image, userData } = await request.json()
    
    const existingUser = await prisma.userProfile.findUnique({
      where: { cardId }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this card ID already exists' },
        { status: 400 }
      )
    }
    
    const faceEncoding = JSON.stringify({ 
      simulated: true, 
      timestamp: new Date().toISOString(),
      cardId 
    })
    
    const user = await prisma.userProfile.create({
      data: {
        cardId,
        faceEncoding,
        name: userData?.name || `User_${cardId}`,
        email: userData?.email,
        userType: userData?.userType || 'REGULAR',
        expiresAt: userData?.expiresAt ? new Date(userData.expiresAt) : null,
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        cardId: user.cardId,
        name: user.name 
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const users = await prisma.userProfile.findMany({
      include: {
        scanEvents: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 5
        }
      }
    })
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}