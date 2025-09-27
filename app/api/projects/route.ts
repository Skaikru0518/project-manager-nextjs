import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { userId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      },
      include: {
        tasks: true,
        members: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
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

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, tags } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        tags: tags || [],
        userId: user.id
      },
      include: { tasks: true }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}