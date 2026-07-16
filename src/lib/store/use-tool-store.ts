"use client"

import { create } from "zustand"
import type { Tool, Favorite, RecentTool, ToolCategory } from "@/types"

interface ToolStore {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategory: ToolCategory | "all"
  setSelectedCategory: (category: ToolCategory | "all") => void
  favorites: string[]
  addFavorite: (toolId: string) => void
  removeFavorite: (toolId: string) => void
  isFavorite: (toolId: string) => boolean
  recentTools: string[]
  addRecent: (toolId: string) => void
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  isMobileSidebarOpen: boolean
  setMobileSidebarOpen: (open: boolean) => void
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
}

export const useToolStore = create<ToolStore>((set, get) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: "all",
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  favorites: [],
  addFavorite: (toolId) =>
    set((state) => ({
      favorites: state.favorites.includes(toolId)
        ? state.favorites
        : [...state.favorites, toolId],
    })),
  removeFavorite: (toolId) =>
    set((state) => ({
      favorites: state.favorites.filter((id) => id !== toolId),
    })),
  isFavorite: (toolId) => get().favorites.includes(toolId),
  recentTools: [],
  addRecent: (toolId) =>
    set((state) => ({
      recentTools: [
        toolId,
        ...state.recentTools.filter((id) => id !== toolId),
      ].slice(0, 10),
    })),
  isSidebarOpen: true,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isMobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  theme: "system",
  setTheme: (theme) => set({ theme }),
}))
