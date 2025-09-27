"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
	Line,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Radar,
	Legend,
} from "recharts";
import {
	Calendar,
	CheckCircle,
	Clock,
	TrendingUp,
	DollarSign,
	FolderOpen,
	Target,
	Award,
	Flame,
	Users,
	Briefcase,
	ArrowRight,
} from "lucide-react";

const COLORS = [
	"#0088FE",
	"#00C49F",
	"#FFBB28",
	"#FF8042",
	"#8884d8",
	"#82ca9d",
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface SummaryData {
	projects: {
		total: number;
		owned: number;
		member: number;
		completed: number;
		active: number;
	};
	tasks: {
		total: number;
		completed: number;
		completionRate: number;
		byDay: Array<{ day: number; total: number; completed: number }>;
	};
	finances: {
		total: number;
		thisMonth: number;
		thisYear: number;
		averageMonthly: number;
		monthlyBreakdown: Array<{
			month: number;
			salary: number;
			bonuses: number;
			total: number;
		}>;
		byProject: Array<{
			projectId: string;
			projectName: string;
			totalBonuses: number;
			count: number;
		}>;
		bestMonth: {
			month: number;
			salary: number;
			bonuses: number;
			total: number;
		};
		totalBonuses: number;
	};
	user: {
		level: string;
		memberSince: string;
		streak: number;
	};
	recentProjects: Array<{
		id: string;
		name: string;
		completed: boolean;
		tasks: number;
		completedTasks: number;
		isOwner: boolean;
	}>;
	thisWeekTasks: Array<{
		id: string;
		title: string;
		dayOfWeek: number;
		projectId: string;
		projectName: string;
	}>;
}

export default function SummaryPage() {
	const router = useRouter();
	const [data, setData] = useState<SummaryData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

	useEffect(() => {
		fetchData();
	}, [selectedYear]);

	const fetchData = async () => {
		try {
			const response = await fetch(`/api/summary?year=${selectedYear}`);
			if (response.status === 401) {
				window.location.href = "/login";
				return;
			}
			if (response.ok) {
				const result = await response.json();
				setData(result);
			}
		} catch (error) {
			console.error("Error fetching summary:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("hu-HU", {
			style: "currency",
			currency: "HUF",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const getMonthName = (month: number) => {
		const date = new Date(2000, month - 1);
		return date.toLocaleDateString("en-US", { month: "short" });
	};

	const getLevelColor = (level: string) => {
		switch (level) {
			case "JUNIOR":
				return "bg-blue-100 text-blue-800";
			case "MEDIOR":
				return "bg-green-100 text-green-800";
			case "SENIOR":
				return "bg-purple-100 text-purple-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<div className="container mx-auto px-4 py-8">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-muted rounded w-1/4"></div>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
							{Array(8)
								.fill(0)
								.map((_, i) => (
									<div key={i} className="h-32 bg-muted rounded"></div>
								))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<div className="container mx-auto px-4 py-8">
					<p>Failed to load summary data</p>
				</div>
			</div>
		);
	}

	const radarData = data.tasks.byDay.map((day, idx) => ({
		day: DAYS[idx],
		completionRate:
			day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0,
	}));

	const activityLineData = data.tasks.byDay.map((day, idx) => ({
		day: DAYS[idx],
		tasks: day.total,
		completed: day.completed,
	}));

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<div className="container mx-auto px-4 py-8">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-3xl font-bold">My Summary</h1>
							<Badge className={getLevelColor(data.user.level)}>
								<Award className="h-3 w-3 mr-1" />
								{data.user.level}
							</Badge>
						</div>
						<p className="text-muted-foreground mt-2">
							Your personal analytics and insights
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Earnings
							</CardTitle>
							<DollarSign className="h-4 w-4 text-green-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">
								{formatCurrency(data.finances.total)}
							</div>
							<p className="text-xs text-muted-foreground">All time earnings</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">This Month</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatCurrency(data.finances.thisMonth)}
							</div>
							<p className="text-xs text-muted-foreground">
								Current month earnings
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Projects</CardTitle>
							<FolderOpen className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data.projects.total}</div>
							<p className="text-xs text-muted-foreground">
								{data.projects.owned} owned, {data.projects.member} member
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Active Streak
							</CardTitle>
							<Flame className="h-4 w-4 text-orange-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-orange-500">
								{data.user.streak}
							</div>
							<p className="text-xs text-muted-foreground">
								Days with completed tasks
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Task Completion
							</CardTitle>
							<Target className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{data.tasks.completionRate}%
							</div>
							<p className="text-xs text-muted-foreground">
								{data.tasks.completed} of {data.tasks.total} tasks
							</p>
							<Progress value={data.tasks.completionRate} className="mt-2" />
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">This Year</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatCurrency(data.finances.thisYear)}
							</div>
							<p className="text-xs text-muted-foreground">
								Year-to-date earnings
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Avg Monthly</CardTitle>
							<DollarSign className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatCurrency(data.finances.averageMonthly)}
							</div>
							<p className="text-xs text-muted-foreground">Average per month</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Completed</CardTitle>
							<CheckCircle className="h-4 w-4 text-green-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">
								{data.projects.completed}
							</div>
							<p className="text-xs text-muted-foreground">Finished projects</p>
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					<Card>
						<CardHeader>
							<div className="flex justify-between items-start">
								<div>
									<CardTitle>Monthly Earnings Breakdown</CardTitle>
									<CardDescription>Salary and bonuses by month</CardDescription>
								</div>
								<Select
									value={selectedYear.toString()}
									onValueChange={(value) => setSelectedYear(parseInt(value))}
								>
									<SelectTrigger className="w-28">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Array.from(
											{ length: 3 },
											(_, i) => new Date().getFullYear() - i
										).map((year) => (
											<SelectItem key={year} value={year.toString()}>
												{year}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={data.finances.monthlyBreakdown}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey={(item) => getMonthName(item.month)} />
									<YAxis />
									<Tooltip
										formatter={(value: number) => formatCurrency(value)}
										contentStyle={{
											backgroundColor: "rgba(255, 255, 255, 0.95)",
											borderRadius: "8px",
											border: "1px solid #e5e7eb",
										}}
									/>
									<Legend />
									<Bar
										dataKey="salary"
										fill="#3b82f6"
										name="Salary"
										stackId="a"
									/>
									<Bar
										dataKey="bonuses"
										fill="#10b981"
										name="Bonuses"
										stackId="a"
									/>
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Weekly Workload Distribution</CardTitle>
							<CardDescription>Task completion by day of week</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<RadarChart data={radarData}>
									<PolarGrid />
									<PolarAngleAxis dataKey="day" />
									<PolarRadiusAxis angle={90} domain={[0, 100]} />
									<Radar
										name="Completion Rate"
										dataKey="completionRate"
										stroke="#8884d8"
										fill="#8884d8"
										fillOpacity={0.6}
									/>
									<Tooltip
										formatter={(value: number) => `${value}%`}
										contentStyle={{
											backgroundColor: "rgba(255, 255, 255, 0.95)",
											borderRadius: "8px",
											border: "1px solid #e5e7eb",
										}}
									/>
								</RadarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Daily Activity Trend</CardTitle>
							<CardDescription>
								Task activity throughout the week
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<LineChart data={activityLineData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="day" />
									<YAxis />
									<Tooltip
										contentStyle={{
											backgroundColor: "rgba(255, 255, 255, 0.95)",
											borderRadius: "8px",
											border: "1px solid #e5e7eb",
										}}
									/>
									<Legend />
									<Line
										type="monotone"
										dataKey="tasks"
										stroke="#8884d8"
										strokeWidth={2}
										name="Total Tasks"
									/>
									<Line
										type="monotone"
										dataKey="completed"
										stroke="#82ca9d"
										strokeWidth={2}
										name="Completed"
									/>
								</LineChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{data.finances.byProject.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Bonuses by Project</CardTitle>
								<CardDescription>Project-linked bonus earnings</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{data.finances.byProject.slice(0, 5).map((project, idx) => (
										<div
											key={project.projectId}
											className="flex items-center justify-between"
										>
											<div className="flex items-center gap-2">
												<div
													className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold`}
													style={{
														backgroundColor: COLORS[idx % COLORS.length],
													}}
												>
													{idx + 1}
												</div>
												<div>
													<p className="font-medium">{project.projectName}</p>
													<p className="text-xs text-muted-foreground">
														{project.count} bonuses
													</p>
												</div>
											</div>
											<Badge
												variant="secondary"
												className="text-green-600 font-semibold"
											>
												{formatCurrency(project.totalBonuses)}
											</Badge>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle>Total Bonuses</CardTitle>
							<CardDescription>All time bonus earnings</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-green-100 rounded-full">
										<DollarSign className="h-6 w-6 text-green-600" />
									</div>
									<div>
										<p className="text-3xl font-bold text-green-600">
											{formatCurrency(data.finances.totalBonuses)}
										</p>
										<p className="text-sm text-muted-foreground">
											Total project bonuses earned
										</p>
									</div>
								</div>
							</div>
							<div className="space-y-2 pt-3 border-t">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										Number of bonuses:
									</span>
									<span className="font-semibold">
										{data.finances.byProject.reduce(
											(sum, p) => sum + p.count,
											0
										)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										Average per bonus:
									</span>
									<span className="font-semibold text-green-600">
										{formatCurrency(
											data.finances.byProject.reduce(
												(sum, p) => sum + p.count,
												0
											) > 0
												? data.finances.totalBonuses /
														data.finances.byProject.reduce(
															(sum, p) => sum + p.count,
															0
														)
												: 0
										)}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Best Month</CardTitle>
							<CardDescription>
								Your highest earning month this year
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-yellow-100 rounded-full">
										<TrendingUp className="h-6 w-6 text-yellow-600" />
									</div>
									<div>
										<p className="text-3xl font-bold text-yellow-600">
											{formatCurrency(data.finances.bestMonth.total)}
										</p>
										<p className="text-sm text-muted-foreground">
											{getMonthName(data.finances.bestMonth.month)}{" "}
											{new Date().getFullYear()}
										</p>
									</div>
								</div>
							</div>
							<div className="space-y-2 pt-3 border-t">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Salary:</span>
									<span className="font-semibold">
										{formatCurrency(data.finances.bestMonth.salary)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Bonuses:</span>
									<span className="font-semibold text-green-600">
										{formatCurrency(data.finances.bestMonth.bonuses)}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Recent Projects</CardTitle>
							<CardDescription>Your latest project activity</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{data.recentProjects.map((project) => (
									<div
										key={project.id}
										onClick={() => router.push(`/projects/${project.id}`)}
										className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors group"
									>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<p className="font-medium">{project.name}</p>
												{project.isOwner ? (
													<Badge variant="default" className="text-xs">
														Owner
													</Badge>
												) : (
													<Badge variant="secondary" className="text-xs">
														Member
													</Badge>
												)}
												{project.completed && (
													<Badge
														variant="outline"
														className="text-xs text-green-600"
													>
														<CheckCircle className="h-3 w-3 mr-1" />
														Done
													</Badge>
												)}
											</div>
											<p className="text-sm text-muted-foreground mt-1">
												{project.completedTasks}/{project.tasks} tasks completed
											</p>
											<Progress
												value={
													project.tasks > 0
														? (project.completedTasks / project.tasks) * 100
														: 0
												}
												className="mt-2 h-1.5"
											/>
										</div>
										<ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Performance Insights</CardTitle>
							<CardDescription>Your productivity metrics</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
									<div className="flex items-center gap-3">
										<div className="p-2 bg-blue-100 rounded-full">
											<Target className="h-5 w-5 text-blue-600" />
										</div>
										<div>
											<p className="font-medium">Tasks Per Project</p>
											<p className="text-sm text-muted-foreground">
												Average workload
											</p>
										</div>
									</div>
									<div className="text-2xl font-bold">
										{data.projects.total > 0
											? Math.round(data.tasks.total / data.projects.total)
											: 0}
									</div>
								</div>

								<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
									<div className="flex items-center gap-3">
										<div className="p-2 bg-green-100 rounded-full">
											<CheckCircle className="h-5 w-5 text-green-600" />
										</div>
										<div>
											<p className="font-medium">Completion Success</p>
											<p className="text-sm text-muted-foreground">
												Overall rate
											</p>
										</div>
									</div>
									<div className="text-2xl font-bold text-green-600">
										{data.tasks.completionRate}%
									</div>
								</div>

								<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
									<div className="flex items-center gap-3">
										<div className="p-2 bg-purple-100 rounded-full">
											<Briefcase className="h-5 w-5 text-purple-600" />
										</div>
										<div>
											<p className="font-medium">Active Involvement</p>
											<p className="text-sm text-muted-foreground">
												Current projects
											</p>
										</div>
									</div>
									<div className="text-2xl font-bold">
										{data.projects.active}
									</div>
								</div>

								<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
									<div className="flex items-center gap-3">
										<div className="p-2 bg-orange-100 rounded-full">
											<Flame className="h-5 w-5 text-orange-600" />
										</div>
										<div>
											<p className="font-medium">Current Streak</p>
											<p className="text-sm text-muted-foreground">
												Keep it going!
											</p>
										</div>
									</div>
									<div className="text-2xl font-bold text-orange-600">
										{data.user.streak}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
