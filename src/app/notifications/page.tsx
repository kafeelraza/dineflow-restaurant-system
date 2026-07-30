"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, Trash2, ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-widgets";
import { Card } from "@/components/ui/brand";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface DbNotification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function formatNotificationTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "JUST NOW";
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "MIN" : "MINS"} AGO`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "HR" : "HRS"} AGO`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "DAY" : "DAYS"} AGO`;

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).toUpperCase();
}

export default function NotificationsPage() {
  const [notificationsList, setNotificationsList] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      // Fetch authenticated user profile
      const { data: { user } } = await supabase.auth.getUser();

      let userRole = "customer";
      let userId = "";

      if (user) {
        userId = user.id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile) userRole = profile.role;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      let rawList = (data as DbNotification[]) || [];

      // If staff role, filter list to ONLY show assignments directed to them or mentioning their assignment
      if (userRole === "staff") {
        rawList = rawList.filter((note) => {
          const isTargetedToUser = (note as any).user_id === userId;
          const msg = note.message?.toLowerCase() || "";
          const isAssignmentAlert =
            msg.includes("assigned") ||
            msg.includes("claimed") ||
            msg.includes("table station");

          return isTargetedToUser || isAssignmentAlert;
        });
      }

      setNotificationsList(rawList);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications in real-time
    const channel = supabase
      .channel("realtime-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleClearAll = async () => {
    if (notificationsList.length === 0) return;
    try {
      setLoading(true);
      const idsToDelete = notificationsList.map((n) => n.id);
      
      const { error } = await supabase
        .from("notifications")
        .delete()
        .in("id", idsToDelete); // Delete only the specific notifications displayed for this user

      if (error) throw error;
      setNotificationsList([]);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell title="Notifications center" subtitle="Real-time operational alerts, customer checkouts, and system logs.">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--ink)] transition"
        >
          <ArrowLeft size={13} /> Back to orders
        </Link>
        {notificationsList.length > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#d7c9b5] bg-white px-4 text-xs font-bold text-[#b24428] hover:bg-[#f8ddd5]/20 transition shrink-0"
          >
            <Trash2 size={13} /> Clear All Alerts
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-[var(--terracotta)]" size={36} />
        </div>
      ) : notificationsList.length === 0 ? (
        <div className="rounded-[8px] bg-white border border-[#eadfce] p-12 text-center max-w-lg mx-auto shadow-sm">
          <Bell className="mx-auto text-[var(--muted)] mb-3" size={36} />
          <h3 className="font-serif text-2xl font-bold text-[var(--ink)]">No new notifications</h3>
          <p className="text-sm text-[var(--muted)] mt-2 font-semibold">
            All settled! New table payments or shift assignments will pop up here in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {notificationsList.map((note) => {
            return (
              <Card key={note.id} className="flex items-start gap-4 bg-white p-5 shadow-sm border border-[#eadfce] transition hover:bg-[#fcfaf6]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)]">
                  <Bell size={16} />
                </span>
                <div>
                  <p className="font-bold text-[var(--ink)] text-sm leading-relaxed">{note.message}</p>
                  <p className="mt-1 text-[10px] text-[var(--muted)] font-extrabold tracking-wider uppercase">
                    {formatNotificationTime(note.created_at)} • DineFlow System Logs
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
