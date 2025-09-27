import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const finance = await prisma.userFinance.findUnique({
      where: { id: params.id }
    })

    if (!finance) {
      return NextResponse.json({ error: 'Finance not found' }, { status: 404 })
    }

    if (finance.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { type, amount, month, year, category, projectId, description } = await request.json()

    if (type === 'SALARY' && type !== finance.type) {
      const existingSalary = await prisma.userFinance.findFirst({
        where: {
          userId: finance.userId,
          type: 'SALARY',
          month: parseInt(month),
          year: parseInt(year),
          id: { not: params.id }
        }
      })

      if (existingSalary) {
        return NextResponse.json(
          { error: 'Salary already exists for this month' },
          { status: 400 }
        )
      }
    }

    const updatedFinance = await prisma.userFinance.update({
      where: { id: params.id },
      data: {
        type: type || finance.type,
        amount: amount !== undefined ? parseFloat(amount) : finance.amount,
        month: month !== undefined ? parseInt(month) : finance.month,
        year: year !== undefined ? parseInt(year) : finance.year,
        category: category !== undefined ? (category || null) : finance.category,
        projectId: projectId !== undefined ? (projectId || null) : finance.projectId,
        description: description !== undefined ? (description || null) : finance.description
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

    return NextResponse.json(updatedFinance)
  } catch (error) {
    console.error('Error updating finance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const finance = await prisma.userFinance.findUnique({
      where: { id: params.id }
    })

    if (!finance) {
      return NextResponse.json({ error: 'Finance not found' }, { status: 404 })
    }

    if (finance.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.userFinance.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Finance deleted successfully' })
  } catch (error) {
    console.error('Error deleting finance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}