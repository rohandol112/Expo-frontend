import type { CompetitionLocation, ImportantLink, RewardsSettings } from "@/types/referrals";
import { rewardsSettings as seedSettings, competitionLocations as seedLocations, importantLinks as seedLinks } from "@/mock/rewardsSettings.mock";

let settings: RewardsSettings = { ...seedSettings };
let locations: CompetitionLocation[] = [...seedLocations];
let links: ImportantLink[] = [...seedLinks];
let nextLocationId = locations.length + 1;
let nextLinkId = links.length + 1;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export const rewardsSettingsService = {
  async get(): Promise<RewardsSettings> {
    return clone(settings);
  },

  async update(payload: Partial<RewardsSettings>): Promise<RewardsSettings> {
    settings = { ...settings, ...payload };
    return clone(settings);
  },

  async listLocations(): Promise<{ items: CompetitionLocation[]; total: number }> {
    return { items: clone(locations), total: locations.length };
  },

  async createLocation(payload: Omit<CompetitionLocation, "id">): Promise<CompetitionLocation> {
    const location: CompetitionLocation = { ...payload, id: `loc-${nextLocationId++}` };
    locations = [...locations, location];
    return clone(location);
  },

  async updateLocation(id: string, payload: Partial<Omit<CompetitionLocation, "id">>): Promise<CompetitionLocation | undefined> {
    locations = locations.map((l) => (l.id === id ? { ...l, ...payload } : l));
    return clone(locations.find((l) => l.id === id));
  },

  async removeLocation(id: string): Promise<void> {
    locations = locations.filter((l) => l.id !== id);
  },

  async listLinks(): Promise<{ items: ImportantLink[]; total: number }> {
    return { items: clone(links), total: links.length };
  },

  async createLink(payload: Omit<ImportantLink, "id">): Promise<ImportantLink> {
    const link: ImportantLink = { ...payload, id: `link-${nextLinkId++}` };
    links = [...links, link];
    return clone(link);
  },

  async updateLink(id: string, payload: Partial<Omit<ImportantLink, "id">>): Promise<ImportantLink | undefined> {
    links = links.map((l) => (l.id === id ? { ...l, ...payload } : l));
    return clone(links.find((l) => l.id === id));
  },

  async removeLink(id: string): Promise<void> {
    links = links.filter((l) => l.id !== id);
  },

  async getLink(id: string): Promise<ImportantLink | undefined> {
    return clone(links.find((l) => l.id === id));
  },

  async getLocation(id: string): Promise<CompetitionLocation | undefined> {
    return clone(locations.find((l) => l.id === id));
  },
};
