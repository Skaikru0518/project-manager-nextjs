import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: any = {
      userId: user.id
    }

    if (month && year) {
      where.month = parseInt(month)
      where.year = parseInt(year)
    } else if (year) {
      where.year = parseInt(year)
    }

    const finances = await prisma.userFinance.findMany({
      where,
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
        { month: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(finances)
  } catch (error) {
    console.error('Error fetching finances:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { type, amount, month, year, category, projectId, description } = await request.json()

    if (!type || amount === undefined || !month || !year) {
      return NextResponse.json(
        { error: 'Type, amount, month, and year are required' },
        { status: 400 }
      )
    }

    if (type === 'SALARY') {
      const existingSalary = await prisma.userFinance.findFirst({
        where: {
          userId: user.id,
          type: 'SALARY',
          month: parseInt(month),
          year: parseInt(year)
        }
      })

      if (existingSalary) {
        return NextResponse.json(
          { error: 'Salary already exists for this month' },
          { status: 400 }
        )
      }
    }

    const finance = await prisma.userFinance.create({
      data: {
        userId: user.id,
        type,
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
        category: category || null,
        projectId: projectId || null,
        description: description || null
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(finance, { status: 201 })
  } catch (error) {
    console.error('Error creating finance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}