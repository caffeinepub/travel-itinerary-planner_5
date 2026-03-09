import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateItemArgs,
  CreateTripArgs,
  ItineraryItem,
  Trip,
  UpdateTripArgs,
} from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ─── Trips ───────────────────────────────────────────────────

export function useTrips() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Trip[]>({
    queryKey: ["trips", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getTripsByOwner(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateTrip() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: CreateTripArgs) => {
      if (!actor) throw new Error("No actor");
      return actor.createTrip(args);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useUpdateTrip() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: UpdateTripArgs) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTrip(args);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useDeleteTrip() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTrip(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

// ─── Itinerary Items ─────────────────────────────────────────

export function useItineraryItems(tripId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ItineraryItem[]>({
    queryKey: ["items", tripId?.toString()],
    queryFn: async () => {
      if (!actor || tripId === null) return [];
      return actor.getItemsByTrip(tripId);
    },
    enabled: !!actor && !isFetching && tripId !== null,
  });
}

export function useAddItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: CreateItemArgs) => {
      if (!actor) throw new Error("No actor");
      return actor.addItem(args);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["items", variables.tripId.toString()],
      });
    },
  });
}

export function useUpdateItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      args,
      itemId,
    }: {
      args: CreateItemArgs;
      itemId: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateItem(args, itemId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["items", variables.args.tripId.toString()],
      });
    },
  });
}

export function useDeleteItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      tripId: _tripId,
    }: {
      id: bigint;
      tripId: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteItem(id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["items", variables.tripId.toString()],
      });
    },
  });
}
