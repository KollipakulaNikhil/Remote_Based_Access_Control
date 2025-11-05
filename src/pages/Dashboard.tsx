import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  LogOut, 
  Settings, 
  TrendingUp, 
  Activity, 
  CheckCircle2,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { signOut } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<string>("");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
        return;
      }

      // Get user profile
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setUserName(data.full_name || "User");
            setUserEmail(data.email);
          }
        });

      // Get user role
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setUserRole(data.role);
          } else {
            setUserRole('user');
          }
        });

      // Get audit logs
      supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5)
        .then(({ data }) => {
          if (data) {
            setAuditLogs(data);
          }
        });
    });
  }, [navigate]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-card shadow-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Company Portal</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Welcome back, {userName}
                </span>
                {userRole && (
                  <Badge variant={userRole === 'admin' ? 'destructive' : userRole === 'employee' ? 'default' : 'secondary'}>
                    {userRole.toUpperCase()}
                  </Badge>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">
                {userRole === 'admin' ? 'Admin Control Panel' : 
                 userRole === 'employee' ? 'Employee Dashboard' : 
                 'User Dashboard'}
              </h1>
              {userRole && (
                <Badge variant={userRole === 'admin' ? 'destructive' : userRole === 'employee' ? 'default' : 'secondary'} className="text-sm">
                  {userRole.toUpperCase()}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {userRole === 'admin' ? 'Full system access and control' :
               userRole === 'employee' ? 'Monitor your work and team activity' :
               'Monitor your account activity and security'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border shadow-card hover:shadow-elevated transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Security Status
                </CardTitle>
                <CheckCircle2 className="h-5 w-5 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">Active</div>
                <p className="text-xs text-muted-foreground mt-1">
                  2FA enabled and verified
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card hover:shadow-elevated transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {userRole === 'admin' ? 'Total Users' : 'Performance'}
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {userRole === 'admin' ? '156' : '98.5%'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {userRole === 'admin' ? 'Active in the system' : 'System uptime this month'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card hover:shadow-elevated transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {userRole === 'admin' ? 'System Health' : 'Activity'}
                </CardTitle>
                <Activity className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {userRole === 'admin' ? '99.9%' : '24'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {userRole === 'admin' ? 'All services operational' : 'Logins this week'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest account actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.length > 0 ? auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(log.created_at)}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>Current system metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Sessions</span>
                    <span className="font-medium">1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Login</span>
                    <span className="font-medium">Today, 9:42 AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Account Type</span>
                    <Badge variant={userRole === 'admin' ? 'destructive' : userRole === 'employee' ? 'default' : 'secondary'}>
                      {userRole ? userRole.toUpperCase() : 'USER'}
                    </Badge>
                  </div>
                  {userRole === 'admin' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Privileges</span>
                      <span className="font-medium text-destructive">Full Access</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleSettings}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleSettings}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Security Options
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;