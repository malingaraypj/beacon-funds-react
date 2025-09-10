import axios from "axios";

const API = axios.create({ 
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
});

// Request interceptor to attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (formData: {
    username: string;
    email: string;
    password: string;
    walletAddress: string;
  }) => API.post("/auth/register", formData),
  
  login: (formData: { email: string; password: string }) =>
    API.post("/auth/login", formData),
  
  getProfile: () => API.get("/auth/profile"),
};

// Campaign endpoints - aligned with backend specification
export const campaignAPI = {
  // GET /api/campaigns - Fetch all campaigns
  getCampaigns: () => API.get("/campaigns"),
  
  // GET /api/campaigns/:id - Fetch single campaign with donation history
  getCampaign: (id: string) => API.get(`/campaigns/${id}`),
  
  // POST /api/campaigns - Create new campaign
  createCampaign: (formData: {
    title: string;
    description: string;
    target: number; // targetAmount in backend
    deadline: string;
    receiver: string; // receiver wallet address
  }) => API.post("/campaigns", formData),
  
  // POST /api/campaigns/:id/donate - Call smart contract donate() and store donor info
  donate: (id: string, amount: number) =>
    API.post(`/campaigns/${id}/donate`, { amount }),
  
  // POST /api/campaigns/:id/withdraw - Trigger smart contract withdrawFunds()
  withdraw: (id: string) => API.post(`/campaigns/${id}/withdraw`),
  
  // POST /api/campaigns/:id/refund - Trigger smart contract refund()
  refund: (id: string) => API.post(`/campaigns/${id}/refund`),
  
  // GET /api/campaigns/:id/donations - Get donation history (part of campaign details)
  getDonations: (id: string) => API.get(`/campaigns/${id}/donations`),
};

export default API;