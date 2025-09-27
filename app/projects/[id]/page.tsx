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
import { Plus, Calendar, CircleCheck as CheckCircle, Clock, Tag, Trash2, CreditCard as Edit, ArrowLeft, ChevronLeft, ChevronRight, DollarSign } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Task {
  id: string
  title: string
  dayOfWeek: number
  completed: boolean
  createdAt: string
}

interface UserFinance {
  id: string
  type: "SALARY" | "BONUS"
  amount: number
  category?: string
  description?: string
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
  userFinances?: UserFinance[]
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
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState(0)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [isFinanceDialogOpen, setIsFinanceDialogOpen] = useState(false)
  const [financeRevenue, setFinanceRevenue] = useState("")
  const [financeExpense, setFinanceExpense] = useState("")
  const [displayRevenue, setDisplayRevenue] = useState(0)
  const [displayExpense, setDisplayExpense] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchProject()
      if (user?.role === 'ADMIN') {
        fetchFinance()
      }
    }
  }, [params.id, user])

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

  const formatNumberWithSpaces = (value: string) => {
    const number = value.replace(/\s/g, "")
    if (!number || isNaN(Number(number))) return ""
    return Number(number).toLocaleString("hu-HU")
  }

  const parseNumberFromFormatted = (value: string) => {
    return value.replace(/\s/g, "")
  }

  const fetchFinance = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${params.id}/finance`)
      if (response.ok) {
        const data = await response.json()
        setDisplayRevenue(data.revenue || 0)
        setDisplayExpense(data.expense || 0)
      }
    } catch (error) {
      console.error("Error fetching finance:", error)
    }
  }

  const handleOpenFinance = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${params.id}/finance`)
      if (response.ok) {
        const data = await response.json()
        setFinanceRevenue(formatNumberWithSpaces(data.revenue?.toString() || "0"))
        setFinanceExpense(formatNumberWithSpaces(data.expense?.toString() || "0"))
      }
    } catch (error) {
      console.error("Error fetching finance:", error)
      setFinanceRevenue("0")
      setFinanceExpense("0")
    }
    setIsFinanceDialogOpen(true)
  }

  const handleUpdateFinance = async () => {
    try {
      const response = await fetch(
        `/api/admin/projects/${params.id}/finance`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            revenue: parseFloat(parseNumberFromFormatted(financeRevenue)) || 0,
            expense: parseFloat(parseNumberFromFormatted(financeExpense)) || 0,
          }),
        }
      )

      if (response.ok) {
        setIsFinanceDialogOpen(false)
        setFinanceRevenue("")
        setFinanceExpense("")
        fetchFinance()
      }
    } catch (error) {
      console.error("Error updating finance:", error)
    }
  }

  const handleRevenueChange = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, "")
    setFinanceRevenue(formatNumberWithSpaces(cleaned))
  }

  const handleExpenseChange = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, "")
    setFinanceExpense(formatNumberWithSpaces(cleaned))
  }

  const getTasksForDay = (dayIndex: number) => {
    if (!project) return []

    const weekStart = getWeekStartDate()
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    return project.tasks.filter(task => {
      if (task.dayOfWeek !== dayIndex) return false

      const taskDate = new Date(task.createdAt)
      return taskDate >= weekStart && taskDate < weekEnd
    })
  }

  const getCurrentWeekLabel = () => {
    if (currentWeekOffset === 0) return 'This Week'
    if (currentWeekOffset === -1) return 'Last Week'
    if (currentWeekOffset === 1) return 'Next Week'
    if (currentWeekOffset < 0) return `${Math.abs(currentWeekOffset)} Weeks Ago`
    return `In ${currentWeekOffset} Weeks`
  }

  const getWeekStartDate = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff + (currentWeekOffset * 7))
    return monday
  }

  const getDateForDay = (dayIndex: number) => {
    const weekStart = getWeekStartDate()
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + dayIndex)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

        {/* Project Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl sm:text-3xl">{project.name}</CardTitle>
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
              </div>
              <div className="flex gap-2">
                {user?.role === 'ADMIN' && (
                  <Button
                    variant="outline"
                    onClick={handleOpenFinance}
                    className="w-full sm:w-auto"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Manage Finances
                  </Button>
                )}
                {!project.completed && (
                  <Button
                    onClick={completeProject}
                    disabled={getProgressPercentage() < 100}
                    className="w-full sm:w-auto"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`grid grid-cols-1 ${
              user?.role === 'ADMIN'
                ? 'md:grid-cols-4'
                : project.userFinances && project.userFinances.length > 0
                  ? 'md:grid-cols-4'
                  : 'md:grid-cols-3'
            } gap-6`}>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span className="font-semibold">{getProgressPercentage()}%</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-3" />
                <div className="text-sm text-muted-foreground">
                  {project.tasks.filter(t => t.completed).length} of {project.tasks.length} tasks completed
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                </div>
                {project.endDate && (
                  <>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Completed: {new Date(project.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Duration: {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 content-start">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="h-fit">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                {project.userFinances && project.userFinances.length > 0 && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">My Earnings</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat("hu-HU", {
                        style: "currency",
                        currency: "HUF",
                        minimumFractionDigits: 0,
                      }).format(project.userFinances.reduce((sum, f) => sum + f.amount, 0))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {project.userFinances.length} bonus{project.userFinances.length > 1 ? 'es' : ''}
                    </div>
                  </div>
                )}
              </div>

              {user?.role === 'ADMIN' && (
                <div className="space-y-2 border-l pl-6">
                  <div className="text-sm font-medium mb-3">Finances</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="font-semibold text-green-600">
                        {new Intl.NumberFormat("hu-HU", {
                          style: "currency",
                          currency: "HUF",
                          minimumFractionDigits: 0,
                        }).format(displayRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expense:</span>
                      <span className="font-semibold text-red-600">
                        {new Intl.NumberFormat("hu-HU", {
                          style: "currency",
                          currency: "HUF",
                          minimumFractionDigits: 0,
                        }).format(displayExpense)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-medium">Profit:</span>
                      <span className={`font-bold ${
                        (displayRevenue - displayExpense) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                        {new Intl.NumberFormat("hu-HU", {
                          style: "currency",
                          currency: "HUF",
                          minimumFractionDigits: 0,
                        }).format(displayRevenue - displayExpense)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </CardContent>
        </Card>

        {/* Weekly Tasks */}
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold">Weekly Tasks</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[120px] text-center">
                    {getCurrentWeekLabel()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {currentWeekOffset !== 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentWeekOffset(0)}
                    >
                      Today
                    </Button>
                  )}
                </div>
              </div>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
              {DAYS.map((day, dayIndex) => {
                const dayTasks = getTasksForDay(dayIndex)
                const completedTasks = dayTasks.filter(t => t.completed).length

                return (
                  <Card key={dayIndex} className="flex flex-col h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {day}
                        </CardTitle>
                        {currentWeekOffset !== 0 && (
                          <span className="text-xs text-muted-foreground">
                            {getDateForDay(dayIndex)}
                          </span>
                        )}
                      </div>
                      {dayTasks.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {completedTasks}/{dayTasks.length} completed
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2 flex-1">
                      {dayTasks.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-4 text-center">
                          No tasks
                        </div>
                      ) : (
                        dayTasks.map((task) => (
                          <div
                            key={task.id}
                            className="group flex items-start gap-2 p-2 rounded border hover:bg-accent/50 transition-colors"
                          >
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={(checked) =>
                                toggleTask(task.id, checked as boolean)
                              }
                              className="mt-0.5 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0 pr-1">
                              <p className={`text-sm break-words ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTask(task.id)}
                              className="h-7 w-7 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

      <Dialog open={isFinanceDialogOpen} onOpenChange={setIsFinanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Project Finances</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Input
                value={project?.name || ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Revenue (HUF)</Label>
              <Input
                type="text"
                placeholder="0"
                value={financeRevenue}
                onChange={(e) => handleRevenueChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Expense (HUF)</Label>
              <Input
                type="text"
                placeholder="0"
                value={financeExpense}
                onChange={(e) => handleExpenseChange(e.target.value)}
              />
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Profit:</span>
                <span className={`text-lg font-bold ${
                  (parseFloat(parseNumberFromFormatted(financeRevenue)) || 0) - (parseFloat(parseNumberFromFormatted(financeExpense)) || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}>
                  {new Intl.NumberFormat("hu-HU", {
                    style: "currency",
                    currency: "HUF",
                    minimumFractionDigits: 0,
                  }).format((parseFloat(parseNumberFromFormatted(financeRevenue)) || 0) - (parseFloat(parseNumberFromFormatted(financeExpense)) || 0))}
                </span>
              </div>
            </div>
            <Button
              onClick={handleUpdateFinance}
              className="w-full"
            >
              Update Finances
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}