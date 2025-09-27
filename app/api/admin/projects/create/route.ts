import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { name, description, tags, userId } = await request.json()

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Project name and owner are required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        tags: tags || [],
        userId
      },
      include: {
        owner: {
          select: {
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}