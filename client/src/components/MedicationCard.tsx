import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Medication } from "@shared/schema";

interface MedicationCardProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
}

export function MedicationCard({ medication, onEdit }: MedicationCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if medication is favorited
  const { data: favoriteData } = useQuery<{ isFavorite: boolean }>({
    queryKey: ['/api/favorites/check', { userId: user?.id, medicationId: medication.id }],
    enabled: !!user?.id,
  });

  const isFavorite = favoriteData?.isFavorite || false;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/medications/${medication.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      toast({
        title: "Medication deleted",
        description: "The medication has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete medication. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Favorite toggle mutation
  const favoriteToggleMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await apiRequest("DELETE", "/api/favorites", {
          userId: user?.id,
          medicationId: medication.id,
        });
      } else {
        await apiRequest("POST", "/api/favorites", {
          userId: user?.id,
          medicationId: medication.id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/check'] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/favorites`] });
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${medication.name} has been ${isFavorite ? "removed from" : "added to"} your favorites.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this medication?")) {
      deleteMutation.mutate();
    }
  };

  const handleFavoriteToggle = () => {
    if (!user?.id) return;
    favoriteToggleMutation.mutate();
  };

  const getAlertBadgeVariant = (alertLevel: string) => {
    switch (alertLevel) {
      case "HIGH_ALERT":
        return "destructive";
      case "ELDER_ALERT":
        return "default";
      case "STANDARD":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getAlertBadgeText = (alertLevel: string) => {
    switch (alertLevel) {
      case "HIGH_ALERT":
        return "HIGH ALERT";
      case "ELDER_ALERT":
        return "ELDER ALERT";
      case "STANDARD":
        return "STANDARD";
      default:
        return alertLevel;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
              <Badge 
                variant={getAlertBadgeVariant(medication.alertLevel)}
                className={
                  medication.alertLevel === "ELDER_ALERT" 
                    ? "bg-orange-500 text-white hover:bg-orange-600" 
                    : medication.alertLevel === "STANDARD"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : ""
                }
              >
                {getAlertBadgeText(medication.alertLevel)}
              </Badge>
            </div>
            <p className="text-gray-600 mb-3">{medication.classification}</p>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Indications</h4>
                <p className="text-gray-700">{medication.indications}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Contraindications</h4>
                <p className="text-gray-700">{medication.contraindications}</p>
              </div>
            </div>
            
            <div className={`mt-4 p-3 rounded-md ${
              medication.alertLevel === "ELDER_ALERT" 
                ? "bg-orange-50 border border-orange-200" 
                : "bg-gray-50"
            }`}>
              <h4 className="font-medium text-gray-900 mb-1">
                {medication.alertLevel === "ELDER_ALERT" ? "Elder Alert Considerations" : "Adult Dosage"}
              </h4>
              <p className="text-sm text-gray-700">
                {medication.alertLevel === "ELDER_ALERT" && medication.specialConsiderations
                  ? medication.specialConsiderations
                  : medication.adultDosage}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(medication)}
              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              disabled={favoriteToggleMutation.isPending || !user?.id}
              className={`p-2 transition-colors ${
                isFavorite
                  ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                  : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
              }`}
            >
              <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
