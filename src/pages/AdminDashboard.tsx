import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  XCircle,
  Eye,
  Ban,
  Check,
  Filter,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdmin } from "@/contexts/AdminContext";
import { adminAPI } from "@/services/adminAPI";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AdminCampaign {
  id: string;
  title: string;
  description: string;
  target: number;
  amountRaised: number;
  deadline: string;
  receiver: string;
  creator: string;
  status: "pending" | "approved" | "blocked" | "active" | "completed" | "failed";
  adminStatus: "pending" | "approved" | "blocked";
  createdAt: string;
  donorCount?: number;
}

interface AdminStats {
  totalCampaigns: number;
  pendingCampaigns: number;
  approvedCampaigns: number;
  blockedCampaigns: number;
  totalRaised: number;
}

const AdminDashboard = () => {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const { admin, isAdmin } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [campaignResponse, statsResponse] = await Promise.all([
        adminAPI.getAllCampaigns(),
        adminAPI.getAdminStats()
      ]);
      setCampaigns(campaignResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error loading data",
        description: "Failed to load admin dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCampaign = async (id: string) => {
    setActionLoading(id);
    try {
      await adminAPI.approveCampaign(id);
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === id 
            ? { ...campaign, adminStatus: "approved", status: "active" }
            : campaign
        )
      );
      toast({
        title: "Campaign approved",
        description: "The campaign is now live and accepting donations",
      });
      fetchData(); // Refresh stats
    } catch (error: any) {
      toast({
        title: "Error approving campaign",
        description: error.message || "Failed to approve campaign",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockCampaign = async (id: string) => {
    setActionLoading(id);
    try {
      await adminAPI.blockCampaign(id, "Violated platform policies");
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === id 
            ? { ...campaign, adminStatus: "blocked", status: "blocked" }
            : campaign
        )
      );
      toast({
        title: "Campaign blocked",
        description: "The campaign has been blocked and is no longer visible",
      });
      fetchData(); // Refresh stats
    } catch (error: any) {
      toast({
        title: "Error blocking campaign",
        description: error.message || "Failed to block campaign",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || campaign.adminStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-amber-600 border-amber-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-secondary text-secondary-foreground"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case "blocked":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Blocked</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8 text-destructive" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {admin?.username}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Campaigns"
                value={stats.totalCampaigns}
                icon={Users}
                color="bg-primary"
              />
              <StatCard
                title="Pending Review"
                value={stats.pendingCampaigns}
                icon={Clock}
                color="bg-amber-500"
              />
              <StatCard
                title="Approved"
                value={stats.approvedCampaigns}
                icon={CheckCircle2}
                color="bg-secondary"
              />
              <StatCard
                title="Total Raised"
                value={`$${stats.totalRaised.toLocaleString()}`}
                icon={DollarSign}
                color="bg-accent"
              />
            </div>
          )}

          {/* Campaign Management */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-xl">Campaign Management</CardTitle>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {filteredCampaigns.map((campaign, index) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-2">
                            <h3 className="font-semibold text-lg line-clamp-1">
                              {campaign.title}
                            </h3>
                            {getStatusBadge(campaign.adminStatus)}
                          </div>
                          
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                            {campaign.description}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Target:</span>
                              <p className="font-semibold">${campaign.target.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Raised:</span>
                              <p className="font-semibold">${campaign.amountRaised.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Donors:</span>
                              <p className="font-semibold">{campaign.donorCount || 0}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Created:</span>
                              <p className="font-semibold">
                                {new Date(campaign.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-xs text-muted-foreground">
                            <p>Creator: <span className="font-mono">{campaign.creator}</span></p>
                            <p>Receiver: <span className="font-mono">{campaign.receiver}</span></p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/campaign/${campaign.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          
                          {campaign.adminStatus === "pending" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApproveCampaign(campaign.id)}
                                disabled={actionLoading === campaign.id}
                                className="bg-secondary hover:bg-secondary/90"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                {actionLoading === campaign.id ? "..." : "Approve"}
                              </Button>
                              
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleBlockCampaign(campaign.id)}
                                disabled={actionLoading === campaign.id}
                              >
                                <Ban className="w-4 h-4 mr-1" />
                                {actionLoading === campaign.id ? "..." : "Block"}
                              </Button>
                            </>
                          )}
                          
                          {campaign.adminStatus === "approved" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleBlockCampaign(campaign.id)}
                              disabled={actionLoading === campaign.id}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              {actionLoading === campaign.id ? "..." : "Block"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterStatus !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "No campaigns have been created yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;