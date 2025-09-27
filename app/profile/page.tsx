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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { User, Mail, Shield, TrendingUp } from "lucide-react";

export default function ProfilePage() {
	const router = useRouter();
	const { user: currentUser, setUser } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");

	useEffect(() => {
		if (currentUser) {
			setName(currentUser.email.split("@")[0]);
			setEmail(currentUser.email);
			fetchUserDetails();
		}
	}, [currentUser]);

	const fetchUserDetails = async () => {
		try {
			const response = await fetch("/api/auth/me");
			if (response.ok) {
				const data = await response.json();
				setName(data.user.email.split("@")[0]);
				setEmail(data.user.email);
			}
		} catch (error) {
			console.error("Error fetching user details:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const response = await fetch(`/api/admin/users/${currentUser?.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email }),
			});

			if (response.ok) {
				const data = await response.json();
				if (currentUser) {
					setUser({
						...currentUser,
						email: data.user.email,
					});
				}
				alert("Profile updated successfully");
			} else {
				const error = await response.json();
				alert(error.error || "Failed to update profile");
			}
		} catch (error) {
			console.error("Error updating profile:", error);
			alert("Failed to update profile");
		} finally {
			setIsSaving(false);
		}
	};

	const getLevelBadgeColor = (level?: string) => {
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
						<div className="h-64 bg-muted rounded"></div>
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
					<h1 className="text-3xl font-bold">My Profile</h1>
					<p className="text-muted-foreground mt-2">
						Manage your account settings
					</p>
				</div>

				<div className="max-w-2xl space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Personal Information</CardTitle>
							<CardDescription>
								Update your personal details
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Your name"
								/>
							</div>
							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="your.email@example.com"
								/>
							</div>
							<Button onClick={handleSave} disabled={isSaving}>
								{isSaving ? "Saving..." : "Save Changes"}
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Account Details</CardTitle>
							<CardDescription>
								View your account information
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-3 p-3 border rounded-lg">
								<Shield className="h-5 w-5 text-muted-foreground" />
								<div className="flex-1">
									<p className="text-sm font-medium">Role</p>
									<p className="text-sm text-muted-foreground">
										Your account role
									</p>
								</div>
								<Badge variant={currentUser.role === "ADMIN" ? "default" : "secondary"}>
									{currentUser.role}
								</Badge>
							</div>

							<div className="flex items-center gap-3 p-3 border rounded-lg">
								<TrendingUp className="h-5 w-5 text-muted-foreground" />
								<div className="flex-1">
									<p className="text-sm font-medium">Level</p>
									<p className="text-sm text-muted-foreground">
										Your experience level
									</p>
								</div>
								<Badge className={getLevelBadgeColor(currentUser.level)}>
									{currentUser.level || "JUNIOR"}
								</Badge>
							</div>

							<div className="flex items-center gap-3 p-3 border rounded-lg">
								<User className="h-5 w-5 text-muted-foreground" />
								<div className="flex-1">
									<p className="text-sm font-medium">User ID</p>
									<p className="text-sm text-muted-foreground font-mono">
										{currentUser.id}
									</p>
								</div>
							</div>

							<div className="text-sm text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
								<p className="font-medium mb-1">Note:</p>
								<p>
									Your role and level can only be changed by an administrator.
									Contact your admin if you need these updated.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}