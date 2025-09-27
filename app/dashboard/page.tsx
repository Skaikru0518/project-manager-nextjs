"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar, Grid2x2 as Grid, List, Filter, ArrowRight, Clock } from "lucide-react"

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface Project {
  id: string
  name: string
  description?: string
  tags: string[]
  completed: boolean
  startDate: string
  endDate?: string
  tasks: Array<{
    id: string
    completed: boolean
  }>
}

interface WeekTask {
  id: string
  title: string
  dayOfWeek: number
  projectId: string
  projectName: string
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [thisWeekTasks, setThisWeekTasks] = useState<WeekTask[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'completed'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    tags: ""
  })
  const router = useRouter()

  useEffect(() => {
    fetchProjects()
    fetchWeeklyTasks()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchWeeklyTasks = async () => {
    try {
      const response = await fetch(`/api/summary?year=${new Date().getFullYear()}`)
      if (response.ok) {
        const data = await response.json()
        setThisWeekTasks(data.thisWeekTasks || [])
      }
    } catch (error) {
      console.error('Error fetching weekly tasks:', error)
    }
  }

  const createProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description,
          tags: newProject.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setNewProject({ name: "", description: "", tags: "" })
        fetchProjects()
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const getProgressPercentage = (project: Project) => {
    if (project.tasks.length === 0) return 0
    const completedTasks = project.tasks.filter(task => task.completed).length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }

  const filteredProjects = projects.filter(project => {
    if (filterBy === 'active') return !project.completed
    if (filterBy === 'completed') return project.completed
    return true
  })

  const ProjectCard = ({ project }: { project: Project }) => {
    const progress = getProgressPercentage(project)
    
    return (
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
        onClick={() => router.push(`/projects/${project.id}`)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              {project.description && (
                <CardDescription className="mt-1">{project.description}</CardDescription>
              )}
            </div>
            {project.completed && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Completed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {project.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{project.tasks.length} tasks</span>
              <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your projects and track progress
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Enter project description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (optional)</Label>
                  <Input
                    id="tags"
                    value={newProject.tags}
                    onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                    placeholder="Enter tags separated by commas"
                  />
                </div>
                <Button onClick={createProject} className="w-full" disabled={!newProject.name.trim()}>
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>

          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>This Week's Focus</CardTitle>
                  <CardDescription>Pending tasks for today and tomorrow</CardDescription>
                </div>
              </div>
              {thisWeekTasks.length > 0 && (
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {thisWeekTasks.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {thisWeekTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg font-medium mb-2">🎉 All clear!</p>
                <p className="text-muted-foreground">
                  No urgent tasks for today or tomorrow. Time to relax or plan ahead! ☕
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {thisWeekTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => router.push(`/projects/${task.projectId}`)}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-medium text-sm line-clamp-2">{task.title}</p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {DAYS[task.dayOfWeek]}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate">{task.projectName}</p>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {filteredProjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                {filterBy === 'all' 
                  ? 'Get started by creating your first project'
                  : `No ${filterBy} projects found`
                }
              </p>
              {filterBy === 'all' && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}