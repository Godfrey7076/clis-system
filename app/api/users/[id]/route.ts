import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserType } from '@prisma/client'

interface Params {
    params: {
        id: string
    }
}

// GET - Get single user
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const user = await prisma.userProfile.findUnique({
            where: { id: params.id }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ user })
    } catch (error) {
        console.error('Get user error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        )
    }
}

// PUT - Update user
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const { cardId, name, email, faceEncoding, userType, expiresAt } = await request.json()

        // Check if cardId is being changed and if it already exists
        if (cardId) {
            const existingUser = await prisma.userProfile.findFirst({
                where: {
                    cardId,
                    NOT: { id: params.id }
                }
            })

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Another user with this Card ID already exists' },
                    { status: 400 }
                )
            }
        }

        const user = await prisma.userProfile.update({
            where: { id: params.id },
            data: {
                ...(cardId && { cardId }),
                ...(name && { name }),
                ...(email !== undefined && { email }),
                ...(faceEncoding && { faceEncoding }),
                ...(userType && { userType }),
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        })

        return NextResponse.json({ user })
    } catch (error) {
        console.error('Update user error:', error)
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        )
    }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        await prisma.userProfile.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete user error:', error)
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        )
    }
}