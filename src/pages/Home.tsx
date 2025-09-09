import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CampaignCard from "@/components/CampaignCard";
import { campaignAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
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
}

const Home = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignAPI.getCampaigns();
      setCampaigns(response.data);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      // For demo purposes, show mock data if API fails
      const mockCampaigns: Campaign[] = [
        {
          id: "1",
          title: "Help Build Clean Water Wells in Rural Communities",
          description: "Providing access to clean water for families in underserved areas. Your donation helps build sustainable water infrastructure.",
          target: 50000,
          amountRaised: 32500,
          deadline: "2024-12-31",
          receiver: "0x1234...5678",
          status: "active",
          donorCount: 127
        },
        {
          id: "2",
          title: "Emergency Relief for Natural Disaster Victims",
          description: "Supporting families affected by recent flooding with emergency supplies, shelter, and medical care.",
          target: 25000,
          amountRaised: 18750,
          deadline: "2024-11-15",
          receiver: "0x9876...5432",
          status: "active",
          donorCount: 89
        },
        {
          id: "3",
          title: "Educational Scholarships for Underprivileged Students",
          description: "Empowering young minds through education by providing scholarships and school supplies to children in need.",
          target: 75000,
          amountRaised: 75000,
          deadline: "2024-10-01",
          receiver: "0xabcd...ef12",
          status: "completed",
          donorCount: 234
        }
      ];
      setCampaigns(mockCampaigns);
      toast({
        title: "Demo Mode",
        description: "Showing sample campaigns. Connect to backend for live data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || campaign.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
        <div className="container mx-auto px-4 py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Empowering Change, One Donation at a Time
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our blockchain-powered charity platform where transparency meets generosity. 
              Every donation is tracked, every impact is verified.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button asChild className="btn-hero">
                  <Link to="/create">
                    <Plus className="w-5 h-5 mr-2" />
                    Start a Campaign
                  </Link>
                </Button>
              ) : (
                <Button asChild className="btn-hero">
                  <Link to="/register">
                    Get Started
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="lg" className="px-8">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Active Campaigns</h2>
              <p className="text-muted-foreground">
                Discover causes that need your support
              </p>
            </div>
            
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
                  <SelectItem value="all">All Campaigns</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="campaign-card">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-3 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-6"></div>
                    <div className="h-2 bg-muted rounded mb-4"></div>
                    <div className="flex justify-between mb-4">
                      <div className="h-3 bg-muted rounded w-20"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign, index) => (
                <CampaignCard 
                  key={campaign.id} 
                  campaign={campaign} 
                  index={index}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}>
                Clear Filters
              </Button>
            </motion.div>
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default Home;