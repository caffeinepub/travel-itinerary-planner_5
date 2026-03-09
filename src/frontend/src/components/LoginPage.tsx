import { Button } from "@/components/ui/button";
import { Compass, Globe, MapPin, Plane } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background hero image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/assets/generated/travel-hero-bg.dim_1920x1080.jpg')",
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/70" />

      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.72 0.19 195) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.19 195) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-semibold text-foreground tracking-tight">
            Wanderlog
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-lg w-full text-center"
        >
          {/* Destination badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-8 flex-wrap"
          >
            {["Tokyo", "Lisbon", "Patagonia", "Kyoto"].map((dest) => (
              <span
                key={dest}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sans font-medium bg-primary/10 text-primary border border-primary/20"
              >
                <MapPin className="h-3 w-3" />
                {dest}
              </span>
            ))}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-display text-5xl sm:text-6xl font-bold text-foreground leading-tight mb-6"
          >
            Plan your next
            <br />
            <span className="text-primary">great adventure</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="font-sans text-muted-foreground text-lg leading-relaxed mb-10"
          >
            Organize trips, build day-by-day itineraries, and keep every detail
            of your journey in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Button
              size="lg"
              onClick={login}
              disabled={isLoggingIn}
              className="px-10 py-6 text-base font-sans font-semibold rounded-full shadow-glow hover:shadow-glow transition-all duration-300 hover:scale-105"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plane className="h-4 w-4" />
                  Start Planning
                </span>
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 grid grid-cols-3 gap-6 max-w-lg w-full"
        >
          {[
            {
              icon: <Globe className="h-5 w-5" />,
              label: "Multiple Trips",
              sub: "Manage all your travels",
            },
            {
              icon: <MapPin className="h-5 w-5" />,
              label: "Day Planner",
              sub: "Hour-by-hour itineraries",
            },
            {
              icon: <Compass className="h-5 w-5" />,
              label: "Categories",
              sub: "Transport, food & more",
            },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-card/50 border border-border backdrop-blur-sm"
            >
              <span className="text-primary">{f.icon}</span>
              <span className="font-sans text-sm font-semibold text-foreground">
                {f.label}
              </span>
              <span className="font-sans text-xs text-muted-foreground">
                {f.sub}
              </span>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-muted-foreground text-xs font-sans">
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
    </div>
  );
}
