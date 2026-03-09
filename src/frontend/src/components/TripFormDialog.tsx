import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Trip } from "../backend.d";

interface TripFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip?: Trip | null;
  onSave: (data: {
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    description: string;
  }) => Promise<void>;
  isSaving: boolean;
}

export default function TripFormDialog({
  open,
  onOpenChange,
  trip,
  onSave,
  isSaving,
}: TripFormDialogProps) {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (trip) {
      setTitle(trip.title);
      setDestination(trip.destination);
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
      setDescription(trip.description);
    } else {
      setTitle("");
      setDestination("");
      setStartDate("");
      setEndDate("");
      setDescription("");
    }
  }, [trip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ title, destination, startDate, endDate, description });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="trip.dialog"
        className="bg-card border-border max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            {trip ? "Edit Trip" : "New Trip"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {trip
              ? "Update your trip details."
              : "Plan a new adventure. Fill in the details below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="trip-title"
              className="text-sm text-foreground/80 font-sans"
            >
              Trip Title
            </Label>
            <Input
              id="trip-title"
              data-ocid="trip.form.input"
              placeholder="e.g. Exploring Southeast Asia"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-background/60 border-border focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="destination"
              className="text-sm text-foreground/80 font-sans"
            >
              Destination
            </Label>
            <Input
              id="destination"
              placeholder="e.g. Bangkok, Thailand"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="bg-background/60 border-border focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="start-date"
                className="text-sm text-foreground/80 font-sans"
              >
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="bg-background/60 border-border focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="end-date"
                className="text-sm text-foreground/80 font-sans"
              >
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="bg-background/60 border-border focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="text-sm text-foreground/80 font-sans"
            >
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="A brief overview of your trip…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-background/60 border-border focus:border-primary resize-none"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="trip.form.cancel_button"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="border-border hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="trip.form.submit_button"
              disabled={isSaving}
              className="shadow-glow"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>{trip ? "Update Trip" : "Create Trip"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
