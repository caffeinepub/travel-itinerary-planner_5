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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Hotel, Loader2, Plane, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import type { ItineraryItem } from "../backend.d";

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ItineraryItem | null;
  tripId: bigint;
  defaultDay?: number;
  onSave: (data: {
    day: bigint;
    title: string;
    time: string;
    location: string;
    description: string;
    category: string;
  }) => Promise<void>;
  isSaving: boolean;
}

const CATEGORIES = [
  {
    value: "transport",
    label: "Transport",
    icon: <Plane className="h-4 w-4" />,
  },
  {
    value: "accommodation",
    label: "Accommodation",
    icon: <Hotel className="h-4 w-4" />,
  },
  {
    value: "activity",
    label: "Activity",
    icon: <Camera className="h-4 w-4" />,
  },
  {
    value: "food",
    label: "Food & Dining",
    icon: <UtensilsCrossed className="h-4 w-4" />,
  },
];

export default function ItemFormDialog({
  open,
  onOpenChange,
  item,
  defaultDay = 1,
  onSave,
  isSaving,
}: ItemFormDialogProps) {
  const [day, setDay] = useState(defaultDay);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("activity");

  useEffect(() => {
    if (item) {
      setDay(Number(item.day));
      setTitle(item.title);
      setTime(item.time);
      setLocation(item.location);
      setDescription(item.description);
      setCategory(item.category);
    } else {
      setDay(defaultDay);
      setTitle("");
      setTime("09:00");
      setLocation("");
      setDescription("");
      setCategory("activity");
    }
  }, [item, defaultDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      day: BigInt(day),
      title,
      time,
      location,
      description,
      category,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="item.dialog"
        className="bg-card border-border max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            {item ? "Edit Activity" : "Add to Itinerary"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {item
              ? "Update this itinerary item."
              : "Add a new activity, meal, or event to your itinerary."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="item-day"
                className="text-sm text-foreground/80 font-sans"
              >
                Day
              </Label>
              <Input
                id="item-day"
                type="number"
                min={1}
                value={day}
                onChange={(e) => setDay(Number.parseInt(e.target.value) || 1)}
                required
                className="bg-background/60 border-border focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="item-time"
                className="text-sm text-foreground/80 font-sans"
              >
                Time
              </Label>
              <Input
                id="item-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="bg-background/60 border-border focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="item-title"
              className="text-sm text-foreground/80 font-sans"
            >
              Title
            </Label>
            <Input
              id="item-title"
              placeholder="e.g. Breakfast at the morning market"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-background/60 border-border focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="item-location"
              className="text-sm text-foreground/80 font-sans"
            >
              Location
            </Label>
            <Input
              id="item-location"
              placeholder="e.g. Chatuchak Market, Bangkok"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-background/60 border-border focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="item-category"
              className="text-sm text-foreground/80 font-sans"
            >
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                id="item-category"
                className="bg-background/60 border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {CATEGORIES.map((cat) => (
                  <SelectItem
                    key={cat.value}
                    value={cat.value}
                    className="hover:bg-secondary"
                  >
                    <span className="flex items-center gap-2">
                      {cat.icon}
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="item-description"
              className="text-sm text-foreground/80 font-sans"
            >
              Notes
            </Label>
            <Textarea
              id="item-description"
              placeholder="Any notes, reservations, or details…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="bg-background/60 border-border focus:border-primary resize-none"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="item.form.cancel_button"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="border-border hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="item.form.submit_button"
              disabled={isSaving}
              className="shadow-glow"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>{item ? "Update Activity" : "Add Activity"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
