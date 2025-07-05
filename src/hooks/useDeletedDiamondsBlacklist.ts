
import { useState, useEffect } from 'react';

const BLACKLIST_KEY = 'deleted_diamonds_blacklist';

export function useDeletedDiamondsBlacklist() {
  const [blacklist, setBlacklist] = useState<Set<string>>(new Set());

  // Load blacklist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(BLACKLIST_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBlacklist(new Set(parsed));
      } catch (error) {
        console.error('Error loading blacklist:', error);
      }
    }
  }, []);

  // Save blacklist to localStorage
  const saveBlacklist = (newBlacklist: Set<string>) => {
    try {
      localStorage.setItem(BLACKLIST_KEY, JSON.stringify(Array.from(newBlacklist)));
    } catch (error) {
      console.error('Error saving blacklist:', error);
    }
  };

  const addToBlacklist = (diamondId: string) => {
    console.log('🚫 Adding diamond to blacklist:', diamondId);
    const newBlacklist = new Set(blacklist);
    newBlacklist.add(diamondId);
    setBlacklist(newBlacklist);
    saveBlacklist(newBlacklist);
  };

  const removeFromBlacklist = (diamondId: string) => {
    console.log('✅ Removing diamond from blacklist:', diamondId);
    const newBlacklist = new Set(blacklist);
    newBlacklist.delete(diamondId);
    setBlacklist(newBlacklist);
    saveBlacklist(newBlacklist);
  };

  const isBlacklisted = (diamondId: string) => {
    return blacklist.has(diamondId);
  };

  const clearBlacklist = () => {
    console.log('🧹 Clearing blacklist');
    setBlacklist(new Set());
    localStorage.removeItem(BLACKLIST_KEY);
  };

  return {
    addToBlacklist,
    removeFromBlacklist,
    isBlacklisted,
    clearBlacklist,
    blacklistedCount: blacklist.size
  };
}
