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

// Campaign endpoints
export const campaignAPI = {
  getCampaigns: () => API.get("/campaigns"),
  
  getCampaign: (id: string) => API.get(`/campaigns/${id}`),
  
  createCampaign: (formData: {
    title: string;
    description: string;
    target: number;
    deadline: string;
    receiver: string;
  }) => API.post("/campaigns", formData),
  
  donate: (id: string, amount: number) =>
    API.post(`/campaigns/${id}/donate`, { amount }),
  
  withdraw: (id: string) => API.post(`/campaigns/${id}/withdraw`),
  
  refund: (id: string) => API.post(`/campaigns/${id}/refund`),
  
  getDonations: (id: string) => API.get(`/campaigns/${id}/donations`),
};

export default API;