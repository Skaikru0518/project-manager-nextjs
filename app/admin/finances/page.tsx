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
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { DollarSign, Users, Filter, Plus, Edit, Trash2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
	user: {
		id: string;
		name: string;
		email: string;
		level: "JUNIOR" | "MEDIOR" | "SENIOR";
	};
}

interface User {
	id: string;
	name: string;
	email: string;
	level: "JUNIOR" | "MEDIOR" | "SENIOR";
}

interface Project {
	id: string;
	name: string;
}

export default function AdminFinancesPage() {
	const router = useRouter();
	const { user: currentUser } = useAuth();
	const [finances, setFinances] = useState<UserFinance[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
	const [selectedUser, setSelectedUser] = useState<string>("");
	const [perPage, setPerPage] = useState(7);
	const [currentPage, setCurrentPage] = useState(1);
	const [userSummaryPerPage, setUserSummaryPerPage] = useState(7);
	const [userSummaryPage, setUserSummaryPage] = useState(1);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingFinance, setEditingFinance] = useState<UserFinance | null>(null);
	const [formData, setFormData] = useState({
		userId: "",
		type: "SALARY" as "SALARY" | "BONUS",
		amount: "",
		month: new Date().getMonth() + 1,
		year: new Date().getFullYear(),
		category: "",
		projectId: "",
		description: "",
	});

	useEffect(() => {
		if (currentUser && currentUser.role !== "ADMIN") {
			router.push("/dashboard");
		} else if (currentUser) {
			fetchUsers();
			fetchProjects();
			fetchFinances();
		}
	}, [currentUser, router]);

	useEffect(() => {
		if (currentUser && currentUser.role === "ADMIN") {
			fetchFinances();
		}
	}, [selectedYear, selectedUser, currentUser]);

	useEffect(() => {
		setCurrentPage(1);
		setUserSummaryPage(1);
	}, [perPage, userSummaryPerPage, selectedYear, selectedUser]);

	const fetchUsers = async () => {
		try {
			const response = await fetch("/api/admin/users");
			if (response.ok) {
				const data = await response.json();
				setUsers(data);
			}
		} catch (error) {
			console.error("Error fetching users:", error);
		}
	};

	const fetchProjects = async () => {
		try {
			const response = await fetch("/api/projects");
			if (response.ok) {
				const data = await response.json();
				setProjects(data);
			}
		} catch (error) {
			console.error("Error fetching projects:", error);
		}
	};

	const fetchFinances = async () => {
		try {
			const params = new URLSearchParams();
			params.append("year", selectedYear.toString());
			if (selectedUser) {
				params.append("userId", selectedUser);
			}

			const response = await fetch(`/api/admin/finances?${params}`);
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

	const formatNumberWithSpaces = (value: string | number) => {
		const str = value.toString().replace(/\s/g, "");
		if (!str || isNaN(Number(str))) return "";
		return Number(str).toLocaleString("hu-HU");
	};

	const handleAmountChange = (value: string) => {
		const cleaned = value.replace(/[^\d]/g, "");
		setFormData({ ...formData, amount: formatNumberWithSpaces(cleaned) });
	};

	const resetForm = () => {
		setFormData({
			userId: "",
			type: "SALARY",
			amount: "",
			month: new Date().getMonth() + 1,
			year: new Date().getFullYear(),
			category: "",
			projectId: "",
			description: "",
		});
		setEditingFinance(null);
	};

	const handleAdd = async () => {
		if (!formData.userId || !formData.amount) return;

		try {
			const response = await fetch("/api/admin/finances/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					amount: parseFloat(formData.amount.replace(/\s/g, "")),
					projectId: formData.projectId || null,
					category: formData.category || null,
					description: formData.description || null,
				}),
			});

			if (response.ok) {
				setIsAddDialogOpen(false);
				resetForm();
				fetchFinances();
			} else {
				const error = await response.json();
				alert(error.error);
			}
		} catch (error) {
			console.error("Error adding finance:", error);
		}
	};

	const handleEdit = (finance: UserFinance) => {
		setEditingFinance(finance);
		setFormData({
			userId: finance.user.id,
			type: finance.type,
			amount: formatNumberWithSpaces(finance.amount),
			month: finance.month,
			year: finance.year,
			category: finance.category || "",
			projectId: finance.projectId || "",
			description: finance.description || "",
		});
		setIsEditDialogOpen(true);
	};

	const handleUpdate = async () => {
		if (!editingFinance || !formData.userId || !formData.amount) return;

		try {
			const response = await fetch("/api/admin/finances/update", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: editingFinance.id,
					...formData,
					amount: parseFloat(formData.amount.replace(/\s/g, "")),
					projectId: formData.projectId || null,
					category: formData.category || null,
					description: formData.description || null,
				}),
			});

			if (response.ok) {
				setIsEditDialogOpen(false);
				resetForm();
				fetchFinances();
			} else {
				const error = await response.json();
				alert(error.error);
			}
		} catch (error) {
			console.error("Error updating finance:", error);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this finance entry?")) return;

		try {
			const response = await fetch("/api/admin/finances/delete", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});

			if (response.ok) {
				fetchFinances();
			} else {
				const error = await response.json();
				alert(error.error);
			}
		} catch (error) {
			console.error("Error deleting finance:", error);
		}
	};

	const getMonthName = (month: number) => {
		const date = new Date(2000, month - 1);
		return date.toLocaleDateString("en-US", { month: "long" });
	};

	const getLevelBadgeColor = (level: string) => {
		switch (level) {
			case "JUNIOR":
				return "bg-blue-100 text-blue-800";
			case "MEDIOR":
				return "bg-green-100 text-green-800";
			case "SENIOR":
				return "bg-purple-100 text-purple-800";
			default:
				return "";
		}
	};

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

	if (currentUser.role !== "ADMIN") {
		return null;
	}

	const totalAmount = finances.reduce((sum, f) => sum + f.amount, 0);
	const totalSalaries = finances
		.filter((f) => f.type === "SALARY")
		.reduce((sum, f) => sum + f.amount, 0);
	const totalBonuses = finances
		.filter((f) => f.type === "BONUS")
		.reduce((sum, f) => sum + f.amount, 0);

	const userStats = finances.reduce((acc, finance) => {
		if (!acc[finance.user.id]) {
			acc[finance.user.id] = {
				user: finance.user,
				total: 0,
				salaries: 0,
				bonuses: 0,
			};
		}
		acc[finance.user.id].total += finance.amount;
		if (finance.type === "SALARY") {
			acc[finance.user.id].salaries += finance.amount;
		} else {
			acc[finance.user.id].bonuses += finance.amount;
		}
		return acc;
	}, {} as Record<string, { user: User; total: number; salaries: number; bonuses: number }>);

	const totalPages = Math.ceil(finances.length / perPage);
	const paginatedFinances = finances.slice(
		(currentPage - 1) * perPage,
		currentPage * perPage
	);

	const userStatsArray = Object.values(userStats).sort((a, b) => b.total - a.total);
	const userSummaryTotalPages = Math.ceil(userStatsArray.length / userSummaryPerPage);
	const paginatedUserStats = userStatsArray.slice(
		(userSummaryPage - 1) * userSummaryPerPage,
		userSummaryPage * userSummaryPerPage
	);

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<div className="container mx-auto px-4 py-8">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold">User Finances</h1>
						<p className="text-muted-foreground mt-2">
							View and manage all user salary and bonus entries
						</p>
					</div>
					<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Add Entry
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add Finance Entry for User</DialogTitle>
								<DialogDescription>
									Add a salary or bonus entry for a user
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div>
									<Label>User</Label>
									<Select
										value={formData.userId}
										onValueChange={(value) =>
											setFormData({ ...formData, userId: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select user" />
										</SelectTrigger>
										<SelectContent>
											{users.map((user) => (
												<SelectItem key={user.id} value={user.id}>
													{user.name} ({user.email}) ({user.level.toLowerCase()}
													)
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label>Type</Label>
									<Select
										value={formData.type}
										onValueChange={(value: "SALARY" | "BONUS") =>
											setFormData({ ...formData, type: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="SALARY">Salary</SelectItem>
											<SelectItem value="BONUS">Bonus</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label>Amount (HUF)</Label>
									<Input
										type="text"
										value={formData.amount}
										onChange={(e) => handleAmountChange(e.target.value)}
										placeholder="1 000 000"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Month</Label>
										<Select
											value={formData.month.toString()}
											onValueChange={(value) =>
												setFormData({ ...formData, month: parseInt(value) })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{Array.from({ length: 12 }, (_, i) => (
													<SelectItem key={i + 1} value={(i + 1).toString()}>
														{getMonthName(i + 1)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label>Year</Label>
										<Input
											type="number"
											value={formData.year}
											onChange={(e) =>
												setFormData({
													...formData,
													year: parseInt(e.target.value),
												})
											}
										/>
									</div>
								</div>
								{formData.type === "BONUS" && (
									<>
										<div>
											<Label>Category (Optional)</Label>
											<Input
												value={formData.category}
												onChange={(e) =>
													setFormData({ ...formData, category: e.target.value })
												}
												placeholder="e.g., Overtime, Performance"
											/>
										</div>
										<div>
											<Label>Project (Optional)</Label>
											<Select
												value={formData.projectId || "none"}
												onValueChange={(value) =>
													setFormData({
														...formData,
														projectId: value === "none" ? "" : value,
													})
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select project" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">None</SelectItem>
													{projects.map((project) => (
														<SelectItem key={project.id} value={project.id}>
															{project.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</>
								)}
								<div>
									<Label>Description (Optional)</Label>
									<Input
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										placeholder="Add notes"
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsAddDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button
									onClick={handleAdd}
									disabled={!formData.userId || !formData.amount}
								>
									Add
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<Dialog open={isEditDialogOpen} onOpenChange={(open) => {
						setIsEditDialogOpen(open);
						if (!open) resetForm();
					}}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Edit Finance Entry</DialogTitle>
								<DialogDescription>
									Update salary or bonus entry for user
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div>
									<Label>User</Label>
									<Select
										value={formData.userId}
										onValueChange={(value) =>
											setFormData({ ...formData, userId: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select user" />
										</SelectTrigger>
										<SelectContent>
											{users.map((user) => (
												<SelectItem key={user.id} value={user.id}>
													{user.name} ({user.email}) ({user.level.toLowerCase()}
													)
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label>Type</Label>
									<Select
										value={formData.type}
										onValueChange={(value: "SALARY" | "BONUS") =>
											setFormData({ ...formData, type: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="SALARY">Salary</SelectItem>
											<SelectItem value="BONUS">Bonus</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label>Amount (HUF)</Label>
									<Input
										type="text"
										value={formData.amount}
										onChange={(e) => handleAmountChange(e.target.value)}
										placeholder="1 000 000"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Month</Label>
										<Select
											value={formData.month.toString()}
											onValueChange={(value) =>
												setFormData({ ...formData, month: parseInt(value) })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{Array.from({ length: 12 }, (_, i) => (
													<SelectItem key={i + 1} value={(i + 1).toString()}>
														{getMonthName(i + 1)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label>Year</Label>
										<Input
											type="number"
											value={formData.year}
											onChange={(e) =>
												setFormData({
													...formData,
													year: parseInt(e.target.value),
												})
											}
										/>
									</div>
								</div>
								{formData.type === "BONUS" && (
									<>
										<div>
											<Label>Category (Optional)</Label>
											<Input
												value={formData.category}
												onChange={(e) =>
													setFormData({ ...formData, category: e.target.value })
												}
												placeholder="e.g., Overtime, Performance"
											/>
										</div>
										<div>
											<Label>Project (Optional)</Label>
											<Select
												value={formData.projectId || "none"}
												onValueChange={(value) =>
													setFormData({
														...formData,
														projectId: value === "none" ? "" : value,
													})
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select project" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">None</SelectItem>
													{projects.map((project) => (
														<SelectItem key={project.id} value={project.id}>
															{project.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</>
								)}
								<div>
									<Label>Description (Optional)</Label>
									<Input
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										placeholder="Add notes"
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsEditDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button
									onClick={handleUpdate}
									disabled={!formData.userId || !formData.amount}
								>
									Update
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				<div className="flex gap-4 mb-6">
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-muted-foreground" />
						<Select
							value={selectedYear.toString()}
							onValueChange={(value) => setSelectedYear(parseInt(value))}
						>
							<SelectTrigger className="w-32">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Array.from(
									{ length: 5 },
									(_, i) => new Date().getFullYear() - i
								).map((year) => (
									<SelectItem key={year} value={year.toString()}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Select
						value={selectedUser || "all"}
						onValueChange={(value) =>
							setSelectedUser(value === "all" ? "" : value)
						}
					>
						<SelectTrigger className="w-64">
							<SelectValue placeholder="All Users" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Users</SelectItem>
							{users.map((user) => (
								<SelectItem key={user.id} value={user.id}>
									{user.name} ({user.email})
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Amount
							</CardTitle>
							<DollarSign className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatCurrency(totalAmount)}
							</div>
							<p className="text-xs text-muted-foreground">
								All payments in {selectedYear}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Salaries
							</CardTitle>
							<DollarSign className="h-4 w-4 text-blue-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-blue-600">
								{formatCurrency(totalSalaries)}
							</div>
							<p className="text-xs text-muted-foreground">
								Fixed monthly salaries
							</p>
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
							<p className="text-xs text-muted-foreground">
								Additional bonuses
							</p>
						</CardContent>
					</Card>
				</div>

				{!selectedUser && Object.keys(userStats).length > 0 && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
						<Card>
							<CardHeader>
								<div className="flex justify-between items-center">
									<div>
										<CardTitle>User Summary</CardTitle>
										<CardDescription>
											Showing {userStatsArray.length > 0 ? (userSummaryPage - 1) * userSummaryPerPage + 1 : 0} - {Math.min(userSummaryPage * userSummaryPerPage, userStatsArray.length)} of {userStatsArray.length} users
										</CardDescription>
									</div>
									<Select
										value={userSummaryPerPage.toString()}
										onValueChange={(value) => setUserSummaryPerPage(parseInt(value))}
									>
										<SelectTrigger className="w-32">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="7">7 / page</SelectItem>
											<SelectItem value="15">15 / page</SelectItem>
											<SelectItem value="25">25 / page</SelectItem>
											<SelectItem value="50">50 / page</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3 mb-4">
									{paginatedUserStats.map((stat) => (
										<div
											key={stat.user.id}
											className="flex items-center justify-between p-3 border rounded-lg"
										>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<span className="font-medium">{stat.user.name}</span>
													<Badge
														className={getLevelBadgeColor(stat.user.level)}
													>
														{stat.user.level}
													</Badge>
												</div>
												<p className="text-xs text-muted-foreground">
													{stat.user.email}
												</p>
											</div>
											<div className="text-right">
												<p className="font-bold text-lg">
													{formatCurrency(stat.total)}
												</p>
												<p className="text-xs text-muted-foreground">
													Salary: {formatCurrency(stat.salaries)} | Bonuses:{" "}
													{formatCurrency(stat.bonuses)}
												</p>
											</div>
										</div>
									))}
								</div>
								{userSummaryTotalPages > 1 && (
									<Pagination>
										<PaginationContent>
											<PaginationItem>
												<PaginationPrevious
													href="#"
													onClick={(e) => {
														e.preventDefault();
														if (userSummaryPage > 1) setUserSummaryPage(userSummaryPage - 1);
													}}
													className={userSummaryPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
												/>
											</PaginationItem>
											{Array.from({ length: userSummaryTotalPages }, (_, i) => i + 1)
												.filter((page) => {
													if (userSummaryTotalPages <= 7) return true;
													if (page === 1 || page === userSummaryTotalPages) return true;
													if (page >= userSummaryPage - 1 && page <= userSummaryPage + 1) return true;
													return false;
												})
												.map((page, idx, arr) => (
													<PaginationItem key={page}>
														{idx > 0 && page - arr[idx - 1] > 1 && (
															<span className="px-2">...</span>
														)}
														<PaginationLink
															href="#"
															onClick={(e) => {
																e.preventDefault();
																setUserSummaryPage(page);
															}}
															isActive={userSummaryPage === page}
															className="cursor-pointer"
														>
															{page}
														</PaginationLink>
													</PaginationItem>
												))}
											<PaginationItem>
												<PaginationNext
													href="#"
													onClick={(e) => {
														e.preventDefault();
														if (userSummaryPage < userSummaryTotalPages) setUserSummaryPage(userSummaryPage + 1);
													}}
													className={userSummaryPage === userSummaryTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
												/>
											</PaginationItem>
										</PaginationContent>
									</Pagination>
								)}
							</CardContent>
						</Card>

						<Card>
					<CardHeader>
						<div className="flex justify-between items-center">
							<div>
								<CardTitle>All Transactions</CardTitle>
								<CardDescription>
									Showing {finances.length > 0 ? (currentPage - 1) * perPage + 1 : 0} - {Math.min(currentPage * perPage, finances.length)} of {finances.length} entries
								</CardDescription>
							</div>
							<Select
								value={perPage.toString()}
								onValueChange={(value) => setPerPage(parseInt(value))}
							>
								<SelectTrigger className="w-32">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="7">7 / page</SelectItem>
									<SelectItem value="15">15 / page</SelectItem>
									<SelectItem value="25">25 / page</SelectItem>
									<SelectItem value="50">50 / page</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-3 mb-4">
							{finances.length === 0 ? (
								<p className="text-center text-muted-foreground py-8">
									No finance entries found
								</p>
							) : (
								paginatedFinances.map((finance) => (
									<div
										key={finance.id}
										className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
									>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<span className="font-medium">{finance.user.name}</span>
												<Badge
													className={getLevelBadgeColor(finance.user.level)}
												>
													{finance.user.level}
												</Badge>
												<Badge
													variant={
														finance.type === "SALARY" ? "default" : "secondary"
													}
												>
													{finance.type}
												</Badge>
												{finance.category && (
													<Badge variant="outline">{finance.category}</Badge>
												)}
											</div>
											<div className="text-sm text-muted-foreground">
												{getMonthName(finance.month)} {finance.year}
												{finance.project &&
													` • Project: ${finance.project.name}`}
												{finance.description && ` • ${finance.description}`}
											</div>
										</div>
										<div className="flex items-center gap-3">
											<div className="text-right">
												<p className="font-bold text-lg">
													{formatCurrency(finance.amount)}
												</p>
											</div>
											<div className="flex gap-1">
												<Button
													size="icon"
													variant="ghost"
													onClick={() => handleEdit(finance)}
													className="h-8 w-8"
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => handleDelete(finance.id)}
													className="h-8 w-8 text-destructive hover:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>
								))
							)}
						</div>
						{totalPages > 1 && (
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											href="#"
											onClick={(e) => {
												e.preventDefault();
												if (currentPage > 1) setCurrentPage(currentPage - 1);
											}}
											className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
										/>
									</PaginationItem>
									{Array.from({ length: totalPages }, (_, i) => i + 1)
										.filter((page) => {
											if (totalPages <= 7) return true;
											if (page === 1 || page === totalPages) return true;
											if (page >= currentPage - 1 && page <= currentPage + 1) return true;
											return false;
										})
										.map((page, idx, arr) => (
											<PaginationItem key={page}>
												{idx > 0 && page - arr[idx - 1] > 1 && (
													<span className="px-2">...</span>
												)}
												<PaginationLink
													href="#"
													onClick={(e) => {
														e.preventDefault();
														setCurrentPage(page);
													}}
													isActive={currentPage === page}
													className="cursor-pointer"
												>
													{page}
												</PaginationLink>
											</PaginationItem>
										))}
									<PaginationItem>
										<PaginationNext
											href="#"
											onClick={(e) => {
												e.preventDefault();
												if (currentPage < totalPages) setCurrentPage(currentPage + 1);
											}}
											className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						)}
					</CardContent>
				</Card>
					</div>
				)}
			</div>
		</div>
	);
}
