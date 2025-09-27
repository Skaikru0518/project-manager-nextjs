import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id, userId, type, amount, month, year, category, projectId, description } = await request.json()

    if (!id || !userId || !type || amount === undefined || !month || !year) {
      return NextResponse.json(
        { error: 'Id, userId, type, amount, month, and year are required' },
        { status: 400 }
      )
    }

    if (type === 'SALARY') {
      const existingSalary = await prisma.userFinance.findFirst({
        where: {
          id: { not: id },
          userId: userId,
          type: 'SALARY',
          month: parseInt(month),
          year: parseInt(year)
        }
      })

      if (existingSalary) {
        return NextResponse.json(
          { error: 'Salary already exists for this user and month' },
          { status: 400 }
        )
      }
    }

    const finance = await prisma.userFinance.update({
      where: { id },
      data: {
        userId: userId,
        type,
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
        category: category || null,
        projectId: projectId || null,
        description: description || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(finance)
  } catch (error) {
    console.error('Error updating finance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}