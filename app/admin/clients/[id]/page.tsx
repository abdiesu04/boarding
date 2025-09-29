
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import toast from "react-hot-toast";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

export default function AdminClientDetailPage() {
  const { user: authUser, loading } = useAuth(["ADMIN", "SUPER_ADMIN"]);
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;

  const [client, setClient] = useState<any>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch client data
  useEffect(() => {
    if (loading || !clientId) return;

    const fetchClient = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/admin/clients/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setError(`Failed to fetch client: ${res.status}`);
          return;
        }

        const data = await res.json();
        setClient(data.client || null);
      } catch (err) {
        console.error(err);
        setError("Unexpected error fetching client");
      }
    };

    fetchClient();
  }, [loading, clientId]);

  // Handle approve/reject
  const decide = async (decision: "APPROVED" | "REJECTED") => {
    try {
      decision === "APPROVED" ? setApproving(true) : setRejecting(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/admin/clients/${clientId}/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ decision }),
      });

      if (res.ok) {
        setClient((prev: any) => ({ ...prev, fundingStatus: decision }));
        toast.success("The client has been notified successfully.");
      } else {
        toast.error("Could not update client decision.");
      }
    } finally {
      setApproving(false);
      setRejecting(false);
    }
  };
  // const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  // const defaultLayoutPluginInstance = defaultLayoutPlugin();
  
  const handleViewDocument = async (cloudinaryUrl: string) => {
   
  };
  
  // Loading or error states
  if (loading || !client) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-4">
            <div className="h-6 w-40 bg-gray-100 rounded animate-pulse" />
            <div className="h-48 bg-gray-100 rounded animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="sm:max-w-6xl max-w-3xl mx-auto sm:px-4 px-2 sm:py-8 py-4">
      {/* Back button */}
    

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Client info and documents */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" /> Client
                Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  label="Name"
                  value={`${client.user?.firstName ?? ""} ${
                    client.user?.lastName ?? ""
                  }`}
                  icon={<User className="h-3 w-3" />}
                />
                <DetailItem
                  label="Email"
                  value={client.user?.email ?? "—"}
                  icon={<Mail className="h-3 w-3" />}
                />
                <DetailItem
                  label="Phone"
                  value={client.phone ?? "—"}
                  icon={<Phone className="h-3 w-3" />}
                />
                <DetailItem
                  label="DOB"
                  value={
                    client.dob
                      ? new Date(client.dob).toLocaleDateString()
                      : "—"
                  }
                  icon={<Calendar className="h-3 w-3" />}
                />
                <DetailItem
                  label="Requested Amount"
                  value={client.loanAmount ?? "—"}
                  icon={<DollarSign className="h-3 w-3" />}
                />
                <DetailItem
                  label="Monthly Income"
                  value={client.monthlyIncome ?? "—"}
                  icon={<DollarSign className="h-3 w-3" />}
                />
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" /> Address
                  </div>
                  <p className="font-medium text-gray-900">
                    {client.address
                      ? `${client.address}, ${client.city ?? ""}, ${
                          client.state ?? ""
                        } ${client.zip ?? ""}`
                      : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-500">Funding Status</div>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium transition ${
                      client.fundingStatus === "APPROVED"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : client.fundingStatus === "REJECTED"
                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                        : client.fundingStatus === "FUNDED"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    }`}
                  >
                    {client.fundingStatus ?? "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" /> Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
  <div className="space-y-3">
    {client.documents?.length > 0 ? (
      <>
        {client.documents.map((doc: any) => (
          <Button
            key={doc.id}
            variant="outline"
            className="w-full justify-start hover:bg-gray-100"
            size="sm"
            onClick={() => handleViewDocument(doc.cloudinaryUrl)}
          >
            <FileText className="h-4 w-4 mr-2 text-blue-600" />
            {doc.fileName}
          </Button>
        ))}

        {/* {selectedDoc && (
          <div className="mt-4 h-[600px] border rounded">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer fileUrl={selectedDoc} plugins={[defaultLayoutPluginInstance]} />
            </Worker>
          </div>
        )} */}
      </>
    ) : (
      <div className="text-sm text-gray-500">No documents uploaded</div>
    )}
  </div>
</CardContent>

          </Card>
        </div>

        {/* Right: Decision actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Decision</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                  disabled={approving || rejecting}
                  onClick={() => decide("APPROVED")}
                >
                  {approving ? "Saving..." : "Approve"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full hover:bg-red-50"
                  disabled={approving || rejecting}
                  onClick={() => decide("REJECTED")}
                >
                  {rejecting ? "Saving..." : "Reject"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Client will be notified by email automatically.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper component for client details
const DetailItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
    <div className="flex items-center gap-2 text-xs text-gray-500">
      {icon} {label}
    </div>
    <p className="font-medium text-gray-900 mt-1 break-words">{value}</p>
  </div>
);
