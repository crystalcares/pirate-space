import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, ShieldCheck, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import AdminPageHeader from './ui/AdminPageHeader';
import FilterInput from './ui/FilterInput';
import { Skeleton } from '../ui/skeleton';

type ProfileWithRoles = {
    id: string;
    username: string | null;
    email: string | null;
    avatar_url: string | null;
    created_at: string;
    roles: { name: string }[];
};

export default function UserManagement() {
    const [users, setUsers] = useState<ProfileWithRoles[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_users_with_details');

        if (error) {
            toast.error('Failed to fetch users.');
            console.error(error);
        } else {
            setUsers(data as ProfileWithRoles[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const lowercasedTerm = searchTerm.toLowerCase();
        return users.filter(user => 
            user.username?.toLowerCase().includes(lowercasedTerm) ||
            user.email?.toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm, users]);

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const toggleAdminRole = async (userId: string, isCurrentlyAdmin: boolean) => {
        const adminRoleResult = await supabase.from('roles').select('id').eq('name', 'admin').single();
        if (adminRoleResult.error || !adminRoleResult.data) {
            toast.error("Could not find admin role.");
            return;
        }
        const adminRoleId = adminRoleResult.data.id;

        let error;
        if (isCurrentlyAdmin) {
            const res = await supabase.from('user_roles').delete().match({ user_id: userId, role_id: adminRoleId });
            error = res.error;
        } else {
            const res = await supabase.from('user_roles').insert({ user_id: userId, role_id: adminRoleId });
            error = res.error;
        }

        if (error) {
            toast.error(`Failed to update role: ${error.message}`);
        } else {
            toast.success(`User role updated successfully.`);
            fetchUsers(); // Refresh user list
        }
    };

    const TableSkeleton = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell"><span className="sr-only">Image</span></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                        <TableCell><div className="space-y-2"><Skeleton className="h-4 w-[150px]" /><Skeleton className="h-3 w-[200px]" /></div></TableCell>
                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <div className="space-y-8">
            <AdminPageHeader title="Customers" description="View and manage all registered users." />
            <Card className="glass-card">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>Total users: {users.length}</CardDescription>
                        </div>
                        <div className="w-full sm:w-64">
                            <FilterInput 
                                placeholder="Filter by username or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? <TableSkeleton /> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="hidden w-[100px] sm:table-cell">
                                        <span className="sr-only">Image</span>
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Joined
                                    </TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map(user => {
                                    const isAdmin = user.roles.some(r => r.name === 'admin');
                                    return (
                                        <TableRow key={user.id} className="hover:bg-muted/40">
                                            <TableCell className="hidden sm:table-cell">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.avatar_url || ''} alt={user.username || 'User'} />
                                                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="font-medium">{user.username || 'N/A'}</div>
                                                <div className="hidden text-sm text-muted-foreground md:inline">
                                                    {user.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {isAdmin ? (
                                                    <span className="flex items-center gap-1 text-primary"><ShieldCheck size={16} /> Admin</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-muted-foreground"><Shield size={16} /> User</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {format(new Date(user.created_at || Date.now()), 'PP')}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-background/80 backdrop-blur-lg">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => toggleAdminRole(user.id, isAdmin)}>
                                                            {isAdmin ? 'Remove Admin' : 'Make Admin'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem disabled>Delete (Not Implemented)</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
