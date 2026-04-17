import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useMemberGate } from "@/hooks/use-member-gate";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, ExternalLink, Video, Users, Play } from "lucide-react";

interface Event {
  id: number;
  title: string;
  description: string | null;
  eventType: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  timezone: string;
  joinUrl: string | null;
  recordingUrl: string | null;
  hostName: string | null;
  hostTitle: string | null;
  requiredTier: string;
  maxAttendees: number | null;
  tags: string | null;
}

const EVENT_TYPE_LABEL: Record<string, string> = {
  zoom_coaching: "Live Coaching",
  webinar: "Webinar",
  community_call: "Community Call",
  qa_session: "Q&A Session",
  other: "Event",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  upcoming: { label: "Upcoming", className: "bg-sky-100 text-sky-700 border-sky-300" },
  live: { label: "🔴 Live Now", className: "bg-red-100 text-red-700 border-red-300 animate-pulse" },
  completed: { label: "Recorded", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground line-through" },
};

function EventCard({ event }: { event: Event }) {
  const statusCfg = STATUS_BADGE[event.status] ?? STATUS_BADGE.upcoming;
  const eventDate = new Date(event.scheduledAt);
  const isPast = eventDate < new Date() && event.status !== "live";

  return (
    <Card className={`${event.status === "cancelled" ? "opacity-60" : ""} hover:border-primary/40 transition-colors`}>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {EVENT_TYPE_LABEL[event.eventType] ?? event.eventType}
            </Badge>
            <Badge className={`text-xs ${statusCfg.className}`}>{statusCfg.label}</Badge>
            {event.requiredTier !== "starter" && (
              <Badge variant="outline" className="text-xs capitalize">{event.requiredTier}+ only</Badge>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-base mb-1">{event.title}</h3>
        {event.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {eventDate.toLocaleDateString("en-US", {
              weekday: "short", month: "long", day: "numeric", year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} {event.timezone}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {event.durationMinutes} min
          </span>
          {event.hostName && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {event.hostName}
              {event.hostTitle ? ` — ${event.hostTitle}` : ""}
            </span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {event.status === "live" && event.joinUrl && (
            <a href={event.joinUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="animate-pulse">
                <Video className="w-3.5 h-3.5 mr-1.5" /> Join Now — Live
              </Button>
            </a>
          )}
          {event.status === "upcoming" && event.joinUrl && (
            <a href={event.joinUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Register / Join Link
              </Button>
            </a>
          )}
          {event.recordingUrl && (
            <a href={event.recordingUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                <Play className="w-3.5 h-3.5 mr-1.5" /> Watch Recording
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LiveEvents() {
  const { user } = useAuth();
  const { blocked } = useMemberGate({ requirePlatform: true }); // membership + bundle only

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to load events");
      return res.json();
    },
    enabled: !blocked && !!user,
  });

  if (blocked || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const upcoming = events?.filter((e) => e.status === "upcoming" || e.status === "live") ?? [];
  const past = events?.filter((e) => e.status === "completed") ?? [];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        <div>
          <h1 className="text-3xl font-bold mb-1">Live Events & Coaching</h1>
          <p className="text-muted-foreground">
            Join live Zoom coaching sessions, community calls, and Q&A events with Miitro coaches and peers.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Live now */}
            {events?.some((e) => e.status === "live") && (
              <div>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Happening Now
                </h2>
                <div className="space-y-4">
                  {events.filter((e) => e.status === "live").map((e) => <EventCard key={e.id} event={e} />)}
                </div>
              </div>
            )}

            {/* Upcoming */}
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Upcoming Sessions
              </h2>
              {upcoming.filter((e) => e.status !== "live").length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No upcoming sessions scheduled</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      New sessions are added regularly. Check back soon.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcoming.filter((e) => e.status !== "live").map((e) => <EventCard key={e.id} event={e} />)}
                </div>
              )}
            </div>

            {/* Past recordings */}
            {past.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" /> Past Sessions & Recordings
                </h2>
                <div className="space-y-4">
                  {past.map((e) => <EventCard key={e.id} event={e} />)}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </AppLayout>
  );
}
