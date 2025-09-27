import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    const [projects, finances, userDetails] = await Promise.all([
      prisma.project.findMany({
        where: {
          OR: [
            { userId: user.id },
            { members: { some: { userId: user.id } } }
          ]
        },
        include: {
          tasks: {
            select: {
              id: true,
              title: true,
              completed: true,
              createdAt: true,
              updatedAt: true,
              dayOfWeek: true
            }
          },
          members: true,
          _count: {
            select: {
              tasks: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.userFinance.findMany({
        where: {
          userId: user.id
        },
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' }
        ]
      }),
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          level: true,
          createdAt: true,
          _count: {
            select: {
              ownedProjects: true,
              projectMembers: true,
              finances: true
            }
          }
        }
      })
    ])

    const thisMonthFinances = finances.filter(
      f => f.month === currentMonth && f.year === currentYear
    )
    const thisYearFinances = finances.filter(f => f.year === year)

    const totalEarnings = finances.reduce((sum, f) => sum + f.amount, 0)
    const thisMonthEarnings = thisMonthFinances.reduce((sum, f) => sum + f.amount, 0)
    const thisYearEarnings = thisYearFinances.reduce((sum, f) => sum + f.amount, 0)
    const totalBonuses = finances.filter(f => f.type === 'BONUS').reduce((sum, f) => sum + f.amount, 0)

    const monthlyEarnings = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1
      const monthFinances = finances.filter(f => f.month === month && f.year === year)
      const salary = monthFinances.find(f => f.type === 'SALARY')?.amount || 0
      const bonuses = monthFinances.filter(f => f.type === 'BONUS').reduce((sum, f) => sum + f.amount, 0)
      return {
        month,
        salary,
        bonuses,
        total: salary + bonuses
      }
    })

    const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0)
    const completedTasks = projects.reduce(
      (sum, p) => sum + p.tasks.filter(t => t.completed).length,
      0
    )

    const ownedProjects = projects.filter(p => p.userId === user.id)
    const memberProjects = projects.filter(p => p.userId !== user.id)

    const tasksByDay = Array.from({ length: 7 }, (_, day) => {
      const dayTasks = projects.flatMap(p => p.tasks.filter(t => t.dayOfWeek === day))
      return {
        day,
        total: dayTasks.length,
        completed: dayTasks.filter(t => t.completed).length
      }
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let streak = 0
    let currentDate = new Date(today)

    while (true) {
      const hasCompletedTask = projects.some(project =>
        project.tasks.some(task => {
          if (!task.completed) return false
          const taskUpdateDate = new Date(task.updatedAt || task.createdAt)
          taskUpdateDate.setHours(0, 0, 0, 0)
          return taskUpdateDate.getTime() === currentDate.getTime()
        })
      )

      if (hasCompletedTask) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    const projectsByBonus = finances
      .filter(f => f.type === 'BONUS' && f.projectId)
      .reduce((acc, f) => {
        if (!f.project) return acc
        if (!acc[f.project.id]) {
          acc[f.project.id] = {
            projectId: f.project.id,
            projectName: f.project.name,
            totalBonuses: 0,
            count: 0
          }
        }
        acc[f.project.id].totalBonuses += f.amount
        acc[f.project.id].count++
        return acc
      }, {} as Record<string, { projectId: string; projectName: string; totalBonuses: number; count: number }>)

    const bestMonth = monthlyEarnings.reduce((best, current) =>
      current.total > best.total ? current : best
    , monthlyEarnings[0])

    const now = new Date()
    const todayDayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
    const tomorrowDayOfWeek = (todayDayOfWeek + 1) % 7

    const currentDayOfWeek = now.getDay()
    const diff = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() + diff)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const todayTomorrowTasks = projects.flatMap(p =>
      p.tasks
        .filter(t => {
          const taskDate = new Date(t.createdAt)
          return taskDate >= weekStart && taskDate < weekEnd &&
                 !t.completed &&
                 (t.dayOfWeek === todayDayOfWeek || t.dayOfWeek === tomorrowDayOfWeek)
        })
        .map(t => ({
          id: t.id,
          title: t.title,
          dayOfWeek: t.dayOfWeek,
          projectId: p.id,
          projectName: p.name
        }))
    )

    const uniqueProjects = Array.from(
      new Map(todayTomorrowTasks.map(t => [t.projectId, t])).values()
    )

    return NextResponse.json({
      projects: {
        total: projects.length,
        owned: ownedProjects.length,
        member: memberProjects.length,
        completed: projects.filter(p => p.completed).length,
        active: projects.filter(p => !p.completed).length
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        byDay: tasksByDay
      },
      finances: {
        total: totalEarnings,
        thisMonth: thisMonthEarnings,
        thisYear: thisYearEarnings,
        averageMonthly: thisYearEarnings / 12,
        monthlyBreakdown: monthlyEarnings,
        byProject: Object.values(projectsByBonus).sort((a, b) => b.totalBonuses - a.totalBonuses),
        bestMonth: bestMonth,
        totalBonuses: totalBonuses
      },
      user: {
        level: userDetails?.level || 'JUNIOR',
        memberSince: userDetails?.createdAt,
        streak
      },
      recentProjects: projects.slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        completed: p.completed,
        tasks: p._count.tasks,
        completedTasks: p.tasks.filter(t => t.completed).length,
        isOwner: p.userId === user.id
      })),
      thisWeekTasks: uniqueProjects
    })
  } catch (error) {
    console.error('Error fetching summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}