import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const projectNames = [
  'E-commerce Platform Redesign',
  'Mobile Banking App',
  'Healthcare Portal',
  'Real Estate Management System',
  'AI-Powered Analytics Dashboard',
  'Social Media Integration',
  'Cloud Infrastructure Migration',
  'Customer Support Chatbot',
  'Inventory Management System',
  'HR Management Platform',
  'Video Streaming Service',
  'Restaurant Ordering App',
  'Fitness Tracking Platform',
  'Educational Learning Portal',
  'Travel Booking System',
  'CRM System Enhancement',
  'IoT Device Platform',
  'Blockchain Integration',
]

const taskTitles = [
  'Design user interface mockups',
  'Implement authentication system',
  'Set up database schema',
  'Create API endpoints',
  'Write unit tests',
  'Integrate payment gateway',
  'Optimize performance',
  'Fix critical bugs',
  'Deploy to production',
  'Review code changes',
  'Update documentation',
  'Implement search functionality',
  'Add real-time notifications',
  'Configure CI/CD pipeline',
  'Conduct security audit',
  'Refactor legacy code',
  'Integrate third-party APIs',
  'Create admin dashboard',
  'Implement data analytics',
  'Set up monitoring and alerts',
]

const bonusCategories = [
  'Performance Bonus',
  'Project Completion',
  'Overtime',
  'Quarterly Achievement',
  'Innovation Award',
  'Bug Bounty',
]

