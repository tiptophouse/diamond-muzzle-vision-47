/**
 * Stone management service for CRUD operations
 * Handles API calls with proper error handling and user feedback
 */

import { supabase } from "@/integrations/supabase/client";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast-success";

const API_BASE_URL = process.env.VITE_API_URL || 'https://api.mazalbot.com';

export interface StoneData {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  imageUrl?: string;
  gem360Url?: string;
  certificateUrl?: string;
  lab?: string;
  certificateNumber?: string;
}

export class StoneManager {
  /**
   * Delete a stone by diamond_id using the correct FastAPI endpoint
   */
  static async deleteStone(diamondId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting stone:', diamondId);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/delete_stone/${diamondId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete stone: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Stone deleted successfully:', result);
      
      showSuccessToast({
        title: "Stone Deleted",
        description: `Stone ${diamondId} has been successfully removed`
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to delete stone:', error);
      
      showErrorToast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete stone. Please try again."
      });
      
      return false;
    }
  }

  /**
   * Add individual stone using the correct FastAPI endpoint
   */
  static async addStone(stoneData: StoneData): Promise<boolean> {
    try {
      console.log('➕ Adding new stone:', stoneData.stockNumber);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/diamonds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock_number: stoneData.stockNumber,
          shape: stoneData.shape,
          carat: stoneData.carat,
          color: stoneData.color,
          clarity: stoneData.clarity,
          cut: stoneData.cut,
          price: stoneData.price,
          picture: stoneData.imageUrl,
          gem360_url: stoneData.gem360Url,
          certificate_url: stoneData.certificateUrl,
          lab: stoneData.lab,
          certificate_number: stoneData.certificateNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add stone: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Stone added successfully:', result);
      
      showSuccessToast({
        title: "Stone Added",
        description: `Stone ${stoneData.stockNumber} has been successfully added to inventory`
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to add stone:', error);
      
      showErrorToast({
        title: "Add Failed", 
        description: error instanceof Error ? error.message : "Failed to add stone. Please try again."
      });
      
      return false;
    }
  }

  /**
   * Update stone using the correct FastAPI endpoint
   */
  static async updateStone(diamondId: string, stoneData: Partial<StoneData>): Promise<boolean> {
    try {
      console.log('✏️ Updating stone:', diamondId);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/diamonds/${diamondId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock_number: stoneData.stockNumber,
          shape: stoneData.shape,
          carat: stoneData.carat,
          color: stoneData.color,
          clarity: stoneData.clarity,
          cut: stoneData.cut,
          price: stoneData.price,
          picture: stoneData.imageUrl,
          gem360_url: stoneData.gem360Url,
          certificate_url: stoneData.certificateUrl,
          lab: stoneData.lab,
          certificate_number: stoneData.certificateNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update stone: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Stone updated successfully:', result);
      
      showSuccessToast({
        title: "Stone Updated",
        description: `Stone ${diamondId} has been successfully updated`
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to update stone:', error);
      
      showErrorToast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update stone. Please try again."
      });
      
      return false;
    }
  }
}