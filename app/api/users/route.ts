import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserType } from '@prisma/client'

// GET - Fetch all users
export async function GET() {
    try {
        const users = await prisma.userProfile.findMany({
            orderBy: {
                createdAt: 'desc'
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

// POST - Create new user
export async function POST(request: NextRequest) {
    try {
        const { cardId, name, email, faceEncoding, userType, expiresAt } = await request.json()

        // Validate required fields
        if (!cardId || !name || !faceEncoding) {
            return NextResponse.json(
                { error: 'Card ID, name, and face encoding are required' },
                { status: 400 }
            )
        }

        // Check if cardId already exists
        const existingUser = await prisma.userProfile.findUnique({
            where: { cardId }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this Card ID already exists' },
                { status: 400 }
            )
        }

        const user = await prisma.userProfile.create({
            data: {
                cardId,
                name,
                email,
                faceEncoding,
                userType: userType || UserType.REGULAR,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        })

        return NextResponse.json({ user }, { status: 201 })
    } catch (error) {
        console.error('Create user error:', error)
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        )
    }
}