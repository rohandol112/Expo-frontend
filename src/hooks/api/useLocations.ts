import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  locationService,
  type CreateAreaPayload,
  type CreateDistrictPayload,
  type CreateStatePayload,
  type LocationListParams,
  type UpdateAreaPayload,
  type UpdateDistrictPayload,
  type UpdateStatePayload,
} from "@/services/location.service";

export const locationKeys = {
  all: ["locations"] as const,
  summary: () => [...locationKeys.all, "summary"] as const,
  states: (params?: LocationListParams) => [...locationKeys.all, "states", params] as const,
  state: (id: string) => [...locationKeys.all, "state", id] as const,
  districts: (params?: LocationListParams) => [...locationKeys.all, "districts", params] as const,
  district: (id: string) => [...locationKeys.all, "district", id] as const,
  areas: (params?: LocationListParams) => [...locationKeys.all, "areas", params] as const,
  area: (id: string) => [...locationKeys.all, "area", id] as const,
};

export function useLocationSummary() {
  return useQuery({ queryKey: locationKeys.summary(), queryFn: () => locationService.summary(), retry: false });
}

export function useStates(params?: LocationListParams) {
  return useQuery({ queryKey: locationKeys.states(params), queryFn: () => locationService.listStates(params), retry: false });
}

export function useStateItem(id: string, languageCode?: string) {
  return useQuery({ queryKey: locationKeys.state(id), queryFn: () => locationService.getState(id, languageCode), enabled: Boolean(id), retry: false });
}

export function useCreateState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStatePayload) => locationService.createState(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all }),
  });
}

export function useUpdateState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload, languageCode }: { id: string; payload: UpdateStatePayload; languageCode?: string }) =>
      locationService.updateState(id, payload, languageCode),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
      queryClient.invalidateQueries({ queryKey: locationKeys.state(variables.id) });
    },
  });
}

export function useUpdateStateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => locationService.updateStateStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all }),
  });
}

export function useDeleteState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locationService.deleteState(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all }),
  });
}

export function useDistricts(params?: LocationListParams) {
  return useQuery({ queryKey: locationKeys.districts(params), queryFn: () => locationService.listDistricts(params), retry: false });
}

export function useDistrict(id: string, languageCode?: string) {
  return useQuery({ queryKey: locationKeys.district(id), queryFn: () => locationService.getDistrict(id, languageCode), enabled: Boolean(id), retry: false });
}

export function useCreateDistrict() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDistrictPayload) => locationService.createDistrict(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all }),
  });
}

export function useUpdateDistrict() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload, languageCode }: { id: string; payload: UpdateDistrictPayload; languageCode?: string }) =>
      locationService.updateDistrict(id, payload, languageCode),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
      queryClient.invalidateQueries({ queryKey: locationKeys.district(variables.id) });
    },
  });
}

export function useUpdateDistrictStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => locationService.updateDistrictStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all }),
  });
}

export function useDeleteDistrict() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locationService.deleteDistrict(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all }),
  });
}

export function useAreas(params?: LocationListParams) {
  return useQuery({ queryKey: locationKeys.areas(params), queryFn: () => locationService.listAreas(params), retry: false });
}

export function useArea(id: string, languageCode?: string) {
  return useQuery({ queryKey: locationKeys.area(id), queryFn: () => locationService.getArea(id, languageCode), enabled: Boolean(id), retry: false });
}

export function useCreateArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAreaPayload) => locationService.createArea(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all }),
  });
}

export function useUpdateArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload, languageCode }: { id: string; payload: UpdateAreaPayload; languageCode?: string }) =>
      locationService.updateArea(id, payload, languageCode),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
      queryClient.invalidateQueries({ queryKey: locationKeys.area(variables.id) });
    },
  });
}

export function useUpdateAreaStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => locationService.updateAreaStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all }),
  });
}

export function useDeleteArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locationService.deleteArea(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all }),
  });
}
