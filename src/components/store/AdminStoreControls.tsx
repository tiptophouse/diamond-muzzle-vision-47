import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { API_BASE_URL } from '@/lib/api/config';
import { getAuthHeaders } from '@/lib/api/auth';

interface AdminStoreControlsProps {
  stockNumber: string;
  isVisible: boolean;
  onVisibilityChange: (isVisible: boolean) => void;
  onDelete: () => void;
}

export function AdminStoreControls() {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleVisibility = async (stockNumber: string) => {
    setIsToggling(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/toggle_store_visibility/${parseInt(stockNumber)}`, {
        method: 'POST',
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle visibility: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: "Visibility Toggled",
        description: result.message || "Visibility updated successfully.",
      });

    } catch (error: any) {
      console.error('Error toggling visibility:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to toggle visibility.",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async (stockNumber: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/delete_stone/${parseInt(stockNumber)}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete stone: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: "Stone Deleted",
        description: result.message || "Stone deleted successfully.",
      });

    } catch (error: any) {
      console.error('Error deleting stone:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete stone.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    handleToggleVisibility,
    handleDelete,
    isDeleting,
    isToggling
  };
}
