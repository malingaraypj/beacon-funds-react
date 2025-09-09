import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Target, 
  Wallet,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { campaignAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  title: string;
  description: string;
  target: number;
  amountRaised: number;
  deadline: string;
  receiver: string;
  status: "active" | "completed" | "failed";
  donorCount?: number;
  createdAt: string;
}

interface Donation {
  id: string;
  donor: string;
  amount: number;
  timestamp: string;
}

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationLoading, setDonationLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCampaign();
      fetchDonations();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const response = await campaignAPI.getCampaign(id!);
      setCampaign(response.data);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      // Mock data for demo
      const mockCampaign: Campaign = {
        id: id!,
        title: "Help Build Clean Water Wells in Rural Communities",
        description: "Providing access to clean water for families in underserved areas. Your donation helps build sustainable water infrastructure that will serve communities for generations to come. We partner with local organizations to ensure proper maintenance and community ownership of these vital resources.",
        target: 50000,
        amountRaised: 32500,
        deadline: "2024-12-31",
        receiver: "0x1234567890123456789012345678901234567890",
        status: "active",
        donorCount: 127,
        createdAt: "2024-01-15"
      };
      setCampaign(mockCampaign);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    try {
      const response = await campaignAPI.getDonations(id!);
      setDonations(response.data);
    } catch (error) {
      console.error("Error fetching donations:", error);
      // Mock donations for demo
      const mockDonations: Donation[] = [
        {
          id: "1",
          donor: "0x1234...5678",
          amount: 500,
          timestamp: "2024-01-20T10:00:00Z"
        },
        {
          id: "2", 
          donor: "0x9876...5432",
          amount: 1000,
          timestamp: "2024-01-19T15:30:00Z"
        },
        {
          id: "3",
          donor: "0xabcd...ef12",
          amount: 250,
          timestamp: "2024-01-18T09:15:00Z"
        }
      ];
      setDonations(mockDonations);
    }
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to make a donation.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const amount = parseFloat(donationAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    setDonationLoading(true);
    try {
      await campaignAPI.donate(id!, amount);
      toast({
        title: "Donation successful!",
        description: `Thank you for donating $${amount}!`,
      });
      setDonationAmount("");
      fetchCampaign();
      fetchDonations();
    } catch (error: any) {
      toast({
        title: "Donation failed",
        description: error.response?.data?.message || "Failed to process donation",
        variant: "destructive",
      });
    } finally {
      setDonationLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setActionLoading(true);
    try {
      await campaignAPI.withdraw(id!);
      toast({
        title: "Withdrawal successful!",
        description: "Funds have been withdrawn to your wallet.",
      });
      fetchCampaign();
    } catch (error: any) {
      toast({
        title: "Withdrawal failed",
        description: error.response?.data?.message || "Failed to withdraw funds",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async () => {
    setActionLoading(true);
    try {
      await campaignAPI.refund(id!);
      toast({
        title: "Refund claimed!",
        description: "Your refund has been processed.",
      });
      fetchCampaign();
    } catch (error: any) {
      toast({
        title: "Refund failed",
        description: error.response?.data?.message || "Failed to process refund",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign not found</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const progress = (campaign.amountRaised / campaign.target) * 100;
  const daysLeft = Math.ceil(
    (new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOwner = user?.walletAddress === campaign.receiver;

  const getStatusIcon = () => {
    switch (campaign.status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-secondary" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-primary" />;
    }
  };

  const getStatusBadge = () => {
    switch (campaign.status) {
      case "completed":
        return <Badge className="bg-secondary text-secondary-foreground">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return daysLeft > 0 ? (
          <Badge variant="outline">{daysLeft} days left</Badge>
        ) : (
          <Badge variant="destructive">Expired</Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl md:text-3xl mb-2">
                        {campaign.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon()}
                        {getStatusBadge()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center space-x-1 text-primary mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-2xl font-bold">
                            ${campaign.amountRaised.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Raised</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center space-x-1 text-primary mb-1">
                          <Target className="w-4 h-4" />
                          <span className="text-2xl font-bold">
                            ${campaign.target.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Goal</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center space-x-1 text-primary mb-1">
                          <Users className="w-4 h-4" />
                          <span className="text-2xl font-bold">
                            {campaign.donorCount || 0}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Donors</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Campaign Details</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {campaign.description}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Deadline: {new Date(campaign.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Wallet className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono">
                          Receiver: {campaign.receiver.slice(0, 6)}...{campaign.receiver.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Donation History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Donations</CardTitle>
                </CardHeader>
                <CardContent>
                  {donations.length > 0 ? (
                    <div className="space-y-3">
                      {donations.slice(0, 10).map((donation) => (
                        <div key={donation.id} className="flex justify-between items-center py-2">
                          <div>
                            <span className="font-mono text-sm text-muted-foreground">
                              {donation.donor}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {new Date(donation.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-secondary">
                              ${donation.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No donations yet. Be the first to contribute!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Donation Form */}
              {campaign.status === "active" && daysLeft > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Make a Donation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDonate} className="space-y-4">
                      <div>
                        <Label htmlFor="amount">Amount (USD)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          min="1"
                          step="0.01"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full btn-hero"
                        disabled={donationLoading || !isAuthenticated}
                      >
                        {donationLoading ? "Processing..." : "Donate Now"}
                      </Button>
                      {!isAuthenticated && (
                        <p className="text-xs text-muted-foreground text-center">
                          Please log in to make a donation
                        </p>
                      )}
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Campaign Actions */}
              {isAuthenticated && (
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isOwner && campaign.status === "completed" && (
                      <Button 
                        onClick={handleWithdraw}
                        disabled={actionLoading}
                        className="w-full"
                        variant="default"
                      >
                        {actionLoading ? "Processing..." : "Withdraw Funds"}
                      </Button>
                    )}
                    
                    {!isOwner && campaign.status === "failed" && (
                      <Button 
                        onClick={handleRefund}
                        disabled={actionLoading}
                        className="w-full"
                        variant="outline"
                      >
                        {actionLoading ? "Processing..." : "Claim Refund"}
                      </Button>
                    )}
                    
                    {campaign.status === "active" && daysLeft <= 0 && (
                      <p className="text-sm text-muted-foreground text-center">
                        This campaign has expired. Actions will be available once the final status is determined.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CampaignDetail;