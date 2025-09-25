"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { Download, FileText, Calendar, CircleCheck as CheckCircle, Clock, TrendingUp } from "lucide-react"

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function SummaryPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
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
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCSV = () => {
    const completedProjects = projects.filter(p => p.completed)
    const csvContent = [
      ['Project Name', 'Start Date', 'End Date', 'Duration (Days)', 'Total Tasks', 'Tags'],
      ...completedProjects.map(project => [
        project.name,
        new Date(project.startDate).toLocaleDateString(),
        project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A',
        project.endDate 
          ? Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))
          : 'N/A',
        project.tasks.length,
        project.tags.join('; ')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project-summary-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const completedProjects = projects.filter(p => p.completed)
  const activeProjects = projects.filter(p => !p.completed)

  // Chart data
  const projectDurationData = completedProjects.map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
    duration: project.endDate 
      ? Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    tasks: project.tasks.length
  }))

  const statusData = [
    { name: 'Completed', value: completedProjects.length },
    { name: 'Active', value: activeProjects.length }
  ]

  const tagData = projects.reduce((acc, project) => {
    project.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const tagChartData = Object.entries(tagData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  // Weekly activity (simplified for demo)
  const weeklyData = [
    { week: 'Week 1', completed: 12, active: 8 },
    { week: 'Week 2', completed: 19, active: 5 },
    { week: 'Week 3', completed: 8, active: 12 },
    { week: 'Week 4', completed: 15, active: 7 }
  ]

  const totalTasks = projects.reduce((acc, project) => acc + project.tasks.length, 0)
  const completedTasks = projects.reduce((acc, project) => 
    acc + project.tasks.filter(task => task.completed).length, 0
  )
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Project Summary</h1>
            <p className="text-muted-foreground mt-2">
              Analytics and insights from your projects
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeProjects.length} active, {completedProjects.length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedProjects.length > 0 
                  ? Math.round(projectDurationData.reduce((acc, p) => acc + p.duration, 0) / completedProjects.length)
                  : 0
                } days
              </div>
              <p className="text-xs text-muted-foreground">
                Per completed project
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                Days with completed tasks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Project Duration</CardTitle>
              <CardDescription>Time spent on completed projects (in days)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectDurationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="duration" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
              <CardDescription>Distribution of active vs completed projects</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Tags</CardTitle>
              <CardDescription>Most frequently used project tags</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tagChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Task completion trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="#8884d8" name="Completed" />
                  <Line type="monotone" dataKey="active" stroke="#82ca9d" name="Active" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Completed Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>Completed Projects</CardTitle>
            <CardDescription>
              All your completed projects with details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {completedProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed projects yet. Keep working on your current projects!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium">Project</th>
                      <th className="pb-2 font-medium">Start Date</th>
                      <th className="pb-2 font-medium">End Date</th>
                      <th className="pb-2 font-medium">Duration</th>
                      <th className="pb-2 font-medium">Tasks</th>
                      <th className="pb-2 font-medium">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedProjects.map((project, index) => (
                      <tr key={project.id} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                        <td className="py-3">
                          <div>
                            <div className="font-medium">{project.name}</div>
                            {project.description && (
                              <div className="text-sm text-muted-foreground">
                                {project.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-sm">
                          {new Date(project.startDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-sm">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 text-sm">
                          {project.endDate 
                            ? `${Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                            : 'N/A'
                          }
                        </td>
                        <td className="py-3 text-sm">
                          {project.tasks.length}
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {project.tags.slice(0, 3).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {project.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}