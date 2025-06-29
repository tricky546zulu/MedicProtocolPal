import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMedicationSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Medication, InsertMedication } from "@shared/schema";

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editMedication?: Medication | null;
}

export function AddMedicationModal({ isOpen, onClose, editMedication }: AddMedicationModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertMedication>({
    resolver: zodResolver(insertMedicationSchema),
    defaultValues: {
      name: "",
      classification: "",
      alertLevel: "STANDARD",
      category: undefined,
      indications: "",
      contraindications: "",
      adultDosage: "",
      pediatricDosage: "",
      routeOfAdministration: "",
      onsetDuration: "",
      specialConsiderations: "",
      sideEffects: "",
      createdBy: user?.id,
    },
  });

  // Update form when editing
  useEffect(() => {
    if (editMedication) {
      form.reset({
        name: editMedication.name,
        classification: editMedication.classification,
        alertLevel: editMedication.alertLevel as "HIGH_ALERT" | "ELDER_ALERT" | "STANDARD",
        category: editMedication.category as "analgesics" | "cardiac" | "respiratory" | "neurological" | "endocrine" | undefined,
        indications: editMedication.indications,
        contraindications: editMedication.contraindications,
        adultDosage: editMedication.adultDosage,
        pediatricDosage: editMedication.pediatricDosage || "",
        routeOfAdministration: editMedication.routeOfAdministration || "",
        onsetDuration: editMedication.onsetDuration || "",
        specialConsiderations: editMedication.specialConsiderations || "",
        sideEffects: editMedication.sideEffects || "",
        createdBy: user?.id,
      });
    } else {
      form.reset({
        name: "",
        classification: "",
        alertLevel: "STANDARD",
        category: undefined,
        indications: "",
        contraindications: "",
        adultDosage: "",
        pediatricDosage: "",
        routeOfAdministration: "",
        onsetDuration: "",
        specialConsiderations: "",
        sideEffects: "",
        createdBy: user?.id,
      });
    }
  }, [editMedication, form, user?.id]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertMedication) => {
      const url = editMedication ? `/api/medications/${editMedication.id}` : "/api/medications";
      const method = editMedication ? "PUT" : "POST";
      await apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      onClose();
      toast({
        title: editMedication ? "Medication updated" : "Medication added",
        description: `${form.getValues().name} has been successfully ${editMedication ? "updated" : "added"}.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${editMedication ? "update" : "add"} medication. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertMedication) => {
    createMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
        <CardHeader className="sticky top-0 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">
              {editMedication ? "Edit Medication" : "Add New Medication"}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drug Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., EPINEPHrine/Adrenalin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="classification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classification *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sympathomimetic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="alertLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Level *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Alert Level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="HIGH_ALERT">HIGH ALERT</SelectItem>
                          <SelectItem value="ELDER_ALERT">ELDER ALERT</SelectItem>
                          <SelectItem value="STANDARD">STANDARD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="analgesics">Analgesics</SelectItem>
                          <SelectItem value="cardiac">Cardiac</SelectItem>
                          <SelectItem value="respiratory">Respiratory</SelectItem>
                          <SelectItem value="neurological">Neurological</SelectItem>
                          <SelectItem value="endocrine">Endocrine</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Clinical Information */}
              <FormField
                control={form.control}
                name="indications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indications *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="List the medical conditions or situations where this medication is indicated..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contraindications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraindications *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="List conditions where this medication should not be used..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dosage Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Dosage Information</h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="adultDosage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adult Dosage *</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Standard adult dosing instructions..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pediatricDosage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pediatric Dosage</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Pediatric dosing instructions if applicable..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="routeOfAdministration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Route of Administration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., IV, IM, PO, Inhalation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="onsetDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Onset/Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Onset: 1-3 min, Duration: 10-20 min" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Special Considerations */}
              <FormField
                control={form.control}
                name="specialConsiderations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Considerations</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Special warnings, precautions, or elder care considerations..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Side Effects */}
              <FormField
                control={form.control}
                name="sideEffects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Common Side Effects</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="List common side effects..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending 
                    ? (editMedication ? "Updating..." : "Adding...") 
                    : (editMedication ? "Update Medication" : "Add Medication")
                  }
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
