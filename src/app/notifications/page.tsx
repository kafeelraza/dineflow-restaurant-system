"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Loader2, Trash2, ArrowLeft } from "lucide-react";
import { AppNav, Card, PageHeader } from "@/components/ui/brand";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface DbNotification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notificationsList, setNotificationsList] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotificationsList((data as DbNotification[]) || []);
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
    try {
      setLoading(true);
      const { error } = await supabase
        .from("notifications")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // deletes all rows safely

      if (error) throw error;
      setNotificationsList([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <section className="mx-auto max-w-4xl px-5 py-14 md:px-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--ink)] transition"
          >
            <ArrowLeft size={13} /> Back to dashboard
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <PageHeader
            eyebrow="Smart notifications"
            title="Real-time Operational Logs"
            copy="Customer payments, waiter updates, inventory limits, and checkout completions collected instantly."
          />
          {notificationsList.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#d7c9b5] bg-white px-4 text-xs font-bold text-[#b24428] hover:bg-[#f8ddd5]/20 transition shrink-0 self-start sm:self-auto"
            >
              <Trash2 size={13} /> Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="animate-spin text-[var(--terracotta)]" size={36} />
          </div>
        ) : notificationsList.length === 0 ? (
          <div className="rounded-[8px] bg-white border border-[#eadfce] p-12 text-center max-w-lg mx-auto mt-12 shadow-sm">
            <Bell className="mx-auto text-[var(--muted)] mb-3" size={36} />
            <h3 className="font-serif text-2xl font-bold text-[var(--ink)]">No new notifications</h3>
            <p className="text-sm text-[var(--muted)] mt-2">
              All settled! New table payments or shift assignments will pop up here in real-time.
            </p>
          </div>
        ) : (
          <div className="mt-12 space-y-4">
            {notificationsList.map((note) => {
              const diffMinutes = Math.max(1, Math.round((new Date().getTime() - new Date(note.created_at).getTime()) / 60000));
              return (
                <Card key={note.id} className="flex items-start gap-4 bg-white p-5 shadow-sm border border-[#eadfce]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8eadf] text-[var(--terracotta)]">
                    <Bell size={16} />
                  </span>
                  <div>
                    <p className="font-bold text-[var(--ink)] text-sm">{note.message}</p>
                    <p className="mt-1 text-xs text-[var(--muted)] font-semibold">
                      {diffMinutes === 1 ? "Just now" : `${diffMinutes} minutes ago`} • DineFlow System Logger
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
