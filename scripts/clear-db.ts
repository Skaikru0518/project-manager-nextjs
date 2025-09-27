import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Clearing database...')

  await prisma.userFinance.deleteMany()
  console.log('✅ Deleted all user finances')

  await prisma.projectFinance.deleteMany()
  console.log('✅ Deleted all project finances')

  await prisma.task.deleteMany()
  console.log('✅ Deleted all tasks')

  await prisma.projectMember.deleteMany()
  console.log('✅ Deleted all project members')

  await prisma.project.deleteMany()
  console.log('✅ Deleted all projects')

  await prisma.user.deleteMany()
  console.log('✅ Deleted all users')

  console.log('✨ Database cleared successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error clearing database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })