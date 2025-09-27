import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          orderBy: [
            { dayOfWeek: 'asc' },
            { createdAt: 'asc' }
          ]
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
        userFinances: {
          where: {
            userId: user.id,
            type: 'BONUS'
          },
          select: {
            id: true,
            type: true,
            amount: true,
            category: true,
            description: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const isMember = project.members.some(m => m.userId === user.id)
    if (project.userId !== user.id && !isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const projectWithParsedTags = {
      ...project,
      tags: typeof project.tags === 'string' ? JSON.parse(project.tags) : project.tags
    }

    return NextResponse.json(projectWithParsedTags)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { completed } = await request.json()

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        members: true
      }
    })

    const isMember = project?.members.some(m => m.userId === user.id)
    if (!project || (project.userId !== user.id && !isMember)) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        completed,
        endDate: completed ? new Date() : null
      },
      include: { tasks: true }
    })

    const projectWithParsedTags = {
      ...updatedProject,
      tags: typeof updatedProject.tags === 'string' ? JSON.parse(updatedProject.tags) : updatedProject.tags
    }

    return NextResponse.json(projectWithParsedTags)
  } catch (error) {
    console.error('Error updating project:', error)
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    await prisma.project.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}