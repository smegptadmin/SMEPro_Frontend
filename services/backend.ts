// C:\Users\Chris Miguez\projects\SMEPro_Frontend\services\backend.ts

import api from "./api";
import { VaultItem, FlaggedPrompt, UserProfile } from "../types";

export const backend = {
  // --- Vault Items ---
  async fetchVaultItems(): Promise<VaultItem[]> {
    const res = await api.get("/vault/items");
    return res.data;
  },

  async saveVaultItems(itemsToSave: VaultItem[]): Promise<VaultItem[]> {
    const res = await api.post("/vault/items", itemsToSave);
    return res.data;
  },

  async saveVaultItem(item: VaultItem): Promise<VaultItem> {
    const res = await api.post("/vault/item", item);
    return res.data;
  },

  async deleteVaultItem(itemId: string): Promise<void> {
    await api.delete(`/vault/item/${itemId}`);
  },

  async deleteVaultItemsByOrigin(origin: string): Promise<void> {
    await api.delete(`/vault/items?origin=${encodeURIComponent(origin)}`);
  },

  // --- Categories ---
  async fetchCategories(): Promise<string[]> {
    const res = await api.get("/vault/categories");
    return res.data;
  },

  async saveCategories(categories: string[]): Promise<string[]> {
    const res = await api.post("/vault/categories", categories);
    return res.data;
  },

  // --- AI Safety ---
  async fetchSafetyKeywords(): Promise<string[]> {
    const res = await api.get("/safety/keywords");
    return res.data;
  },

  async saveSafetyKeywords(keywords: string[]): Promise<string[]> {
    const res = await api.post("/safety/keywords", keywords);
    return res.data;
  },

  async fetchFlaggedPrompts(): Promise<FlaggedPrompt[]> {
    const res = await api.get("/safety/flagged-prompts");
    return res.data;
  },

  async logFlaggedPrompt(promptData: FlaggedPrompt): Promise<FlaggedPrompt> {
    const res = await api.post("/safety/flagged-prompts", promptData);
    return res.data;
  },

  // --- User Profile ---
  async fetchUserProfile(): Promise<UserProfile | null> {
    const res = await api.get("/user/profile");
    return res.data;
  },

  async saveUserProfile(profile: UserProfile): Promise<UserProfile> {
    const res = await api.post("/user/profile", profile);
    return res.data;
  },
};
