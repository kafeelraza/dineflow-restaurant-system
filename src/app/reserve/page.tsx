"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock, Loader2, Users, Check } from "lucide-react";
import { AppNav, Card, PageHeader } from "@/components/ui/brand";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Table {
  id: string;
  table_number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
}

export default function ReservePage() {
  const [tablesList, setTablesList] = useState<Table[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("20:30");
  const [guests, setGuests] = useState(4);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [reservedTableNumber, setReservedTableNumber] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurant_tables")
        .select("*")
        .order("table_number", { ascending: true });

      if (error) throw error;
      setTablesList((data as Table[]) || []);
    } catch (err) {
      console.error("Failed to load tables:", err);
    } finally {
      setTablesLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();

    // Subscribe to real-time table status updates
    const channel = supabase
      .channel("tables-reserve-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restaurant_tables" },
        () => {
          fetchTables();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !selectedTableId) {
      setMessage({
        type: "error",
        text: "Please fill in all fields and select an available table from the floor plan.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const reservedAtString = `${date}T${time}:00`;

      // 1. Fetch user to link if logged in
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Insert reservation
      const { error: reserveErr } = await supabase.from("reservations").insert({
        customer_id: user?.id || null,
        table_id: selectedTableId,
        name,
        phone,
        party_size: guests,
        reserved_at: new Date(reservedAtString).toISOString(),
        status: "confirmed",
      });

      if (reserveErr) throw reserveErr;

      // 3. Update table status to 'reserved' in Supabase
      const { error: tableErr } = await supabase
        .from("restaurant_tables")
        .update({ status: "reserved" })
        .eq("id", selectedTableId);

      if (tableErr) throw tableErr;

      const tableNum = tablesList.find((t) => t.id === selectedTableId)?.table_number || 0;
      setReservedTableNumber(tableNum);

      setMessage({
        type: "success",
        text: `Reservation confirmed for Table T${String(tableNum).padStart(2, "0")} on ${date} at ${time}!`,
      });

      // Clear input fields
      setName("");
      setPhone("");
      setSelectedTableId(null);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to confirm reservation." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AppNav />
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <PageHeader
          eyebrow="Smart reservations"
          title="Grab a table without phone calls"
          copy="A live reservation flow that shows table fit, preferred time, guest count, and confirmation states."
        />
        
        {message && (
          <div
            className={`mx-auto mt-8 max-w-xl rounded-[8px] p-4 text-sm leading-6 text-center ${
              message.type === "success"
                ? "bg-[#eaf2e5] text-[#4f7d52] border border-[#eadfce]"
                : "bg-[#f8ddd5] text-[#b24428] border border-[#eadfce]"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="bg-white p-6">
            {reservedTableNumber ? (
              <div className="text-center py-10 space-y-6 flex flex-col items-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf2e5] text-[#4f7d52] border border-[#eadfce]">
                  <Check size={32} />
                </div>
                <h3 className="font-serif text-3xl font-bold">Table Reserved!</h3>
                <p className="text-sm text-[var(--muted)] max-w-sm mx-auto leading-relaxed font-semibold">
                  Table <span className="text-[var(--terracotta)] font-extrabold">T{String(reservedTableNumber).padStart(2, "0")}</span> has been successfully booked for you. The kitchen staff is ready for your arrival.
                </p>
                <Link
                  href={`/menu?table=${reservedTableNumber}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] px-8 font-bold text-white transition hover:scale-[1.02] shadow-sm"
                >
                  Proceed to Menu & Order
                </Link>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-3xl font-bold">Reserve your spot</h2>
                <form onSubmit={handleConfirmReservation} className="mt-6 grid gap-4">
                  <label>
                    <span className="text-sm font-bold">Name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none focus:border-[var(--terracotta)]"
                      placeholder="Aarav Sharma"
                      required
                    />
                  </label>
                  
                  <label>
                    <span className="text-sm font-bold">Phone</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none focus:border-[var(--terracotta)]"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </label>
                  
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label>
                      <span className="text-sm font-bold">Date</span>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none focus:border-[var(--terracotta)] text-sm font-bold"
                        required
                      />
                    </label>
                    <label>
                      <span className="text-sm font-bold">Time</span>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none focus:border-[var(--terracotta)] text-sm font-bold"
                        required
                      />
                    </label>
                    <label>
                      <span className="text-sm font-bold">Guests</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="mt-2 h-12 w-full rounded-[8px] border border-[#d7c9b5] bg-[#fcfaf6] px-4 outline-none focus:border-[var(--terracotta)] text-sm font-bold"
                        required
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !selectedTableId}
                    className="mt-4 flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--terracotta)] font-bold text-white transition hover:scale-[1.01] disabled:opacity-50 disabled:scale-100"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : "Confirm reservation"}
                  </button>
                </form>
              </>
            )}
          </Card>
          
          <Card className="p-6">
            <h2 className="font-serif text-3xl font-bold">Available floor plan</h2>
            <p className="text-xs text-[var(--muted)] mt-1">Please select an available table to book:</p>
            
            {tablesLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="animate-spin text-[var(--terracotta)]" size={32} />
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {tablesList.slice(0, 12).map((table) => {
                  const isSelected = selectedTableId === table.id;
                  const isAvailable = table.status === "available";

                  return (
                    <button
                      key={table.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedTableId(table.id)}
                      className={`rounded-[8px] p-4 text-left text-sm font-bold transition hover:scale-[1.02] disabled:cursor-not-allowed ${
                        isSelected
                          ? "bg-[var(--terracotta)] text-white shadow-md border-2 border-[var(--terracotta)]"
                          : table.status === "available"
                          ? "bg-[#eaf2e5] text-[#4f7d52] border border-[#eadfce]"
                          : table.status === "reserved"
                          ? "bg-[#fbf0cf] text-[#a07012] opacity-60 border border-[#eadfce]"
                          : table.status === "cleaning"
                          ? "bg-[#ece7df] text-[#8a7f71] opacity-60 border border-[#eadfce]"
                          : "bg-[#f8ddd5] text-[#b24428] opacity-60 border border-[#eadfce]"
                      }`}
                    >
                      <span className="block text-lg">T{String(table.table_number).padStart(2, "0")}</span>
                      <span className="capitalize">{table.status}</span>
                      <span className="mt-2 block text-xs">Seats {table.capacity}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}
