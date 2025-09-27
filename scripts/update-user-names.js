const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const randomNames = [
  'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince',
  'Eve Wilson', 'Frank Miller', 'Grace Lee', 'Henry Davis',
  'Ivy Chen', 'Jack Ryan', 'Kate Thompson', 'Leo Martinez'
]

async function main() {
  const users = await prisma.user.findMany()

  for (const user of users) {
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)]
    await prisma.user.update({
      where: { id: user.id },
      data: { name: randomName }
    })
    console.log(`Updated user ${user.email} with name: ${randomName}`)
  }

  console.log('All users updated with random names!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())