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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { DollarSign, TrendingUp, Calendar, FolderKanban } from "lucide-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
	PieChart,
	Pie,
	Cell,
} from "recharts";

interface UserFinance {
	id: string;
	type: "SALARY" | "BONUS";
	amount: number;
	month: number;
	year: number;
	category?: string;
	projectId?: string;
	project?: {
		id: string;
		name: string;
	};
	description?: string;
	createdAt: string;
}

const COLORS = [
	"#0088FE",
	"#00C49F",
	"#FFBB28",
	"#FF8042",
	"#8884d8",
	"#82ca9d",
];

export default function FinancePage() {
	const router = useRouter();
	const { user: currentUser } = useAuth();
	const [finances, setFinances] = useState<UserFinance[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

	useEffect(() => {
		if (currentUser) {
			fetchFinances();
		}
	}, [currentUser, selectedYear]);

	const fetchFinances = async () => {
		try {
			const response = await fetch(`/api/finances?year=${selectedYear}`);
			if (response.ok) {
				const data = await response.json();
				setFinances(data);
			}
		} catch (error) {
			console.error("Error fetching finances:", error);
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
		return date.toLocaleDateString("en-US", { month: "long" });
	};

	const currentMonth = new Date().getMonth() + 1;
	const currentYear = new Date().getFullYear();

	const thisMonthTotal =
		selectedYear === currentYear
			? finances
					.filter((f) => f.month === currentMonth && f.year === currentYear)
					.reduce((sum, f) => sum + f.amount, 0)
			: 0;

	const thisYearTotal = finances.reduce((sum, f) => sum + f.amount, 0);

	const averageMonthly =
		finances.length > 0
			? thisYearTotal / new Set(finances.map((f) => f.month)).size
			: 0;

	const chartData = Array.from({ length: 12 }, (_, i) => {
		const month = i + 1;
		const monthFinances = finances.filter((f) => f.month === month);
		const salary = monthFinances.find((f) => f.type === "SALARY")?.amount || 0;
		const bonuses = monthFinances
			.filter((f) => f.type === "BONUS")
			.reduce((sum, f) => sum + f.amount, 0);

		return {
			month: getMonthName(month).slice(0, 3),
			salary,
			bonuses,
			total: salary + bonuses,
		};
	});

	const projectEarnings = finances
		.filter((f) => f.type === "BONUS" && f.projectId && f.project)
		.reduce((acc, f) => {
			const projectName = f.project!.name;
			if (!acc[projectName]) {
				acc[projectName] = 0;
			}
			acc[projectName] += f.amount;
			return acc;
		}, {} as Record<string, number>);

	const projectEarningsData = Object.entries(projectEarnings)
		.map(([name, value]) => ({ name, value }))
		.sort((a, b) => b.value - a.value);

	const totalSalary = finances
		.filter((f) => f.type === "SALARY")
		.reduce((sum, f) => sum + f.amount, 0);
	const totalBonuses = finances
		.filter((f) => f.type === "BONUS")
		.reduce((sum, f) => sum + f.amount, 0);

	if (isLoading || !currentUser) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<div className="container mx-auto px-4 py-8">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-muted rounded w-1/4"></div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{Array(3)
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

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold">My Finances</h1>
					<p className="text-muted-foreground mt-2">
						View your salary and bonuses (managed by admin)
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">This Month</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatCurrency(thisMonthTotal)}
							</div>
							<p className="text-xs text-muted-foreground">
								{getMonthName(currentMonth)} {currentYear}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">This Year</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatCurrency(thisYearTotal)}
							</div>
							<p className="text-xs text-muted-foreground">
								Total for {selectedYear}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Salary
							</CardTitle>
							<DollarSign className="h-4 w-4 text-blue-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-blue-600">
								{formatCurrency(totalSalary)}
							</div>
							<p className="text-xs text-muted-foreground">Fixed earnings</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Bonuses
							</CardTitle>
							<DollarSign className="h-4 w-4 text-green-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">
								{formatCurrency(totalBonuses)}
							</div>
							<p className="text-xs text-muted-foreground">Project bonuses</p>
						</CardContent>
					</Card>
				</div>

				<Card className="mb-8">
					<CardHeader>
						<div className="flex justify-between items-center">
							<div>
								<CardTitle>Monthly Breakdown</CardTitle>
								<CardDescription>Salary and bonuses by month</CardDescription>
							</div>
							<Select
								value={selectedYear.toString()}
								onValueChange={(value) => setSelectedYear(parseInt(value))}
							>
								<SelectTrigger className="w-32">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Array.from({ length: 5 }, (_, i) => currentYear - i).map(
										(year) => (
											<SelectItem key={year} value={year.toString()}>
												{year}
											</SelectItem>
										)
									)}
								</SelectContent>
							</Select>
						</div>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={400}>
							<BarChart data={chartData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="month" />
								<YAxis />
								<Tooltip
									formatter={(value: number) => formatCurrency(value)}
									contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }}
								/>
								<Legend />
								<Bar dataKey="salary" fill="#3b82f6" name="Salary" />
								<Bar dataKey="bonuses" fill="#10b981" name="Bonuses" />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{projectEarningsData.length > 0 && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
						<Card>
							<CardHeader>
								<CardTitle>Earnings by Project</CardTitle>
								<CardDescription>Bonus breakdown by project</CardDescription>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={300}>
									<PieChart>
										<Pie
											data={projectEarningsData}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={({ name, percent }) =>
												`${name} ${(percent * 100).toFixed(0)}%`
											}
											outerRadius={80}
											fill="#8884d8"
											dataKey="value"
										>
											{projectEarningsData.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={COLORS[index % COLORS.length]}
												/>
											))}
										</Pie>
										<Tooltip
											formatter={(value: number) => formatCurrency(value)}
											contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }}
										/>
									</PieChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Top Projects by Earnings</CardTitle>
								<CardDescription>Your highest earning projects</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{projectEarningsData.slice(0, 5).map((project, idx) => (
										<div key={project.name} className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div
													className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
													style={{ backgroundColor: COLORS[idx % COLORS.length] }}
												>
													{idx + 1}
												</div>
												<div>
													<p className="font-medium">{project.name}</p>
													<p className="text-xs text-muted-foreground">
														{finances.filter((f) => f.project?.name === project.name).length} bonuses
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="font-bold text-green-600">
													{formatCurrency(project.value)}
												</p>
												<p className="text-xs text-muted-foreground">
													{((project.value / totalBonuses) * 100).toFixed(1)}%
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{projectEarningsData.length > 0 && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle>Project Bonuses Detail</CardTitle>
							<CardDescription>Your bonus earnings per project</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{projectEarningsData.map((project, idx) => (
									<div
										key={project.name}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div className="flex items-center gap-3">
											<div
												className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
												style={{ backgroundColor: COLORS[idx % COLORS.length] }}
											>
												<FolderKanban className="h-5 w-5" />
											</div>
											<div>
												<p className="font-medium">{project.name}</p>
												<p className="text-sm text-muted-foreground">
													{
														finances.filter(
															(f) => f.project?.name === project.name
														).length
													}{" "}
													bonuses
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="text-2xl font-bold text-green-600">
												{formatCurrency(project.value)}
											</p>
											<p className="text-xs text-muted-foreground">
												{((project.value / totalBonuses) * 100).toFixed(1)}% of
												total bonuses
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				<Card>
					<CardHeader>
						<CardTitle>Transaction History</CardTitle>
						<CardDescription>All your finance entries</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{finances.length === 0 ? (
								<p className="text-center text-muted-foreground py-8">
									No finance entries yet
								</p>
							) : (
								finances.map((finance) => (
									<div
										key={finance.id}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<Badge
													variant={
														finance.type === "SALARY" ? "default" : "secondary"
													}
												>
													{finance.type}
												</Badge>
												<span className="font-medium">
													{formatCurrency(finance.amount)}
												</span>
												{finance.category && (
													<Badge variant="outline">{finance.category}</Badge>
												)}
											</div>
											<div className="text-sm text-muted-foreground mt-1">
												{getMonthName(finance.month)} {finance.year}
												{finance.project && ` • ${finance.project.name}`}
												{finance.description && ` • ${finance.description}`}
											</div>
										</div>
									</div>
								))
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
