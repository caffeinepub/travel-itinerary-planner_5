import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import TripDetail from "./components/TripDetail";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [selectedTripId, setSelectedTripId] = useState<bigint | null>(null);

  if (isInitializing) {
    return (
      <div
        data-ocid="auth.loading_state"
        className="min-h-screen bg-background flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-sans text-sm tracking-wide">
            Loading your journeys…
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {selectedTripId === null ? (
        <Dashboard onSelectTrip={setSelectedTripId} />
      ) : (
        <TripDetail
          tripId={selectedTripId}
          onBack={() => setSelectedTripId(null)}
        />
      )}
      <Toaster />
    </>
  );
}
