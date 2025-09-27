import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    const finance = await prisma.projectFinance.findUnique({
      where: { projectId: id }
    })

    if (!finance) {
      return NextResponse.json({ revenue: 0, expense: 0 })
    }

    return NextResponse.json(finance)
  } catch (error) {
    console.error('Error fetching project finance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { revenue, expense } = await request.json()

    if (revenue === undefined || expense === undefined) {
      return NextResponse.json(
        { error: 'Revenue and expense are required' },
        { status: 400 }
      )
    }

    const { id } = await params

    const finance = await prisma.projectFinance.upsert({
      where: { projectId: id },
      update: {
        revenue: parseFloat(revenue),
        expense: parseFloat(expense)
      },
      create: {
        projectId: id,
        revenue: parseFloat(revenue),
        expense: parseFloat(expense)
      }
    })

    return NextResponse.json(finance)
  } catch (error) {
    console.error('Error updating project finance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}