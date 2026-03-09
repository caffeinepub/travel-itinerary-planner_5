import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Compass,
  Globe,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Trip } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateTrip,
  useDeleteTrip,
  useTrips,
  useUpdateTrip,
} from "../hooks/useQueries";
import TripFormDialog from "./TripFormDialog";

interface DashboardProps {
  onSelectTrip: (id: bigint) => void;
}

function formatDateRange(start: string, end: string) {
  const fmt = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  return `${fmt(start)} → ${fmt(end)}`;
}

function tripDuration(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const days =
    Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return `${days} day${days !== 1 ? "s" : ""}`;
}

export default function Dashboard({ onSelectTrip }: DashboardProps) {
  const { clear, identity } = useInternetIdentity();
  const { data: trips, isLoading, isError } = useTrips();

  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);

  const principal = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-3)}`
    : "";

  const handleSaveTrip = async (data: {
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    description: string;
  }) => {
    try {
      if (editingTrip) {
        await updateTrip.mutateAsync({ id: editingTrip.id, ...data });
        toast.success("Trip updated!");
      } else {
        await createTrip.mutateAsync(data);
        toast.success("Trip created!");
      }
      setFormOpen(false);
      setEditingTrip(null);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleDeleteTrip = async () => {
    if (deleteTarget === null) return;
    try {
      await deleteTrip.mutateAsync(deleteTarget);
      toast.success("Trip deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete trip.");
    }
  };

  const isSaving = createTrip.isPending || updateTrip.isPending;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground tracking-tight">
              Wanderlog
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-muted-foreground font-sans bg-secondary px-3 py-1.5 rounded-full">
              {shortPrincipal}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero area */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between gap-4 flex-wrap"
          >
            <div>
              <p className="text-primary font-sans text-sm font-medium tracking-widest uppercase mb-2">
                Your Journeys
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                Where to next?
              </h1>
            </div>
            <Button
              data-ocid="trip.add_button"
              size="lg"
              onClick={() => {
                setEditingTrip(null);
                setFormOpen(true);
              }}
              className="gap-2 rounded-full shadow-glow hover:shadow-glow transition-all"
            >
              <Plus className="h-5 w-5" />
              New Trip
            </Button>
          </motion.div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div
            data-ocid="trip.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-card border border-border p-6 space-y-4"
              >
                <Skeleton className="h-5 w-3/4 bg-secondary" />
                <Skeleton className="h-4 w-1/2 bg-secondary" />
                <Skeleton className="h-4 w-full bg-secondary" />
                <Skeleton className="h-4 w-2/3 bg-secondary" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div
            data-ocid="trip.error_state"
            className="text-center py-16 text-destructive"
          >
            <Globe className="h-10 w-10 mx-auto mb-4 opacity-50" />
            <p className="font-sans text-lg">Failed to load trips.</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && (!trips || trips.length === 0) && (
          <motion.div
            data-ocid="trip.empty_state"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <Globe className="h-8 w-8 text-primary opacity-80" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              No trips yet
            </h2>
            <p className="text-muted-foreground font-sans text-base mb-8 max-w-sm">
              Every great journey starts with a single plan. Create your first
              trip and start filling in the details.
            </p>
            <Button
              onClick={() => {
                setEditingTrip(null);
                setFormOpen(true);
              }}
              className="gap-2 rounded-full shadow-glow"
            >
              <Plus className="h-4 w-4" />
              Plan your first trip
            </Button>
          </motion.div>
        )}

        {/* Trip grid */}
        {!isLoading && !isError && trips && trips.length > 0 && (
          <div
            data-ocid="trip.list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {trips.map((trip, index) => (
                <motion.div
                  key={trip.id.toString()}
                  data-ocid={`trip.item.${index + 1}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="group relative rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-card transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => onSelectTrip(trip.id)}
                >
                  {/* Top gradient bar based on destination initial */}
                  <div
                    className="h-1.5 w-full"
                    style={{
                      background:
                        "linear-gradient(90deg, oklch(0.72 0.19 195), oklch(0.78 0.17 75))",
                    }}
                  />

                  <div className="p-5 pb-4">
                    {/* Duration pill */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-sans font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                        {tripDuration(trip.startDate, trip.endDate)}
                      </span>
                      {/* Action buttons - shown on hover */}
                      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation container, buttons inside are keyboard accessible */}
                      <div
                        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          data-ocid="trip.edit_button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTrip(trip);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          data-ocid="trip.delete_button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(trip.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <MapPin className="h-3.5 w-3.5 text-accent" />
                      <span className="text-xs font-sans font-medium text-accent">
                        {trip.destination}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="font-display text-lg font-semibold text-foreground leading-snug mb-3 line-clamp-2">
                      {trip.title}
                    </h2>

                    {/* Description */}
                    {trip.description && (
                      <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-4">
                        {trip.description}
                      </p>
                    )}

                    {/* Date range */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {formatDateRange(trip.startDate, trip.endDate)}
                      </span>
                    </div>
                  </div>

                  {/* Hover overlay hint */}
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-muted-foreground text-xs font-sans border-t border-border mt-10">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>

      {/* Trip Form Dialog */}
      <TripFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTrip(null);
        }}
        trip={editingTrip}
        onSave={handleSaveTrip}
        isSaving={isSaving}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">
              Delete this trip?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-sans">
              This will permanently delete the trip and all its itinerary items.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="trip.form.cancel_button"
              className="border-border hover:bg-secondary"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="trip.delete_button"
              onClick={handleDeleteTrip}
              disabled={deleteTrip.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteTrip.isPending ? "Deleting…" : "Delete Trip"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
