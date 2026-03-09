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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Compass,
  MapPin,
  Pencil,
  Plane,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ItineraryItem, Trip } from "../backend.d";
import {
  useAddItem,
  useDeleteItem,
  useDeleteTrip,
  useItineraryItems,
  useTrips,
  useUpdateItem,
  useUpdateTrip,
} from "../hooks/useQueries";
import CategoryBadge from "./CategoryBadge";
import ItemFormDialog from "./ItemFormDialog";
import TripFormDialog from "./TripFormDialog";

interface TripDetailProps {
  tripId: bigint;
  onBack: () => void;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDayDate(startDate: string, day: number): string {
  const start = new Date(startDate);
  const date = new Date(start);
  date.setDate(start.getDate() + day - 1);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function groupByDay(items: ItineraryItem[]): Map<number, ItineraryItem[]> {
  const map = new Map<number, ItineraryItem[]>();
  const sorted = [...items].sort((a, b) => {
    if (a.day !== b.day) return Number(a.day) - Number(b.day);
    return a.time.localeCompare(b.time);
  });
  for (const item of sorted) {
    const day = Number(item.day);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(item);
  }
  return map;
}

export default function TripDetail({ tripId, onBack }: TripDetailProps) {
  const { data: trips } = useTrips();
  const trip = trips?.find((t) => t.id === tripId) ?? null;
  const { data: items, isLoading: itemsLoading } = useItineraryItems(tripId);

  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();
  const addItem = useAddItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const [editTripOpen, setEditTripOpen] = useState(false);
  const [deleteTripOpen, setDeleteTripOpen] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState<{
    id: bigint;
    tripId: bigint;
  } | null>(null);
  const [defaultDay, setDefaultDay] = useState(1);

  const groupedItems = items
    ? groupByDay(items)
    : new Map<number, ItineraryItem[]>();
  const allDays = Array.from(groupedItems.keys()).sort((a, b) => a - b);

  const handleUpdateTrip = async (data: {
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    description: string;
  }) => {
    if (!trip) return;
    try {
      await updateTrip.mutateAsync({ id: trip.id, ...data });
      toast.success("Trip updated!");
      setEditTripOpen(false);
    } catch {
      toast.error("Failed to update trip.");
    }
  };

  const handleDeleteTrip = async () => {
    if (!trip) return;
    try {
      await deleteTrip.mutateAsync(trip.id);
      toast.success("Trip deleted.");
      onBack();
    } catch {
      toast.error("Failed to delete trip.");
    }
  };

  const handleSaveItem = async (data: {
    day: bigint;
    title: string;
    time: string;
    location: string;
    description: string;
    category: string;
  }) => {
    try {
      if (editingItem) {
        await updateItem.mutateAsync({
          args: { ...data, tripId },
          itemId: editingItem.id,
        });
        toast.success("Activity updated!");
      } else {
        await addItem.mutateAsync({ ...data, tripId });
        toast.success("Activity added!");
      }
      setItemFormOpen(false);
      setEditingItem(null);
    } catch {
      toast.error("Failed to save activity.");
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemTarget) return;
    try {
      await deleteItem.mutateAsync(deleteItemTarget);
      toast.success("Activity removed.");
      setDeleteItemTarget(null);
    } catch {
      toast.error("Failed to delete activity.");
    }
  };

  const isSavingItem = addItem.isPending || updateItem.isPending;

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          data-ocid="auth.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-sans">
            Loading trip…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              data-ocid="nav.back_button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 text-muted-foreground hover:text-foreground shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Trips</span>
            </Button>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-1.5 min-w-0">
              <Compass className="h-4 w-4 text-primary shrink-0" />
              <span className="font-display text-base font-semibold text-foreground truncate">
                Wanderlog
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              data-ocid="trip.edit_button"
              variant="outline"
              size="sm"
              className="gap-1.5 border-border hover:bg-secondary"
              onClick={() => setEditTripOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              data-ocid="trip.delete_button"
              variant="outline"
              size="sm"
              className="gap-1.5 border-border text-destructive hover:bg-destructive/10 hover:border-destructive/30"
              onClick={() => setDeleteTripOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Trip Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-accent mb-2">
            <MapPin className="h-4 w-4" />
            <span className="font-sans text-sm font-semibold tracking-wide uppercase">
              {trip.destination}
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-4">
            {trip.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-sans mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
            </span>
          </div>

          {trip.description && (
            <p className="text-muted-foreground font-sans text-base leading-relaxed max-w-2xl">
              {trip.description}
            </p>
          )}
        </motion.div>

        {/* Add Item Button */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Itinerary
          </h2>
          <Button
            data-ocid="item.add_button"
            onClick={() => {
              setEditingItem(null);
              setDefaultDay(allDays.length > 0 ? Math.max(...allDays) : 1);
              setItemFormOpen(true);
            }}
            className="gap-2 rounded-full shadow-glow hover:shadow-glow transition-all"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Activity
          </Button>
        </div>

        {/* Loading skeleton */}
        {itemsLoading && (
          <div data-ocid="item.loading_state" className="space-y-6">
            {[1, 2].map((d) => (
              <div key={d}>
                <Skeleton className="h-8 w-32 bg-secondary mb-4 rounded-lg" />
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-24 w-full bg-card rounded-xl"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!itemsLoading && (!items || items.length === 0) && (
          <motion.div
            data-ocid="item.empty_state"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <Plane className="h-6 w-6 text-primary opacity-80" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Your itinerary is empty
            </h3>
            <p className="text-muted-foreground font-sans text-sm mb-6 max-w-xs mx-auto">
              Start adding activities, meals, and transport to build your
              day-by-day plan.
            </p>
            <Button
              onClick={() => {
                setEditingItem(null);
                setDefaultDay(1);
                setItemFormOpen(true);
              }}
              size="sm"
              className="gap-2 rounded-full shadow-glow"
            >
              <Plus className="h-4 w-4" />
              Add first activity
            </Button>
          </motion.div>
        )}

        {/* Day-by-day timeline */}
        {!itemsLoading && items && items.length > 0 && (
          <div className="space-y-10">
            <AnimatePresence>
              {allDays.map((day, dayIndex) => {
                const dayItems = groupedItems.get(day) ?? [];
                const dayDate = trip.startDate
                  ? getDayDate(trip.startDate, day)
                  : null;

                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: dayIndex * 0.07 }}
                  >
                    {/* Day header */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/15 border border-primary/30 shrink-0">
                        <span className="font-display text-sm font-bold text-primary">
                          {day}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-foreground leading-none">
                          Day {day}
                        </h3>
                        {dayDate && (
                          <p className="text-xs text-muted-foreground font-sans mt-0.5">
                            {dayDate}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 h-px bg-border ml-2" />
                      {/* Add to this day */}
                      <Button
                        data-ocid="item.add_button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-primary gap-1.5"
                        onClick={() => {
                          setEditingItem(null);
                          setDefaultDay(day);
                          setItemFormOpen(true);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add to Day {day}
                      </Button>
                    </div>

                    {/* Timeline items */}
                    <div className="relative pl-6">
                      {/* Vertical line */}
                      <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />

                      <div className="space-y-3">
                        {dayItems.map((item, itemIndex) => (
                          <motion.div
                            key={item.id.toString()}
                            data-ocid={`item.item.${itemIndex + 1}`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{
                              duration: 0.3,
                              delay: itemIndex * 0.05,
                            }}
                            className="relative group"
                          >
                            {/* Timeline dot */}
                            <div
                              className={`absolute -left-[23px] top-4 w-3 h-3 rounded-full border-2 border-background bg-${item.category} z-10`}
                            />

                            {/* Item card */}
                            <div className="rounded-xl bg-card border border-border hover:border-primary/30 p-4 transition-all duration-200 hover:shadow-card">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-sans">
                                      <Clock className="h-3 w-3" />
                                      <span className="font-medium">
                                        {item.time}
                                      </span>
                                    </div>
                                    <CategoryBadge category={item.category} />
                                  </div>

                                  <h4 className="font-sans font-semibold text-foreground text-base leading-snug mb-1">
                                    {item.title}
                                  </h4>

                                  {item.location && (
                                    <div className="flex items-center gap-1 text-xs text-accent mb-1.5">
                                      <MapPin className="h-3 w-3" />
                                      <span className="font-sans">
                                        {item.location}
                                      </span>
                                    </div>
                                  )}

                                  {item.description && (
                                    <p className="text-xs text-muted-foreground font-sans line-clamp-2 mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                </div>

                                {/* Item actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                                  <Button
                                    data-ocid={`item.edit_button.${itemIndex + 1}`}
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                                    onClick={() => {
                                      setEditingItem(item);
                                      setItemFormOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    data-ocid={`item.delete_button.${itemIndex + 1}`}
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() =>
                                      setDeleteItemTarget({
                                        id: item.id,
                                        tripId,
                                      })
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-muted-foreground text-xs font-sans border-t border-border mt-16">
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

      {/* Edit Trip Dialog */}
      <TripFormDialog
        open={editTripOpen}
        onOpenChange={setEditTripOpen}
        trip={trip}
        onSave={handleUpdateTrip}
        isSaving={updateTrip.isPending}
      />

      {/* Delete Trip Dialog */}
      <AlertDialog open={deleteTripOpen} onOpenChange={setDeleteTripOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">
              Delete this trip?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-sans">
              This will permanently delete "{trip.title}" and all its itinerary
              items. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border hover:bg-secondary">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTrip}
              disabled={deleteTrip.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteTrip.isPending ? "Deleting…" : "Delete Trip"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Item Form Dialog */}
      <ItemFormDialog
        open={itemFormOpen}
        onOpenChange={(open) => {
          setItemFormOpen(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        tripId={tripId}
        defaultDay={defaultDay}
        onSave={handleSaveItem}
        isSaving={isSavingItem}
      />

      {/* Delete Item Dialog */}
      <AlertDialog
        open={deleteItemTarget !== null}
        onOpenChange={(open) => !open && setDeleteItemTarget(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">
              Remove this activity?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-sans">
              This activity will be permanently removed from your itinerary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="item.form.cancel_button"
              className="border-border hover:bg-secondary"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="item.delete_button.1"
              onClick={handleDeleteItem}
              disabled={deleteItem.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteItem.isPending ? "Removing…" : "Remove Activity"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
