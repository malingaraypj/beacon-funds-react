import { motion } from "framer-motion";
import { Calendar, DollarSign, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

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

interface CampaignCardProps {
  campaign: Campaign;
  index?: number;
}

const CampaignCard = ({ campaign, index = 0 }: CampaignCardProps) => {
  const progress = (campaign.amountRaised / campaign.target) * 100;
  const daysLeft = Math.ceil(
    (new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
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
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="campaign-card group"
    >
      <Card className="h-full flex flex-col overflow-hidden border-0 shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {campaign.title}
            </h3>
            {getStatusBadge()}
          </div>
          <p className="text-muted-foreground text-sm line-clamp-3">
            {campaign.description}
          </p>
        </CardHeader>

        <CardContent className="flex-1 pb-4">
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress.toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-semibold">${campaign.amountRaised.toLocaleString()}</p>
                  <p className="text-muted-foreground">raised of ${campaign.target.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-semibold">{campaign.donorCount || 0}</p>
                  <p className="text-muted-foreground">donors</p>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Ends {new Date(campaign.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Button asChild className="w-full" variant="default">
            <Link to={`/campaign/${campaign.id}`}>
              View Campaign
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CampaignCard;