async function main() {
  console.log('🌱 Starting database seed...')

  const testPassword = await bcrypt.hash('test', 10)
  const adminPassword = await bcrypt.hash('admin', 10)

  console.log('👥 Creating users...')
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
        level: 'SENIOR',
        createdAt: new Date('2023-01-15'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'test1@test.com',
        name: 'John Anderson',
        password: testPassword,
        role: 'USER',
        level: 'SENIOR',
        createdAt: new Date('2023-02-10'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'test2@test.com',
        name: 'Sarah Martinez',
        password: testPassword,
        role: 'USER',
        level: 'SENIOR',
        createdAt: new Date('2023-03-15'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'test3@test.com',
        name: 'Michael Chen',
        password: testPassword,
        role: 'USER',
        level: 'MEDIOR',
        createdAt: new Date('2023-05-20'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'test4@test.com',
        name: 'Emily Johnson',
        password: testPassword,
        role: 'USER',
        level: 'MEDIOR',
        createdAt: new Date('2023-07-10'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'test5@test.com',
        name: 'David Wilson',
        password: testPassword,
        role: 'USER',
        level: 'MEDIOR',
        createdAt: new Date('2023-09-05'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'test6@test.com',
        name: 'Lisa Brown',
        password: testPassword,
        role: 'USER',
        level: 'JUNIOR',
        createdAt: new Date('2024-01-12'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'test7@test.com',
        name: 'James Taylor',
        password: testPassword,
        role: 'USER',
        level: 'JUNIOR',
        createdAt: new Date('2024-03-08'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'test8@test.com',
        name: 'Emma Garcia',
        password: testPassword,
        role: 'USER',
        level: 'JUNIOR',
        createdAt: new Date('2024-05-15'),
      },
    }),
  ])

  console.log(`✅ Created ${users.length} users:`)
  users.forEach(u => console.log(`   - ${u.name} (${u.email}) - ${u.level}`))

  console.log('📁 Creating projects...')
  const projects = []

  for (let i = 0; i < 15; i++) {
    const owner = users[Math.floor(Math.random() * users.length)]
    const isCompleted = Math.random() > 0.35
    const daysAgo = Math.floor(Math.random() * 60) + 10
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)
    const endDate = isCompleted
      ? new Date(startDate.getTime() + Math.random() * 45 * 24 * 60 * 60 * 1000)
      : null

    const project = await prisma.project.create({
      data: {
        name: projectNames[i],
        description: `A comprehensive ${projectNames[i].toLowerCase()} solution for modern businesses`,
        tags: JSON.stringify(['development', 'frontend', 'backend', 'design'].slice(0, Math.floor(Math.random() * 3) + 2)),
        userId: owner.id,
        startDate,
        endDate,
        completed: isCompleted,
        createdAt: startDate,
      },
    })
    projects.push(project)

    const numMembers = Math.floor(Math.random() * 3) + 1
    const memberIndices = new Set<number>()
    while (memberIndices.size < numMembers) {
      const randomIndex = Math.floor(Math.random() * users.length)
      if (users[randomIndex].id !== owner.id) {
        memberIndices.add(randomIndex)
      }
    }

    for (const idx of Array.from(memberIndices)) {
      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId: users[idx].id,
        },
      })
    }

    const numTasks = Math.floor(Math.random() * 15) + 10
    for (let j = 0; j < numTasks; j++) {
      const taskCompleted = isCompleted ? true : Math.random() > 0.4
      const dayOfWeek = Math.floor(Math.random() * 7)

      const taskDaysAgo = Math.floor(Math.random() * Math.min(daysAgo, 30))
      const taskCreatedAt = new Date()
      taskCreatedAt.setDate(taskCreatedAt.getDate() - taskDaysAgo)

      const taskUpdatedAt = taskCompleted
        ? new Date(taskCreatedAt.getTime() + Math.random() * Math.min(taskDaysAgo, 7) * 24 * 60 * 60 * 1000)
        : taskCreatedAt

      await prisma.task.create({
        data: {
          title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
          dayOfWeek,
          completed: taskCompleted,
          projectId: project.id,
          createdAt: taskCreatedAt,
          updatedAt: taskUpdatedAt,
        },
      })
    }

    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId: project.id }
    })
    const totalMembers = projectMembers.length + 1

    const projectDurationMonths = Math.ceil(
      (new Date().getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )

    const avgMonthlySalaryPerMember = 700000
    const totalSalaryCost = avgMonthlySalaryPerMember * totalMembers * projectDurationMonths
    const bonusesCost = Math.floor(Math.random() * 400000) + 200000
    const otherExpenses = Math.floor(Math.random() * 2000000) + 1000000

    const totalExpense = totalSalaryCost + bonusesCost + otherExpenses
    const profitMargin = 1.3 + Math.random() * 0.4
    const totalRevenue = Math.floor(totalExpense * profitMargin / 1000000) * 1000000

    await prisma.projectFinance.create({
      data: {
        projectId: project.id,
        revenue: totalRevenue,
        expense: totalExpense,
      },
    })
  }

  console.log(`✅ Created ${projects.length} projects with tasks and members`)

  console.log('💰 Creating user finances...')
  let financeCount = 0

  for (const user of users) {
    const userStartDate = new Date(user.createdAt)

    for (let year = 2024; year <= 2025; year++) {
      const maxMonth = year === 2025 ? 9 : 12

      for (let month = 1; month <= maxMonth; month++) {
        const currentDate = new Date(year, month - 1, 1)

        if (currentDate < userStartDate) continue

        const monthsSinceStart = Math.floor(
          (currentDate.getTime() - userStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        )

        let monthlySalary: number
        if (user.level === 'SENIOR') {
          const seniorLevels = [900000, 950000, 1000000]
          monthlySalary = seniorLevels[Math.floor(Math.random() * seniorLevels.length)]
        } else if (user.level === 'MEDIOR') {
          monthlySalary = 600000 + Math.floor(Math.random() * 150000)
        } else {
          monthlySalary = monthsSinceStart < 3 ? 350000 : 500000
        }

        await prisma.userFinance.create({
          data: {
            userId: user.id,
            type: 'SALARY',
            amount: monthlySalary,
            month,
            year,
            description: `Monthly salary for ${getMonthName(month)}`,
            createdAt: new Date(year, month - 1, 1),
          },
        })
        financeCount++
      }
    }
  }

  console.log('🎁 Creating project bonuses...')
  for (const project of projects) {
    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId: project.id }
    })

    const allProjectUsers = [
      { id: project.userId },
      ...projectMembers.map(m => ({ id: m.userId }))
    ]

    const uniqueUsers = Array.from(
      new Map(allProjectUsers.map(u => [u.id, u])).values()
    )

    const totalProjectBonuses = Math.floor(Math.random() * 400000) + 200000

    for (const projectUser of uniqueUsers) {
      const numBonuses = Math.floor(Math.random() * 4) + 2
      const userShareOfBonuses = totalProjectBonuses / uniqueUsers.length

      for (let i = 0; i < numBonuses; i++) {
        const year = 2025
        const month = Math.floor(Math.random() * 9) + 1
        const bonusAmount = Math.floor((userShareOfBonuses / numBonuses) / 50000) * 50000

        if (bonusAmount < 50000) continue

        await prisma.userFinance.create({
          data: {
            userId: projectUser.id,
            type: 'BONUS',
            amount: bonusAmount,
            month,
            year,
            category: bonusCategories[Math.floor(Math.random() * bonusCategories.length)],
            projectId: project.id,
            description: `Bonus for ${project.name}`,
            createdAt: new Date(year, month - 1, Math.floor(Math.random() * 28) + 1),
          },
        })
        financeCount++
      }
    }
  }

  console.log(`✅ Created ${financeCount} finance entries`)

  console.log('✨ Database seed completed successfully!')
  console.log(`
📊 Summary:
  - ${users.length} users created
  - ${projects.length} projects created
  - ${financeCount} finance entries created
  - Hundreds of tasks created

🔐 Test credentials:
  Admin: admin@test.com / admin
  User1: test1@test.com / test
  User2: test2@test.com / test
  ... (test3-test8 all use password: test)
  `)
}

function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1]
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })