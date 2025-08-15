import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreVertical, Edit, Copy, Trash, BarChart3, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useNavigate } from 'react-router-dom';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { TelegramOnlyGuard } from '@/components/auth/TelegramOnlyGuard';
import { StartupQualityLayout } from '@/layouts/StartupQualityLayout';
import { InvestmentNotificationSender } from '@/components/admin/InvestmentNotificationSender';
import { InvestmentAnalyticsDashboard } from '@/components/admin/InvestmentAnalyticsDashboard';

interface User {
  id: string
  firstName: string
  lastName: string
  age: number
  visits: number
  status: string
  progress: number
  createdAt: string
}

const data: User[] = [
  {
    id: "m5gr84i9",
    firstName: "Pete",
    lastName: "Fox",
    age: 19,
    visits: 624,
    status: "pending",
    progress: 75,
    createdAt: "2022-01-02",
  },
  {
    id: "3u1k1k1j",
    firstName: "Mike",
    lastName: "Foxtrot",
    age: 22,
    visits: 352,
    status: "active",
    progress: 23,
    createdAt: "2022-01-02",
  },
  {
    id: "9it24msw",
    firstName: "Oscar",
    lastName: "Hotel",
    age: 23,
    visits: 721,
    status: "active",
    progress: 88,
    createdAt: "2022-01-02",
  },
  {
    id: "g9v2j0ps",
    firstName: "Sierra",
    lastName: "Golf",
    age: 20,
    visits: 721,
    status: "pending",
    progress: 13,
    createdAt: "2022-01-02",
  },
  {
    id: "f0v4m3uw",
    firstName: "Victor",
    lastName: "Lima",
    age: 18,
    visits: 50,
    status: "active",
    progress: 93,
    createdAt: "2022-01-02",
  },
]

const AdminHeader = () => {
  const { user } = useTelegramAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('telegram-webapp-auth-data');

    // Redirect to the index page
    navigate('/');

    // Show a toast notification
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
        <Button variant="destructive" onClick={handleLogout}>Logout</Button>
      </CardHeader>
      <CardContent>
        <CardDescription>
          Manage users, settings, and monitor application analytics.
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "age",
    header: "Age",
  },
  {
    accessorKey: "visits",
    header: "Visits",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "progress",
    header: "Progress",
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-right">Created At</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") as string)
      return <div className="text-right">{date.toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy Id
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function Admin() {
  const [activeTab, setActiveTab] = useState("users");
  const { toast } = useToast()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <TelegramOnlyGuard>
      <AdminGuard>
        <StartupQualityLayout>
          <div className="container mx-auto p-4 space-y-6" dir="rtl">
            <AdminHeader />
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-12 gap-1 h-auto p-1">
                <TabsTrigger value="users" className="text-xs p-2">
                  Users
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs p-2">
                  Settings
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs p-2">
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="investment" className="text-xs p-2">
                  💼 השקעות
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                      Manage users and their activity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                              {headerGroup.headers.map((header) => {
                                return (
                                  <TableHead key={header.id}>
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                  </TableHead>
                                )
                              })}
                            </TableRow>
                          ))}
                        </TableHeader>
                        <TableBody>
                          {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>
                      Configure application settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Name" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" placeholder="Email" />
                      </div>
                      <Button>Update Settings</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>
                      Monitor application analytics.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Analytics data will be displayed here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="investment" className="space-y-6">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        ניהול קמפיין השקעה
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InvestmentNotificationSender />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        אנליטיקס קמפיין השקעה
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InvestmentAnalyticsDashboard />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </StartupQualityLayout>
      </AdminGuard>
    </TelegramOnlyGuard>
  );
}
