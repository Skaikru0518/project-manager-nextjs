import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const totalUsers = await prisma.user.count()
    const totalProjects = await prisma.project.count()
    const totalTasks = await prisma.task.count()
    const completedTasks = await prisma.task.count({ where: { completed: true } })
    const activeProjects = await prisma.project.count({ where: { completed: false } })

    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const finances = await prisma.projectFinance.findMany({
      select: {
        revenue: true,
        expense: true
      }
    })

    const totalRevenue = finances.reduce((sum, f) => sum + f.revenue, 0)
    const totalExpense = finances.reduce((sum, f) => sum + f.expense, 0)
    const totalProfit = totalRevenue - totalExpense

    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

    const tasksLastFourWeeks = await prisma.task.findMany({
      where: {
        createdAt: {
          gte: fourWeeksAgo
        }
      },
      select: {
        completed: true,
        createdAt: true
      }
    })

    const weeklyCompletionRate = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7))
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - (i * 7))

      const tasksInWeek = tasksLastFourWeeks.filter(task => {
        const taskDate = new Date(task.createdAt)
        return taskDate >= weekStart && taskDate < weekEnd
      })

      const completedInWeek = tasksInWeek.filter(task => task.completed).length
      const rate = tasksInWeek.length > 0 ? Math.round((completedInWeek / tasksInWeek.length) * 100) : 0

      weeklyCompletionRate.push({
        week: `Week ${4 - i}`,
        rate,
        completed: completedInWeek,
        total: tasksInWeek.length
      })
    }

    const mostActiveUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            ownedProjects: true,
            projectMembers: true
          }
        }
      },
      take: 10
    })

    const usersWithTaskCounts = await Promise.all(
      mostActiveUsers.map(async (u) => {
        const ownedProjectIds = await prisma.project.findMany({
          where: { userId: u.id },
          select: { id: true }
        })

        const memberProjectIds = await prisma.projectMember.findMany({
          where: { userId: u.id },
          select: { projectId: true }
        })

        const allProjectIds = [
          ...ownedProjectIds.map(p => p.id),
          ...memberProjectIds.map(p => p.projectId)
        ]

        const completedTaskCount = await prisma.task.count({
          where: {
            projectId: { in: allProjectIds },
            completed: true
          }
        })

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          completedTasks: completedTaskCount,
          totalProjects: u._count.ownedProjects + u._count.projectMembers
        }
      })
    )

    const sortedActiveUsers = usersWithTaskCounts
      .sort((a, b) => b.completedTasks - a.completedTasks)
      .slice(0, 5)

    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const recentProjects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const recentCompletedTasks = await prisma.task.findMany({
      where: { completed: true },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    })

    const recentActivity = [
      ...recentUsers.map(u => ({ type: 'user', data: u, timestamp: u.createdAt })),
      ...recentProjects.map(p => ({ type: 'project', data: p, timestamp: p.createdAt })),
      ...recentCompletedTasks.map(t => ({ type: 'task', data: t, timestamp: t.updatedAt }))
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    const topProjects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        owner: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: {
        tasks: {
          _count: 'desc'
        }
      },
      take: 5
    })

    const overdueProjects = await prisma.project.findMany({
      where: {
        endDate: {
          lt: new Date()
        },
        completed: false
      },
      select: {
        id: true,
        name: true,
        endDate: true,
        owner: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: {
        endDate: 'asc'
      },
      take: 5
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProjects,
        totalTasks,
        completedTasks,
        activeProjects,
        taskCompletionRate,
        totalRevenue,
        totalExpense,
        totalProfit
      },
      weeklyCompletionRate,
      mostActiveUsers: sortedActiveUsers,
      recentActivity,
      topProjects,
      overdueProjects
    })
  } catch (error) {
    console.error('Error fetching admin summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}