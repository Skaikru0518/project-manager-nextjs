"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import {
	Users,
	FolderOpen,
	Plus,
	Trash2,
	UserPlus,
	Search,
	ChevronLeft,
	ChevronRight,
	Pencil,
	DollarSign,
} from "lucide-react";

interface User {
	id: string;
	email: string;
	name: string;
	role: "ADMIN" | "USER";
	level: "JUNIOR" | "MEDIOR" | "SENIOR";
	_count: {
		ownedProjects: number;
		projectMembers: number;
	};
}

interface Project {
	id: string;
	name: string;
	tags: string[];
	userId: string;
	owner: {
		email: string;
	};
	members: Array<{
		id: string;
		userId: string;
		user: {
			email: string;
		};
	}>;
	_count: {
		tasks: number;
	};
}

export default function AdminPage() {
	const router = useRouter();
	const { user: currentUser } = useAuth();
	const [users, setUsers] = useState<User[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
	const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
	const [selectedProject, setSelectedProject] = useState<string>("");
	const [selectedProjectForMember, setSelectedProjectForMember] =
		useState<Project | null>(null);
	const [selectedUser, setSelectedUser] = useState<string>("");
	const [selectedMemberUser, setSelectedMemberUser] = useState<string>("");
	const [userPage, setUserPage] = useState(1);
	const [projectPage, setProjectPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [userSearchQuery, setUserSearchQuery] = useState("");
	const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
	const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
	const [newUserEmail, setNewUserEmail] = useState("");
	const [newUserName, setNewUserName] = useState("");
	const [newUserPassword, setNewUserPassword] = useState("");
	const [newProjectName, setNewProjectName] = useState("");
	const [newProjectDescription, setNewProjectDescription] = useState("");
	const [newProjectTags, setNewProjectTags] = useState("");
	const [newProjectOwnerId, setNewProjectOwnerId] = useState("");
	const [isEditUserOpen, setIsEditUserOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [editUserName, setEditUserName] = useState("");
	const [editUserEmail, setEditUserEmail] = useState("");
	const [editUserLevel, setEditUserLevel] = useState<"JUNIOR" | "MEDIOR" | "SENIOR">("JUNIOR");
	const [isFinanceDialogOpen, setIsFinanceDialogOpen] = useState(false);
	const [selectedProjectForFinance, setSelectedProjectForFinance] = useState<Project | null>(null);
	const [financeRevenue, setFinanceRevenue] = useState("");
	const [financeExpense, setFinanceExpense] = useState("");
	const usersPerPage = 4;
	const projectsPerPage = 3;

	useEffect(() => {
		if (currentUser && currentUser.role !== "ADMIN") {
			router.push("/dashboard");
		} else if (currentUser) {
			fetchData();
		}
	}, [currentUser, router]);

	const fetchData = async () => {
		try {
			const [usersRes, projectsRes] = await Promise.all([
				fetch("/api/admin/users"),
				fetch("/api/admin/projects"),
			]);

			if (usersRes.ok) {
				const usersData = await usersRes.json();
				setUsers(usersData);
			}

			if (projectsRes.ok) {
				const projectsData = await projectsRes.json();
				setProjects(projectsData);
			}
		} catch (error) {
			console.error("Error fetching admin data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleAssignProject = async () => {
		if (!selectedProject || !selectedUser) return;

		try {
			const response = await fetch(
				`/api/admin/projects/${selectedProject}/assign`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ userId: selectedUser }),
				}
			);

			if (response.ok) {
				setIsAssignDialogOpen(false);
				setSelectedProject("");
				setSelectedUser("");
				fetchData();
			}
		} catch (error) {
			console.error("Error assigning project:", error);
		}
	};

	const handleDeleteProject = async (projectId: string) => {
		if (!confirm("Are you sure you want to delete this project?")) return;

		try {
			const response = await fetch(`/api/admin/projects/${projectId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				fetchData();
			}
		} catch (error) {
			console.error("Error deleting project:", error);
		}
	};

	const handleChangeUserRole = async (
		userId: string,
		newRole: "ADMIN" | "USER"
	) => {
		try {
			const response = await fetch(`/api/admin/users/${userId}/role`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ role: newRole }),
			});

			if (response.ok) {
				fetchData();
			}
		} catch (error) {
			console.error("Error changing user role:", error);
		}
	};

	const handleAddMember = async () => {
		if (!selectedProjectForMember || !selectedMemberUser) return;

		try {
			const response = await fetch(
				`/api/admin/projects/${selectedProjectForMember.id}/members`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ userId: selectedMemberUser }),
				}
			);

			if (response.ok) {
				setIsMemberDialogOpen(false);
				setSelectedProjectForMember(null);
				setSelectedMemberUser("");
				fetchData();
			}
		} catch (error) {
			console.error("Error adding member:", error);
		}
	};

	const handleRemoveMember = async (projectId: string, userId: string) => {
		if (!confirm("Remove this member from the project?")) return;

		try {
			const response = await fetch(`/api/admin/projects/${projectId}/members`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId }),
			});

			if (response.ok) {
				fetchData();
			}
		} catch (error) {
			console.error("Error removing member:", error);
		}
	};

	const handleCreateUser = async () => {
		if (!newUserEmail || !newUserName || !newUserPassword) return;

		try {
			const response = await fetch("/api/admin/users/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: newUserEmail,
					name: newUserName,
					password: newUserPassword,
				}),
			});

			if (response.ok) {
				setIsCreateUserOpen(false);
				setNewUserEmail("");
				setNewUserName("");
				setNewUserPassword("");
				fetchData();
			}
		} catch (error) {
			console.error("Error creating user:", error);
		}
	};

	const handleCreateProject = async () => {
		if (!newProjectName || !newProjectOwnerId) return;

		try {
			const tags = newProjectTags
				.split(",")
				.map((t) => t.trim())
				.filter((t) => t);
			const response = await fetch("/api/admin/projects/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: newProjectName,
					description: newProjectDescription,
					tags,
					userId: newProjectOwnerId,
				}),
			});

			if (response.ok) {
				setIsCreateProjectOpen(false);
				setNewProjectName("");
				setNewProjectDescription("");
				setNewProjectTags("");
				setNewProjectOwnerId("");
				fetchData();
			}
		} catch (error) {
			console.error("Error creating project:", error);
		}
	};

	const handleEditUser = (user: User) => {
		setEditingUser(user);
		setEditUserName(user.name);
		setEditUserEmail(user.email);
		setEditUserLevel(user.level);
		setIsEditUserOpen(true);
	};

	const handleUpdateUser = async () => {
		if (!editingUser || !editUserName || !editUserEmail) return;

		try {
			const response = await fetch(`/api/admin/users/${editingUser.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: editUserName,
					email: editUserEmail,
					level: editUserLevel,
				}),
			});

			if (response.ok) {
				setIsEditUserOpen(false);
				setEditingUser(null);
				setEditUserName("");
				setEditUserEmail("");
				setEditUserLevel("JUNIOR");
				fetchData();
			}
		} catch (error) {
			console.error("Error updating user:", error);
		}
	};

	const handleDeleteUser = async (userId: string) => {
		if (!confirm("Are you sure you want to delete this user?")) return;

		try {
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				fetchData();
			}
		} catch (error) {
			console.error("Error deleting user:", error);
		}
	};

	const formatNumberWithSpaces = (value: string) => {
		const number = value.replace(/\s/g, "");
		if (!number || isNaN(Number(number))) return "";
		return Number(number).toLocaleString("hu-HU");
	};

	const parseNumberFromFormatted = (value: string) => {
		return value.replace(/\s/g, "");
	};

	const handleOpenFinance = async (project: Project) => {
		setSelectedProjectForFinance(project);
		try {
			const response = await fetch(`/api/admin/projects/${project.id}/finance`);
			if (response.ok) {
				const data = await response.json();
				setFinanceRevenue(formatNumberWithSpaces(data.revenue?.toString() || "0"));
				setFinanceExpense(formatNumberWithSpaces(data.expense?.toString() || "0"));
			}
		} catch (error) {
			console.error("Error fetching finance:", error);
			setFinanceRevenue("0");
			setFinanceExpense("0");
		}
		setIsFinanceDialogOpen(true);
	};

	const handleUpdateFinance = async () => {
		if (!selectedProjectForFinance) return;

		try {
			const response = await fetch(
				`/api/admin/projects/${selectedProjectForFinance.id}/finance`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						revenue: parseFloat(parseNumberFromFormatted(financeRevenue)) || 0,
						expense: parseFloat(parseNumberFromFormatted(financeExpense)) || 0,
					}),
				}
			);

			if (response.ok) {
				setIsFinanceDialogOpen(false);
				setSelectedProjectForFinance(null);
				setFinanceRevenue("");
				setFinanceExpense("");
			}
		} catch (error) {
			console.error("Error updating finance:", error);
		}
	};

	const handleRevenueChange = (value: string) => {
		const cleaned = value.replace(/[^\d]/g, "");
		setFinanceRevenue(formatNumberWithSpaces(cleaned));
	};

	const handleExpenseChange = (value: string) => {
		const cleaned = value.replace(/[^\d]/g, "");
		setFinanceExpense(formatNumberWithSpaces(cleaned));
	};

	const filteredUsers = users.filter((user) => {
		const query = userSearchQuery.toLowerCase();
		const matchesName = user.name?.toLowerCase().includes(query);
		const matchesEmail = user.email.toLowerCase().includes(query);
		return matchesName || matchesEmail;
	});

	const filteredProjects = projects.filter((project) => {
		const query = searchQuery.toLowerCase();
		const matchesName = project.name.toLowerCase().includes(query);
		const matchesOwner = project.owner.email.toLowerCase().includes(query);
		const matchesTags = project.tags.some((tag) =>
			tag.toLowerCase().includes(query)
		);
		return matchesName || matchesOwner || matchesTags;
	});

	const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);
	const totalProjectPages = Math.ceil(
		filteredProjects.length / projectsPerPage
	);

	const paginatedUsers = filteredUsers.slice(
		(userPage - 1) * usersPerPage,
		userPage * usersPerPage
	);

	const paginatedProjects = filteredProjects.slice(
		(projectPage - 1) * projectsPerPage,
		projectPage * projectsPerPage
	);

	if (isLoading || !currentUser) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<div className="container mx-auto px-4 py-8">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-muted rounded w-1/4"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{Array(4)
								.fill(0)
								.map((_, i) => (
									<div key={i} className="h-64 bg-muted rounded"></div>
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

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold">Admin Panel</h1>
					<p className="text-muted-foreground mt-2">
						Manage users and projects
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									Total Users
								</CardTitle>
								<Dialog
									open={isCreateUserOpen}
									onOpenChange={setIsCreateUserOpen}
								>
									<DialogTrigger asChild>
										<Button size="sm">
											<Plus className="h-4 w-4 mr-2" />
											Create User
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Create New User</DialogTitle>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="space-y-2">
												<Label>Name</Label>
												<Input
													type="text"
													placeholder="Full name"
													value={newUserName}
													onChange={(e) => setNewUserName(e.target.value)}
												/>
											</div>
											<div className="space-y-2">
												<Label>Email</Label>
												<Input
													type="email"
													placeholder="user@example.com"
													value={newUserEmail}
													onChange={(e) => setNewUserEmail(e.target.value)}
												/>
											</div>
											<div className="space-y-2">
												<Label>Password</Label>
												<Input
													type="password"
													placeholder="Enter password"
													value={newUserPassword}
													onChange={(e) => setNewUserPassword(e.target.value)}
												/>
											</div>
											<Button
												onClick={handleCreateUser}
												className="w-full"
												disabled={
													!newUserEmail || !newUserName || !newUserPassword
												}
											>
												Create User
											</Button>
										</div>
									</DialogContent>
								</Dialog>
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold">{users.length}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<FolderOpen className="h-5 w-5" />
									Total Projects
								</CardTitle>
								<Dialog
									open={isCreateProjectOpen}
									onOpenChange={setIsCreateProjectOpen}
								>
									<DialogTrigger asChild>
										<Button size="sm">
											<Plus className="h-4 w-4 mr-2" />
											Create Project
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Create New Project</DialogTitle>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="space-y-2">
												<Label>Project Name</Label>
												<Input
													placeholder="Enter project name"
													value={newProjectName}
													onChange={(e) => setNewProjectName(e.target.value)}
												/>
											</div>
											<div className="space-y-2">
												<Label>Description (optional)</Label>
												<Input
													placeholder="Enter description"
													value={newProjectDescription}
													onChange={(e) =>
														setNewProjectDescription(e.target.value)
													}
												/>
											</div>
											<div className="space-y-2">
												<Label>Tags (comma separated)</Label>
												<Input
													placeholder="design, frontend, urgent"
													value={newProjectTags}
													onChange={(e) => setNewProjectTags(e.target.value)}
												/>
											</div>
											<div className="space-y-2">
												<Label>Owner</Label>
												<Select
													value={newProjectOwnerId}
													onValueChange={setNewProjectOwnerId}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select owner" />
													</SelectTrigger>
													<SelectContent>
														{users.map((user) => (
															<SelectItem key={user.id} value={user.id}>
																<div className="flex flex-row gap-1">
																	{user.email}{" "}
																	{user.email === currentUser.email ? (
																		<div>(you)</div>
																	) : (
																		""
																	)}
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
											<Button
												onClick={handleCreateProject}
												className="w-full"
												disabled={!newProjectName || !newProjectOwnerId}
											>
												Create Project
											</Button>
										</div>
									</DialogContent>
								</Dialog>
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold">{projects.length}</div>
						</CardContent>
					</Card>
				</div>

				<Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit User</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label>Name</Label>
								<Input
									value={editUserName}
									onChange={(e) => setEditUserName(e.target.value)}
									placeholder="User name"
								/>
							</div>
							<div className="space-y-2">
								<Label>Email</Label>
								<Input
									type="email"
									value={editUserEmail}
									onChange={(e) => setEditUserEmail(e.target.value)}
									placeholder="user@example.com"
								/>
							</div>
							<div className="space-y-2">
								<Label>Level</Label>
								<Select
									value={editUserLevel}
									onValueChange={(value: "JUNIOR" | "MEDIOR" | "SENIOR") => setEditUserLevel(value)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="JUNIOR">Junior</SelectItem>
										<SelectItem value="MEDIOR">Medior</SelectItem>
										<SelectItem value="SENIOR">Senior</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<Button
								onClick={handleUpdateUser}
								className="w-full"
								disabled={!editUserName || !editUserEmail}
							>
								Update User
							</Button>
						</div>
					</DialogContent>
				</Dialog>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<div className="flex flex-col gap-4">
								<div>
									<CardTitle>Users</CardTitle>
									<CardDescription>
										All registered users in the system
									</CardDescription>
								</div>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search by name or email..."
										value={userSearchQuery}
										onChange={(e) => {
											setUserSearchQuery(e.target.value);
											setUserPage(1);
										}}
										className="pl-10"
									/>
								</div>
							</div>
						</CardHeader>
						<CardContent className="flex flex-col h-[500px]">
							<div className="space-y-4 flex-1 overflow-y-auto">
								{paginatedUsers.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										No users found
									</div>
								) : (
									paginatedUsers.map((user) => (
										<div
											key={user.id}
											className="flex items-center justify-between p-3 border rounded-lg"
										>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<p className="font-medium">{user.name}</p>
													<Badge className={`${
														user.level === 'JUNIOR' ? 'bg-blue-100 text-blue-800' :
														user.level === 'MEDIOR' ? 'bg-green-100 text-green-800' :
														'bg-purple-100 text-purple-800'
													}`}>
														{user.level}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground">
													{user.email} •{" "}
													{user._count.ownedProjects +
														user._count.projectMembers}{" "}
													projects
												</p>
											</div>
											<div className="flex items-center gap-2">
												<Select
													value={user.role}
													onValueChange={(value: "ADMIN" | "USER") =>
														handleChangeUserRole(user.id, value)
													}
												>
													<SelectTrigger className="w-[100px]">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="USER">USER</SelectItem>
														<SelectItem value="ADMIN">ADMIN</SelectItem>
													</SelectContent>
												</Select>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleEditUser(user)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteUser(user.id)}
													className="hover:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									))
								)}
							</div>
							{totalUserPages > 1 && (
								<div className="flex items-center justify-between mt-4 pt-4 border-t">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setUserPage((p) => Math.max(1, p - 1))}
										disabled={userPage === 1}
									>
										<ChevronLeft className="h-4 w-4 mr-1" />
										Previous
									</Button>
									<span className="text-sm text-muted-foreground">
										Page {userPage} of {totalUserPages}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											setUserPage((p) => Math.min(totalUserPages, p + 1))
										}
										disabled={userPage === totalUserPages}
									>
										Next
										<ChevronRight className="h-4 w-4 ml-1" />
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>Projects</CardTitle>
										<CardDescription>
											All projects in the system
										</CardDescription>
									</div>
									<Dialog
										open={isAssignDialogOpen}
										onOpenChange={setIsAssignDialogOpen}
									>
										<DialogTrigger asChild>
											<Button size="sm">
												<UserPlus className="h-4 w-4 mr-2" />
												Assign
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Assign Project to User</DialogTitle>
											</DialogHeader>
											<div className="space-y-4 py-4">
												<div className="space-y-2">
													<Label>Select Project</Label>
													<Select
														value={selectedProject}
														onValueChange={setSelectedProject}
													>
														<SelectTrigger>
															<SelectValue placeholder="Choose a project" />
														</SelectTrigger>
														<SelectContent>
															{projects.map((project) => (
																<SelectItem key={project.id} value={project.id}>
																	{project.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
												<div className="space-y-2">
													<Label>Select User</Label>
													<Select
														value={selectedUser}
														onValueChange={setSelectedUser}
													>
														<SelectTrigger>
															<SelectValue placeholder="Choose a user" />
														</SelectTrigger>
														<SelectContent>
															{users.map((user) => (
																<SelectItem key={user.id} value={user.id}>
																	<div className="flex flex-row gap-1">
																		{user.email}
																		{user.email === currentUser.email ? (
																			<div>(you)</div>
																		) : (
																			""
																		)}
																	</div>
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
												<Button
													onClick={handleAssignProject}
													className="w-full"
													disabled={!selectedProject || !selectedUser}
												>
													Assign Project
												</Button>
											</div>
										</DialogContent>
									</Dialog>

									<Dialog
										open={isMemberDialogOpen}
										onOpenChange={setIsMemberDialogOpen}
									>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Add Member to Project</DialogTitle>
											</DialogHeader>
											<div className="space-y-4 py-4">
												<div className="space-y-2">
													<Label>Project</Label>
													<Input
														value={selectedProjectForMember?.name || ""}
														disabled
													/>
												</div>
												<div className="space-y-2">
													<Label>Select User</Label>
													<Select
														value={selectedMemberUser}
														onValueChange={setSelectedMemberUser}
													>
														<SelectTrigger>
															<SelectValue placeholder="Choose a user" />
														</SelectTrigger>
														<SelectContent>
															{users
																.filter(
																	(u) =>
																		selectedProjectForMember?.userId !== u.id &&
																		!selectedProjectForMember?.members.some(
																			(m) => m.userId === u.id
																		)
																)
																.map((user) => (
																	<SelectItem key={user.id} value={user.id}>
																		{user.email}
																	</SelectItem>
																))}
														</SelectContent>
													</Select>
												</div>
												<Button
													onClick={handleAddMember}
													className="w-full"
													disabled={!selectedMemberUser}
												>
													Add Member
												</Button>
											</div>
										</DialogContent>
									</Dialog>
								</div>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search by name, owner, or tag..."
										value={searchQuery}
										onChange={(e) => {
											setSearchQuery(e.target.value);
											setProjectPage(1);
										}}
										className="pl-10"
									/>
								</div>
							</div>
						</CardHeader>
						<CardContent className="flex flex-col h-[500px]">
							<div className="space-y-4 flex-1 overflow-y-auto">
								{paginatedProjects.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										No projects found
									</div>
								) : (
									paginatedProjects.map((project) => (
										<div
											key={project.id}
											className="p-3 border rounded-lg space-y-2"
										>
											<div className="flex items-center justify-between">
												<div className="flex-1 min-w-0">
													<p className="font-medium truncate">{project.name}</p>
													<p className="text-sm text-muted-foreground">
														Owner: {project.owner.email} •{" "}
														{project._count.tasks} tasks
													</p>
													{project.tags.length > 0 && (
														<div className="flex flex-wrap gap-1 mt-1">
															{project.tags.map((tag, index) => (
																<Badge
																	key={index}
																	variant="outline"
																	className="text-xs"
																>
																	{tag}
																</Badge>
															))}
														</div>
													)}
												</div>
												<div className="flex gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleOpenFinance(project)}
														title="Manage Finances"
													>
														<DollarSign className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															setSelectedProjectForMember(project);
															setIsMemberDialogOpen(true);
														}}
													>
														<UserPlus className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDeleteProject(project.id)}
														className="hover:text-destructive"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
											{project.members.length > 0 && (
												<div className="pt-2 border-t">
													<p className="text-xs font-medium text-muted-foreground mb-1">
														Members:
													</p>
													<div className="flex flex-wrap gap-1">
														{project.members.map((member) => (
															<Badge
																key={member.id}
																variant="secondary"
																className="text-xs"
															>
																{member.user.email}
																<button
																	onClick={() =>
																		handleRemoveMember(
																			project.id,
																			member.userId
																		)
																	}
																	className="ml-1 hover:text-destructive"
																>
																	×
																</button>
															</Badge>
														))}
													</div>
												</div>
											)}
										</div>
									))
								)}
							</div>
							{totalProjectPages > 1 && (
								<div className="flex items-center justify-between mt-4 pt-4 border-t">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setProjectPage((p) => Math.max(1, p - 1))}
										disabled={projectPage === 1}
									>
										<ChevronLeft className="h-4 w-4 mr-1" />
										Previous
									</Button>
									<span className="text-sm text-muted-foreground">
										Page {projectPage} of {totalProjectPages}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											setProjectPage((p) => Math.min(totalProjectPages, p + 1))
										}
										disabled={projectPage === totalProjectPages}
									>
										Next
										<ChevronRight className="h-4 w-4 ml-1" />
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
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
									value={selectedProjectForFinance?.name || ""}
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
		</div>
	);
}
