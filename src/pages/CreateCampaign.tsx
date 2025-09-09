import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarIcon, DollarSign, Target, FileText, User, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { campaignAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CreateCampaign = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target: "",
    deadline: undefined as Date | undefined,
    receiver: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to create a campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate("/login")} className="w-full">
              Login
            </Button>
            <Button onClick={() => navigate("/register")} variant="outline" className="w-full">
              Create Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Campaign title is required";
    } else if (formData.title.length < 10) {
      newErrors.title = "Title must be at least 10 characters";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Campaign description is required";
    } else if (formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    } else if (formData.description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
    }

    const targetAmount = parseFloat(formData.target);
    if (!formData.target) {
      newErrors.target = "Target amount is required";
    } else if (isNaN(targetAmount) || targetAmount <= 0) {
      newErrors.target = "Please enter a valid target amount";
    } else if (targetAmount < 100) {
      newErrors.target = "Minimum target amount is $100";
    } else if (targetAmount > 1000000) {
      newErrors.target = "Maximum target amount is $1,000,000";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Campaign deadline is required";
    } else {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      
      if (selectedDate <= today) {
        newErrors.deadline = "Deadline must be in the future";
      } else if (selectedDate > maxDate) {
        newErrors.deadline = "Deadline cannot be more than 1 year from now";
      }
    }

    if (!formData.receiver.trim()) {
      newErrors.receiver = "Receiver wallet address is required";
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.receiver)) {
      newErrors.receiver = "Please enter a valid Ethereum wallet address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const campaignData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        target: parseFloat(formData.target),
        deadline: formData.deadline!.toISOString(),
        receiver: formData.receiver.trim(),
      };

      const response = await campaignAPI.createCampaign(campaignData);
      
      toast({
        title: "Campaign created successfully!",
        description: "Your campaign is now live and accepting donations.",
      });
      
      // Navigate to the new campaign page
      navigate(`/campaign/${response.data.id}`);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Failed to create campaign",
        description: error.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, deadline: date }));
    if (errors.deadline) {
      setErrors(prev => ({ ...prev, deadline: "" }));
    }
  };

  // Pre-fill receiver with user's wallet address
  const handleUseMyWallet = () => {
    if (user?.walletAddress) {
      setFormData(prev => ({ ...prev, receiver: user.walletAddress }));
      if (errors.receiver) {
        setErrors(prev => ({ ...prev, receiver: "" }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
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

          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mb-4"
              >
                <Target className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <CardTitle className="text-3xl font-bold">Create Your Campaign</CardTitle>
              <CardDescription className="text-lg">
                Start raising funds for your cause with complete transparency
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="form-label">
                    Campaign Title *
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="Enter a compelling campaign title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`form-input pl-10 ${errors.title ? "border-destructive" : ""}`}
                      maxLength={100}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {errors.title && <span className="text-destructive">{errors.title}</span>}
                    <span className="ml-auto">{formData.title.length}/100</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="form-label">
                    Campaign Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your campaign, its goals, and how donations will be used. Be detailed and transparent to build trust with potential donors."
                    value={formData.description}
                    onChange={handleChange}
                    className={`form-input min-h-32 resize-y ${errors.description ? "border-destructive" : ""}`}
                    maxLength={2000}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {errors.description && <span className="text-destructive">{errors.description}</span>}
                    <span className="ml-auto">{formData.description.length}/2000</span>
                  </div>
                </div>

                {/* Target Amount */}
                <div className="space-y-2">
                  <Label htmlFor="target" className="form-label">
                    Target Amount (USD) *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="target"
                      name="target"
                      type="number"
                      placeholder="Enter target amount"
                      value={formData.target}
                      onChange={handleChange}
                      className={`form-input pl-10 ${errors.target ? "border-destructive" : ""}`}
                      min="100"
                      max="1000000"
                      step="0.01"
                    />
                  </div>
                  {errors.target && (
                    <p className="text-sm text-destructive">{errors.target}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Minimum: $100 • Maximum: $1,000,000
                  </p>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <Label className="form-label">
                    Campaign Deadline *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal form-input",
                          !formData.deadline && "text-muted-foreground",
                          errors.deadline && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.deadline ? (
                          format(formData.deadline, "PPP")
                        ) : (
                          <span>Select campaign deadline</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.deadline}
                        onSelect={handleDateChange}
                        disabled={(date) => {
                          const today = new Date();
                          const maxDate = new Date();
                          maxDate.setFullYear(maxDate.getFullYear() + 1);
                          return date <= today || date > maxDate;
                        }}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.deadline && (
                    <p className="text-sm text-destructive">{errors.deadline}</p>
                  )}
                </div>

                {/* Receiver Wallet */}
                <div className="space-y-2">
                  <Label htmlFor="receiver" className="form-label">
                    Receiver Wallet Address *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="receiver"
                      name="receiver"
                      type="text"
                      placeholder="0x..."
                      value={formData.receiver}
                      onChange={handleChange}
                      className={`form-input pl-10 pr-24 font-mono text-sm ${errors.receiver ? "border-destructive" : ""}`}
                    />
                    <Button
                      type="button"
                      onClick={handleUseMyWallet}
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs"
                    >
                      Use Mine
                    </Button>
                  </div>
                  {errors.receiver && (
                    <p className="text-sm text-destructive">{errors.receiver}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This wallet will receive the funds when the campaign is successful
                  </p>
                </div>

                {/* Terms and Info */}
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <h4 className="font-semibold text-foreground mb-2">Important Information:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>All donations are publicly visible on the blockchain</li>
                    <li>Funds can only be withdrawn if the campaign reaches its goal</li>
                    <li>If the campaign fails, donors can claim refunds</li>
                    <li>Campaign details cannot be modified after creation</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full btn-hero" 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? "Creating Campaign..." : "Create Campaign"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateCampaign;