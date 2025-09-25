import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderOpen, Calendar, ChartBar as BarChart3, CircleCheck as CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <FolderOpen className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Project Tracker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Manage your projects efficiently with weekly task scheduling, progress tracking, and comprehensive analytics
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Weekly Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize tasks by days of the week with drag & drop functionality
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor project completion with visual progress bars and analytics
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualize your productivity with charts and export summaries
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FolderOpen className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Project Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize projects with tags, deadlines, and completion tracking
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}