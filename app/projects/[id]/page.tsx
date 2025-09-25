"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Calendar, CircleCheck as CheckCircle, Clock, Tag, Trash2, CreditCard as Edit, ArrowLeft } from "lucide-react"

interface Task {
  id: string
  title: string
  dayOfWeek: number
  completed: boolean
}

interface Project {
  id: string
  name: string
  description?: string
  tags: string[]
  completed: boolean
  startDate: string
  endDate?: string
  tasks: Task[]
}

const DAYS = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState(0)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addTask = async () => {
    if (!newTaskTitle.trim()) return

    try {
      const response = await fetch(`/api/projects/${params.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTaskTitle,
          dayOfWeek: selectedDay,
        }),
      })

      if (response.ok) {
        setIsAddTaskOpen(false)
        setNewTaskTitle("")
        fetchProject()
      }
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/projects/${params.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      })

      if (response.ok) {
        fetchProject()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/projects/${params.id}/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchProject()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const completeProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: true }),
      })

      if (response.ok) {
        fetchProject()
      }
    } catch (error) {
      console.error('Error completing project:', error)
    }
  }

  const getTasksForDay = (dayIndex: number) => {
    return project?.tasks.filter(task => task.dayOfWeek === dayIndex) || []
  }

  const getProgressPercentage = () => {
    if (!project || project.tasks.length === 0) return 0
    const completedTasks = project.tasks.filter(task => task.completed).length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {Array(7).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>Project not found</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Project Info */}
          <div className="lg:w-1/3">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{project.name}</CardTitle>
                  {project.completed && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                {project.description && (
                  <p className="text-muted-foreground">{project.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{getProgressPercentage()}%</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-3" />
                  <div className="text-sm text-muted-foreground">
                    {project.tasks.filter(t => t.completed).length} of {project.tasks.length} tasks completed
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Started: {new Date(project.startDate).toLocaleDateString()}
                  </div>
                  {project.endDate && (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed: {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  )}
                  {project.endDate && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Duration: {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  )}
                </div>

                {!project.completed && (
                  <Button 
                    onClick={completeProject} 
                    className="w-full"
                    disabled={getProgressPercentage() < 100}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weekly Tasks */}
          <div className="lg:w-2/3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Weekly Tasks</h2>
              <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-title">Task Title</Label>
                      <Input
                        id="task-title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Enter task title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="day-select">Day</Label>
                      <select
                        id="day-select"
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(Number(e.target.value))}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        {DAYS.map((day, index) => (
                          <option key={index} value={index}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button 
                      onClick={addTask} 
                      className="w-full"
                      disabled={!newTaskTitle.trim()}
                    >
                      Add Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              {DAYS.map((day, dayIndex) => {
                const dayTasks = getTasksForDay(dayIndex)
                const completedTasks = dayTasks.filter(t => t.completed).length
                
                return (
                  <Card key={dayIndex} className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        {day}
                      </CardTitle>
                      {dayTasks.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {completedTasks}/{dayTasks.length} completed
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {dayTasks.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-4 text-center">
                          No tasks
                        </div>
                      ) : (
                        dayTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start space-x-2 p-2 rounded border hover:bg-accent/50 transition-colors"
                          >
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={(checked) => 
                                toggleTask(task.id, checked as boolean)
                              }
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTask(task.id)}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}