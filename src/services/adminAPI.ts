// Mock admin API - replace with real backend calls
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

const mockCampaigns: AdminCampaign[] = [
  {
    id: "1",
    title: "Help Build Clean Water Wells in Rural Communities",
    description: "Providing access to clean water for families in underserved areas. Your donation helps build sustainable water infrastructure.",
    target: 50000,
    amountRaised: 32500,
    deadline: "2024-12-31",
    receiver: "0x1234567890123456789012345678901234567890",
    creator: "0x9876543210987654321098765432109876543210",
    status: "active",
    adminStatus: "approved",
    createdAt: "2024-01-15T10:00:00Z",
    donorCount: 127
  },
  {
    id: "2",
    title: "Emergency Relief for Natural Disaster Victims",
    description: "Supporting families affected by recent flooding with emergency supplies, shelter, and medical care.",
    target: 25000,
    amountRaised: 18750,
    deadline: "2024-11-15",
    receiver: "0x2345678901234567890123456789012345678901",
    creator: "0x8765432109876543210987654321098765432109",
    status: "active",
    adminStatus: "approved",
    createdAt: "2024-01-20T14:30:00Z",
    donorCount: 89
  },
  {
    id: "3",
    title: "Educational Scholarships for Underprivileged Students",
    description: "Empowering young minds through education by providing scholarships and school supplies to children in need.",
    target: 75000,
    amountRaised: 0,
    deadline: "2024-12-01",
    receiver: "0x3456789012345678901234567890123456789012",
    creator: "0x7654321098765432109876543210987654321098",
    status: "pending",
    adminStatus: "pending",
    createdAt: "2024-01-25T09:15:00Z",
    donorCount: 0
  },
  {
    id: "4",
    title: "Support Local Animal Shelter Operations",
    description: "Help us maintain our animal shelter and provide care for abandoned pets until they find loving homes.",
    target: 15000,
    amountRaised: 0,
    deadline: "2024-11-30",
    receiver: "0x4567890123456789012345678901234567890123",
    creator: "0x6543210987654321098765432109876543210987",
    status: "pending",
    adminStatus: "pending",
    createdAt: "2024-01-28T16:45:00Z",
    donorCount: 0
  },
  {
    id: "5",
    title: "Suspicious Campaign with Vague Description",
    description: "Need money for urgent situation. Will use funds for important things. Trust me.",
    target: 100000,
    amountRaised: 0,
    deadline: "2024-10-15",
    receiver: "0x5678901234567890123456789012345678901234",
    creator: "0x5432109876543210987654321098765432109876",
    status: "blocked",
    adminStatus: "blocked",
    createdAt: "2024-01-30T11:20:00Z",
    donorCount: 0
  }
];

export const adminAPI = {
  getAllCampaigns: async (): Promise<{ data: AdminCampaign[] }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: [...mockCampaigns] };
  },

  approveCampaign: async (id: string): Promise<{ data: AdminCampaign }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const campaign = mockCampaigns.find(c => c.id === id);
    if (campaign) {
      campaign.adminStatus = "approved";
      campaign.status = "active";
      return { data: campaign };
    }
    throw new Error("Campaign not found");
  },

  blockCampaign: async (id: string, reason?: string): Promise<{ data: AdminCampaign }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const campaign = mockCampaigns.find(c => c.id === id);
    if (campaign) {
      campaign.adminStatus = "blocked";
      campaign.status = "blocked";
      return { data: campaign };
    }
    throw new Error("Campaign not found");
  },

  getAdminStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const totalCampaigns = mockCampaigns.length;
    const pendingCampaigns = mockCampaigns.filter(c => c.adminStatus === "pending").length;
    const approvedCampaigns = mockCampaigns.filter(c => c.adminStatus === "approved").length;
    const blockedCampaigns = mockCampaigns.filter(c => c.adminStatus === "blocked").length;
    const totalRaised = mockCampaigns.reduce((sum, c) => sum + c.amountRaised, 0);

    return {
      data: {
        totalCampaigns,
        pendingCampaigns,
        approvedCampaigns,
        blockedCampaigns,
        totalRaised
      }
    };
  }
};