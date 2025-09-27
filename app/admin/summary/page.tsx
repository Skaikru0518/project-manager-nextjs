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
import { useAuth } from "@/contexts/auth-context";
import {
	Users,
	FolderOpen,
	CheckSquare,
	TrendingUp,
	Activity,
	Trophy,
	Clock,
	Target,
	DollarSign,
	TrendingDown,
	Wallet,
} from "lucide-react";

interface Stats {
	totalUsers: number;
	totalProjects: number;
	totalTasks: number;
	completedTasks: number;
	activeProjects: number;
	taskCompletionRate: number;
	totalRevenue: number;
	totalExpense: number;
	totalProfit: number;
}

interface WeeklyData {
	week: string;
	rate: number;
	completed: number;
	total: number;
}

interface ActiveUser {
	id: string;
	name: string;
	email: string;
	completedTasks: number;
	totalProjects: number;
}

interface ActivityItem {
	type: "user" | "project" | "task";
	data: any;
	timestamp: string;
}

interface TopProject {
	id: string;
	name: string;
	owner: {
		name: string;
		email: string;
	};
	_count: {
		tasks: number;
	};
}

interface OverdueProject {
	id: string;
	name: string;
	endDate: string;
	owner: {
		name: string;
		email: string;
	};
	_count: {
		tasks: number;
	};
}

