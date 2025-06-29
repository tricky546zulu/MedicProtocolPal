import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Sidebar } from "@/components/Sidebar";
import { MedicationCard } from "@/components/MedicationCard";
import { AddMedicationModal } from "@/components/AddMedicationModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import type { Medication } from "@shared/schema";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editMedication, setEditMedication] = useState<Medication | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertLevel, setAlertLevel] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['/api/medications', { search: searchTerm, alertLevel, category }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (alertLevel && alertLevel !== 'all') params.append('alertLevel', alertLevel);
      if (category && category !== 'all') params.append('category', category);
      
      const response = await fetch(`/api/medications?${params}`);
      if (!response.ok) throw new Error('Failed to fetch medications');
      return response.json();
    },
  });

  const handleEditMedication = (medication: Medication) => {
    setEditMedication(medication);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditMedication(null);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader onMobileMenuToggle={handleMobileMenuToggle} />
      
      <div className="flex h-screen pt-16">
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          onMobileClose={handleMobileMenuClose}
        />

        <main className="flex-1 overflow-hidden bg-background">
          <div className="h-full flex flex-col">
            {/* Search and Actions Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Medication Database</h2>
                  <p className="text-gray-600 mt-1">Manage and access SHA EMS approved medications</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medication
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="mt-6 flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search medications, indications, or contraindications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={alertLevel} onValueChange={setAlertLevel}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Alert Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Alert Levels</SelectItem>
                      <SelectItem value="HIGH_ALERT">HIGH ALERT</SelectItem>
                      <SelectItem value="ELDER_ALERT">ELDER ALERT</SelectItem>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="analgesics">Analgesics</SelectItem>
                      <SelectItem value="cardiac">Cardiac</SelectItem>
                      <SelectItem value="respiratory">Respiratory</SelectItem>
                      <SelectItem value="neurological">Neurological</SelectItem>
                      <SelectItem value="endocrine">Endocrine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Medication List */}
            <div className="flex-1 overflow-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-gray-500">Loading medications...</div>
                </div>
              ) : medications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">No medications found</div>
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Medication
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {medications.map((medication: Medication) => (
                    <MedicationCard
                      key={medication.id}
                      medication={medication}
                      onEdit={handleEditMedication}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AddMedicationModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        editMedication={editMedication}
      />
    </div>
  );
}
