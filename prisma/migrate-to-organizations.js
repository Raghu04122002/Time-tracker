// Migration script to create Minara organization and migrate existing user
// Run with: NODE_ENV=development node prisma/migrate-to-organizations.js

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Starting organization migration...')

    // Step 1: Create Minara organization
    console.log('Creating Minara organization...')
    const minaraOrg = await prisma.organization.upsert({
        where: { name: 'Minara' },
        update: {},
        create: {
            name: 'Minara',
        },
    })
    console.log(`✓ Created/found organization: ${minaraOrg.name} (ID: ${minaraOrg.id})`)

    // Step 2: Update user raghavender0412@gmail.com
    console.log('Migrating user raghavender0412@gmail.com to Minara...')
    const user = await prisma.user.update({
        where: { email: 'raghavender0412@gmail.com' },
        data: { organizationId: minaraOrg.id },
    })
    console.log(`✓ Updated user: ${user.email} -> Organization: ${minaraOrg.name}`)

    // Step 3: Update all time entries for this user
    console.log('Migrating time entries...')
    const result = await prisma.timeEntry.updateMany({
        where: { userId: user.id },
        data: { organizationId: minaraOrg.id },
    })
    console.log(`✓ Updated ${result.count} time entries`)

    console.log('\n✅ Migration complete!')
    console.log(`Organization ID: ${minaraOrg.id}`)
    console.log(`User: ${user.email}`)
    console.log(`Time entries: ${result.count}`)
}

main()
    .catch((e) => {
        console.error('❌ Migration failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