export default function AdminSummaryPage() {
	const router = useRouter();
	const { user: currentUser } = useAuth();
	const [stats, setStats] = useState<Stats | null>(null);
	const [weeklyCompletionRate, setWeeklyCompletionRate] = useState<
		WeeklyData[]
	>([]);
	const [mostActiveUsers, setMostActiveUsers] = useState<ActiveUser[]>([]);
	const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
	const [topProjects, setTopProjects] = useState<TopProject[]>([]);
	const [overdueProjects, setOverdueProjects] = useState<OverdueProject[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (currentUser && currentUser.role !== "ADMIN") {
			router.push("/dashboard");
		} else if (currentUser) {
			fetchData();
		}
	}, [currentUser, router]);

	const fetchData = async () => {
		try {
			const response = await fetch("/api/admin/summary");
			if (response.ok) {
				const data = await response.json();
				setStats(data.stats);
				setWeeklyCompletionRate(data.weeklyCompletionRate);
				setMostActiveUsers(data.mostActiveUsers);
				setRecentActivity(data.recentActivity);
				setTopProjects(data.topProjects);
				setOverdueProjects(data.overdueProjects);
			}
		} catch (error) {
			console.error("Error fetching summary data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		return `${days}d ago`;
	};

	const formatOverdueDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / 86400000);
		return `${days} days overdue`;
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("hu-HU", {
			style: "currency",
			currency: "HUF",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	if (isLoading || !currentUser) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<div className="container mx-auto px-4 py-8">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-muted rounded w-1/4"></div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{Array(6)
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

	if (currentUser.role !== "ADMIN") {
		return null;
	}

	const maxRate = Math.max(...weeklyCompletionRate.map((w) => w.rate), 1);

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold">Admin Dashboard</h1>
					<p className="text-muted-foreground mt-2">
						Overview of system statistics and activity
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Revenue
							</CardTitle>
							<DollarSign className="h-4 w-4 text-green-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">
								{formatCurrency(stats?.totalRevenue || 0)}
							</div>
							<p className="text-xs text-muted-foreground">
								Total income
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Expense
							</CardTitle>
							<TrendingDown className="h-4 w-4 text-red-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-red-600">
								{formatCurrency(stats?.totalExpense || 0)}
							</div>
							<p className="text-xs text-muted-foreground">
								Total costs
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Profit
							</CardTitle>
							<Wallet className={`h-4 w-4 ${(stats?.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
						</CardHeader>
						<CardContent>
							<div className={`text-2xl font-bold ${(stats?.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
								{formatCurrency(stats?.totalProfit || 0)}
							</div>
							<p className="text-xs text-muted-foreground">
								Revenue - Expense
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Projects
							</CardTitle>
							<FolderOpen className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats?.totalProjects}</div>
							<p className="text-xs text-muted-foreground">
								{stats?.activeProjects} active
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
							<CheckSquare className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats?.totalTasks}</div>
							<p className="text-xs text-muted-foreground">
								{stats?.completedTasks} completed
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Completion Rate
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{stats?.taskCompletionRate}%
							</div>
							<p className="text-xs text-muted-foreground">Overall tasks</p>
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					<Card>
						<CardHeader>
							<CardTitle>Weekly Task Completion Rate</CardTitle>
							<CardDescription>
								Task completion percentage by week
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{weeklyCompletionRate.map((week) => (
									<div key={week.week}>
										<div className="flex items-center justify-between mb-1">
											<span className="text-sm font-medium">{week.week}</span>
											<span className="text-sm text-muted-foreground">
												{week.rate}% ({week.completed}/{week.total})
											</span>
										</div>
										<div className="w-full bg-muted rounded-full h-2">
											<div
												className="bg-primary rounded-full h-2 transition-all"
												style={{ width: `${(week.rate / maxRate) * 100}%` }}
											></div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Trophy className="h-5 w-5" />
								Most Active Users
							</CardTitle>
							<CardDescription>Top users by completed tasks</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{mostActiveUsers.map((user, index) => (
									<div
										key={user.id}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div className="flex items-center gap-3">
											<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
												{index + 1}
											</div>
											<div>
												<p className="font-medium">{user.name}</p>
												<p className="text-xs text-muted-foreground">
													{user.email}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="font-bold text-primary">
												{user.completedTasks}
											</p>
											<p className="text-xs text-muted-foreground">tasks done</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
							<CardDescription>Latest system events</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{recentActivity.map((activity, index) => (
									<div
										key={index}
										className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
									>
										<div className="mt-1">
											{activity.type === "user" && (
												<Users className="h-4 w-4 text-blue-500" />
											)}
											{activity.type === "project" && (
												<FolderOpen className="h-4 w-4 text-green-500" />
											)}
											{activity.type === "task" && (
												<CheckSquare className="h-4 w-4 text-purple-500" />
											)}
										</div>
										<div className="flex-1 min-w-0">
											{activity.type === "user" && (
												<>
													<p className="text-sm">
														<span className="font-medium">
															{activity.data.name}
														</span>{" "}
														joined the system
													</p>
													<p className="text-xs text-muted-foreground">
														{activity.data.email}
													</p>
												</>
											)}
											{activity.type === "project" && (
												<>
													<p className="text-sm">
														New project:{" "}
														<span className="font-medium">
															{activity.data.name}
														</span>
													</p>
													<p className="text-xs text-muted-foreground">
														by {activity.data.owner.name}
													</p>
												</>
											)}
											{activity.type === "task" && (
												<>
													<p className="text-sm">
														Task completed:{" "}
														<span className="font-medium">
															{activity.data.title}
														</span>
													</p>
													<p className="text-xs text-muted-foreground">
														in {activity.data.project.name}
													</p>
												</>
											)}
										</div>
										<span className="text-xs text-muted-foreground whitespace-nowrap">
											{formatDate(activity.timestamp)}
										</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Top Projects</CardTitle>
							<CardDescription>Projects with most tasks</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{topProjects.map((project) => (
									<div
										key={project.id}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div className="flex-1 min-w-0">
											<p className="font-medium truncate">{project.name}</p>
											<p className="text-xs text-muted-foreground">
												Owner: {project.owner.name}
											</p>
										</div>
										<Badge variant="secondary">{project._count.tasks} tasks</Badge>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{overdueProjects.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-destructive">
								<Clock className="h-5 w-5" />
								Overdue Projects
							</CardTitle>
							<CardDescription>
								Projects past their deadline
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{overdueProjects.map((project) => (
									<div
										key={project.id}
										className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5"
									>
										<div className="flex-1 min-w-0">
											<p className="font-medium truncate">{project.name}</p>
											<p className="text-xs text-muted-foreground">
												Owner: {project.owner.name} • {project._count.tasks} tasks
											</p>
										</div>
										<Badge variant="destructive">
											{formatOverdueDate(project.endDate)}
										</Badge>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}