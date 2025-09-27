import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const projects = await prisma.project.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const projectsWithParsedTags = projects.map(project => ({
      ...project,
      tags: typeof project.tags === 'string' ? JSON.parse(project.tags) : project.tags
    }))

    return NextResponse.json(projectsWithParsedTags)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}