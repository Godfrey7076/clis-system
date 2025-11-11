import { PrismaClient, UserType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Clear existing data
    await prisma.scanEvent.deleteMany()
    await prisma.userProfile.deleteMany()

    // Create sample users
    const users = await prisma.userProfile.createMany({
        data: [
            {
                cardId: 'EMP001',
                name: 'John Doe',
                email: 'john@company.com',
                faceEncoding: 'sample_encoding_1',
                userType: UserType.REGULAR,
            },
            {
                cardId: 'EMP002',
                name: 'Jane Smith',
                email: 'jane@company.com',
                faceEncoding: 'sample_encoding_2',
                userType: UserType.REGULAR,
            },
            {
                cardId: 'VIS001',
                name: 'Guest Visitor',
                email: 'visitor@example.com',
                faceEncoding: 'sample_encoding_3',
                userType: UserType.VISITOR,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
            }
        ]
    })

    console.log('Database seeded successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })