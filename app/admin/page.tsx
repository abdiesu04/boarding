
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  DollarSign,
  LogOut,
  Settings,
  Shield,
  Clock,
  Home,
  Search,
} from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define interfaces
interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ClientData {
  id: string;
  user: UserData;
  phone?: string;
  fundingStatus: "PENDING" | "APPROVED" | "REJECTED";
}

interface DocumentData {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export default function AdminDashboardPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // ---- SESSION HANDLING & DATA FETCHING ----
  useEffect(() => {
    setMounted(true);

    const savedSidebar = localStorage.getItem("sidebarExpanded");
    if (savedSidebar !== null) {
      setSidebarExpanded(savedSidebar === "true");
    }

    const token = localStorage.getItem("token");
    const isAuthenticated = sessionStorage.getItem("userAuthenticated");
    const lastActivity = sessionStorage.getItem("lastActivity");
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min

    const isSessionValid =
      isAuthenticated === "true" &&
      lastActivity &&
      Date.now() - parseInt(lastActivity) < SESSION_TIMEOUT;

    if (!token || !isSessionValid) {
      toast.error("Session expired. Please log in.");
      localStorage.removeItem("token");
      sessionStorage.clear();
      window.location.href = "/";
      return;
    }

    // Update last activity
    sessionStorage.setItem("lastActivity", Date.now().toString());

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [clientsRes, docsRes] = await Promise.all([
          fetch("/api/admin/clients", { headers }),
          fetch("/api/admin/documents", { headers }),
        ]);

        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.clients);
          // toast.success("Clients data loaded!");
        } else {
          toast.error("Failed to load clients data.");
        }

        if (docsRes.ok) {
          const data = await docsRes.json();
          setDocuments(data.documents);
          // toast.success("Documents data loaded!");
        } else {
          toast.error("Failed to load documents data.");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        toast.error("Error loading dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarExpanded", sidebarExpanded.toString());
  }, [sidebarExpanded]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  // Filtered clients
  const filteredClients = clients.filter((client) => {
    const fullName = `${client.user.firstName} ${client.user.lastName}`.toLowerCase();
    const email = client.user.email.toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = fullName.includes(query) || email.includes(query);
    const matchesStatus =
      statusFilter === "ALL" || client.fundingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );



  // Loading state
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          className="animate-pulse flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-blue-500/20 rounded-full mb-4 shadow-lg animate-pulse-glow"></div>
          <div className="h-5 w-48 bg-blue-500/10 rounded-md mb-3"></div>
          <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
  
        <main className="flex-1 sm:p-6 overflow-auto bg-gray-50/50 lg:ml-0">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 mt-10 lg:mt-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, Admin!</h2>
              <p className="text-gray-600">Here's an overview of your clients and documents.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 sm:gap-5 gap-2"
            >
              <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex justify-between items-center">
                  <div> 
                    <p className="text-sm font-medium text-gray-500">Total Clients</p>
                    <h3 className="text-2xl font-bold text-gray-900">{clients.length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Documents</p>
                    <h3 className="text-2xl font-bold text-gray-900">{documents.length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {clients.filter((c) => c.fundingStatus === "PENDING").length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Funded Clients</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {clients.filter((c) => c.fundingStatus === "APPROVED").length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clients Table */}
            <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-8">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:p-6 p-2 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">Client Applications</CardTitle>
                <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
  {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
    <motion.button
      key={status}
      onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
      className={` rounded-lg text-xs sm:text-sm font-medium transition-all text-center whitespace-normal break-words
        ${statusFilter === status
          ? "bg-primary text-primary-foreground shadow-md"
          : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
        }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {status === "ALL" ? "All Clients" : status.charAt(0) + status.slice(1).toLowerCase()}
      <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs opacity-75 block sm:inline">
        ({status === "ALL" ? clients.length : clients.filter(c => c.fundingStatus === status).length})
      </span>
    </motion.button>
  ))}
</div>


                  <div className="relative w-full sm:w-64">
                    <Input
                      placeholder="Search clients..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="pl-9 pr-4 py-2 w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="overflow-x-auto">
              <div className="overflow-auto rounded-lg shadow">

                <table className="w-full border-collapse min-w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="py-3 px-4 text-sm font-medium whitespace-nowrap text-gray-500">Name</th>
                      <th className="py-3 px-4 text-sm font-medium whitespace-nowrap text-gray-500 hidden md:table-cell">Email</th>
                      <th className="py-3 px-4 text-sm font-medium whitespace-nowrap text-gray-500 hidden md:table-cell">Phone</th>
                      <th className="py-3 px-4 text-sm font-medium whitespace-nowrap text-gray-500">Status</th>
                      <th className="py-3 px-4 text-sm font-medium whitespace-nowrap text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-gray-500 text-sm">
                          No clients found.
                        </td>
                      </tr>
                    ) : (
                      paginatedClients.map((client) => (
                        <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-900 font-medium">{client.user.firstName} {client.user.lastName}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell">{client.user.email}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell">{client.phone || "N/A"}</td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              client.fundingStatus === "APPROVED" ? "bg-green-100 text-green-700" :
                              client.fundingStatus === "REJECTED" ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>
                              {client.fundingStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-right space-x-2">
                            <Link href={`/admin/clients/${client.id}`} passHref>
                              <Button size="sm" className="bg-amber-50">View</Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-end gap-2 mt-4">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="text-blue-400">Prev</button>
                    <span className="px-2 py-1 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="text-blue-400" >Next</button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

  );
}


