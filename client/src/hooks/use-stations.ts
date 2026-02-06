import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertStation } from "@shared/schema";

export function useStations() {
  return useQuery({
    queryKey: [api.stations.list.path],
    queryFn: async () => {
      const res = await fetch(api.stations.list.path);
      if (!res.ok) throw new Error("Failed to fetch stations");
      return api.stations.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertStation) => {
      const res = await fetch(api.stations.create.path, {
        method: api.stations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create station");
      return api.stations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.stations.list.path] });
    },
  });
}
