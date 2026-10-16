import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { capitalize, formatDate, formatDateTime } from "@/lib/format";
import { cleanParams, type ApiPage } from "@/services/adapters/rewards.adapter";
import type { GiftRequest, GiftRequestStatus } from "@/types/referrals";

interface ApiGiftRequest {
  id: number;
  user_id: number;
  name: string;
  user_name: string | null;
  phone: string;
  user_phone: string | null;
  state: string | null;
  district: string | null;
  area: string | null;
  location_title: string | null;
  win_type: "monthly" | "quiz";
  period_key: string;
  rank: number;
  gift_name: string;
  gift_value: number | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  delivered: boolean;
  requested_at: string;
  // detail only
  address?: string;
  dob?: string | null;
  pan_required?: boolean;
  pan_number?: string | null;
  pan_photo_url?: string | null;
  aadhaar_number?: string | null;
  aadhaar_photo_url?: string | null;
  message?: string | null;
  gift_photo_url?: string | null;
  delivery_photo_url?: string | null;
}

/** "Rank 2 · Sep 2026 · Smart Watch" / "Quiz gift · 15 Oct 2026 · Headphones" */
function winLabel(r: ApiGiftRequest): string {
  const period = r.win_type === "monthly" ? formatDate(`${r.period_key}-01`).slice(3) : formatDate(r.period_key);
  const what = r.win_type === "monthly" ? `Rank ${r.rank}` : `Quiz gift #${r.rank}`;
  return `${what} · ${period} · ${r.gift_name}`;
}

function toGiftRequest(r: ApiGiftRequest): GiftRequest {
  return {
    id: String(r.id),
    userId: String(r.user_id),
    name: r.name,
    phone: r.phone,
    state: r.state ?? "",
    district: r.district ?? "",
    area: r.area ?? "",
    locationTitle: r.location_title,
    winType: r.win_type,
    periodKey: r.period_key,
    rank: r.rank,
    giftName: r.gift_name,
    giftValue: r.gift_value,
    rankOrGift: winLabel(r),
    status: capitalize(r.status) as GiftRequestStatus,
    requestedAt: formatDateTime(r.requested_at),
    delivered: r.delivered,
    address: r.address ?? undefined,
    dob: r.dob ? formatDate(r.dob) : undefined,
    panRequired: r.pan_required,
    panNumber: r.pan_number ?? undefined,
    panPhoto: r.pan_photo_url ?? undefined,
    aadhaarNumber: r.aadhaar_number ?? undefined,
    aadhaarPhoto: r.aadhaar_photo_url ?? undefined,
    giftPhoto: r.gift_photo_url ?? undefined,
    deliveryPhoto: r.delivery_photo_url ?? undefined,
    message: r.message ?? undefined,
    rejectionReason: r.rejection_reason ?? undefined,
  };
}

export interface GiftRequestQuery {
  page: number;
  per_page: number;
  status?: "pending" | "approved" | "rejected";
  win_type?: "monthly" | "quiz";
  search?: string;
  from?: string;
  to?: string;
}

export const giftRequestService = {
  async list(query: GiftRequestQuery): Promise<{ items: GiftRequest[]; total: number }> {
    const data = await httpClient.get<ApiPage<ApiGiftRequest>>(API.rewards.giftRequests, { params: cleanParams({ ...query }) });
    return { items: data.items.map(toGiftRequest), total: data.total };
  },

  /** Request counts per status for the stat cards. */
  async counts(): Promise<Record<"total" | "pending" | "approved" | "rejected", number>> {
    const count = (status?: GiftRequestQuery["status"]) =>
      httpClient.get<ApiPage<ApiGiftRequest>>(API.rewards.giftRequests, { params: cleanParams({ page: 1, per_page: 1, status }) }).then((d) => d.total);
    const [total, pending, approved, rejected] = await Promise.all([count(), count("pending"), count("approved"), count("rejected")]);
    return { total, pending, approved, rejected };
  },

  async get(id: string): Promise<GiftRequest> {
    return toGiftRequest(await httpClient.get<ApiGiftRequest>(API.rewards.giftRequest(id)));
  },

  async approve(id: string): Promise<void> {
    await httpClient.post(API.rewards.giftRequestApprove(id));
  },

  async reject(id: string, reason?: string): Promise<void> {
    await httpClient.post(API.rewards.giftRequestReject(id), { reason: reason ?? null });
  },
};
