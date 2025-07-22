import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Upload, 
  FileSpreadsheet, 
  Search, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Diamond
} from "lucide-react";

interface UserUploadData {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  created_at: string;
  last_login?: string;
  total_diamonds: number;
  upload_status: 'uploaded' | 'no_uploads' | 'inactive';
  last_upload_date?: string;
  upload_methods: string[];
}

export function UserUploadAnalysis() {
  const [users, setUsers] = useState<UserUploadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'uploaded' | 'no_uploads' | 'inactive'>('all');
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalUsers: 0,
    usersWithUploads: 0,
    usersWithoutUploads: 0,
    inactiveUsers: 0,
    totalDiamonds: 0,
    avgDiamondsPerUser: 0
  });

  useEffect(() => {
    loadUserUploadData();
  }, []);

  const loadUserUploadData = async () => {
    setLoading(true);
    try {
      console.log("🔍 Loading user upload analysis...");

      // Get all users from user_profiles
      const { data: allUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, username, created_at, last_login')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error("❌ Error loading users:", usersError);
        throw usersError;
      }

      console.log(`📊 Found ${allUsers?.length || 0} total users`);

      // Get inventory data for all users
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('user_id, created_at, updated_at')
        .is('deleted_at', null);

      if (inventoryError) {
        console.error("❌ Error loading inventory:", inventoryError);
        throw inventoryError;
      }

      console.log(`💎 Found ${inventoryData?.length || 0} total diamonds in inventory`);

      // Process the data to create user upload analysis
      const userUploadData: UserUploadData[] = (allUsers || []).map(user => {
        const userDiamonds = (inventoryData || []).filter(item => item.user_id === user.telegram_id);
        const totalDiamonds = userDiamonds.length;
        
        // Determine upload status
        let uploadStatus: 'uploaded' | 'no_uploads' | 'inactive' = 'no_uploads';
        
        if (totalDiamonds > 0) {
          uploadStatus = 'uploaded';
        } else {
          // Check if user is inactive (no login in last 30 days)
          const lastLogin = user.last_login ? new Date(user.last_login) : null;
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          
          if (!lastLogin || lastLogin < thirtyDaysAgo) {
            uploadStatus = 'inactive';
          }
        }

        // Get upload dates and methods (simplified for now)
        const uploadDates = userDiamonds.map(d => d.created_at).sort();
        const lastUploadDate = uploadDates.length > 0 ? uploadDates[uploadDates.length - 1] : undefined;
        
        // Estimate upload methods based on creation patterns
        const uploadMethods: string[] = [];
        if (totalDiamonds > 0) {
          if (totalDiamonds > 5) {
            uploadMethods.push('CSV Bulk Upload');
          } else {
            uploadMethods.push('Single Diamond Upload');
          }
        }

        return {
          telegram_id: user.telegram_id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          created_at: user.created_at,
          last_login: user.last_login,
          total_diamonds: totalDiamonds,
          upload_status: uploadStatus,
          last_upload_date: lastUploadDate,
          upload_methods: uploadMethods
        };
      });

      // Calculate statistics
      const totalUsers = userUploadData.length;
      const usersWithUploads = userUploadData.filter(u => u.upload_status === 'uploaded').length;
      const usersWithoutUploads = userUploadData.filter(u => u.upload_status === 'no_uploads').length;
      const inactiveUsers = userUploadData.filter(u => u.upload_status === 'inactive').length;
      const totalDiamonds = userUploadData.reduce((sum, u) => sum + u.total_diamonds, 0);
      const avgDiamondsPerUser = usersWithUploads > 0 ? totalDiamonds / usersWithUploads : 0;

      setStats({
        totalUsers,
        usersWithUploads,
        usersWithoutUploads,
        inactiveUsers,
        totalDiamonds,
        avgDiamondsPerUser: Math.round(avgDiamondsPerUser * 10) / 10
      });

      setUsers(userUploadData);
      
      console.log("📊 User upload analysis complete:", {
        totalUsers,
        usersWithUploads,
        usersWithoutUploads,
        inactiveUsers,
        totalDiamonds
      });

    } catch (error) {
      console.error("❌ Error loading user upload data:", error);
      toast({
        title: "Error",
        description: "Failed to load user upload analysis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telegram_id.toString().includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || user.upload_status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const csvHeaders = [
      'Telegram ID',
      'First Name', 
      'Last Name',
      'Username',
      'Registration Date',
      'Last Login',
      'Total Diamonds',
      'Upload Status',
      'Last Upload Date',
      'Upload Methods'
    ];

    const csvData = filteredUsers.map(user => [
      user.telegram_id.toString(),
      user.first_name,
      user.last_name || '',
      user.username || '',
      new Date(user.created_at).toLocaleDateString(),
      user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never',
      user.total_diamonds.toString(),
      user.upload_status,
      user.last_upload_date ? new Date(user.last_upload_date).toLocaleDateString() : 'Never',
      user.upload_methods.join(', ')
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user_upload_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "User upload analysis exported to CSV"
    });
  };

  const getStatusBadge = (status: UserUploadData['upload_status']) => {
    switch (status) {
      case 'uploaded':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Uploaded</Badge>;
      case 'no_uploads':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />No Uploads</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading user upload analysis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.usersWithUploads}</div>
            <div className="text-sm text-muted-foreground">With Uploads</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold">{stats.usersWithoutUploads}</div>
            <div className="text-sm text-muted-foreground">No Uploads</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <div className="text-2xl font-bold">{stats.inactiveUsers}</div>
            <div className="text-sm text-muted-foreground">Inactive</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Diamond className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{stats.totalDiamonds}</div>
            <div className="text-sm text-muted-foreground">Total Diamonds</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{stats.avgDiamondsPerUser}</div>
            <div className="text-sm text-muted-foreground">Avg per User</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            User Upload Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, username, or Telegram ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All ({stats.totalUsers})
              </Button>
              <Button
                variant={filterStatus === 'uploaded' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('uploaded')}
                size="sm"
              >
                Uploaded ({stats.usersWithUploads})
              </Button>
              <Button
                variant={filterStatus === 'no_uploads' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('no_uploads')}
                size="sm"
              >
                No Uploads ({stats.usersWithoutUploads})
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('inactive')}
                size="sm"
              >
                Inactive ({stats.inactiveUsers})
              </Button>
            </div>
            
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* User List */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Telegram ID</th>
                  <th className="text-center p-2">Status</th>
                  <th className="text-center p-2">Diamonds</th>
                  <th className="text-left p-2">Last Upload</th>
                  <th className="text-left p-2">Methods</th>
                  <th className="text-left p-2">Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.telegram_id.toString()} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">
                          {user.first_name} {user.last_name || ''}
                        </div>
                        {user.username && (
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 font-mono text-sm">{user.telegram_id.toString()}</td>
                    <td className="p-2 text-center">{getStatusBadge(user.upload_status)}</td>
                    <td className="p-2 text-center font-semibold">{user.total_diamonds}</td>
                    <td className="p-2 text-sm">
                      {user.last_upload_date 
                        ? new Date(user.last_upload_date).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="p-2 text-sm">
                      {user.upload_methods.length > 0 
                        ? user.upload_methods.join(', ')
                        : 'None'
                      }
                    </td>
                    <td className="p-2 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}