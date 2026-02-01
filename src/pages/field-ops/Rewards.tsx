import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "@/pages/admin/hooks/useAdminStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, ArrowLeft, Gift, Coins } from "lucide-react";

/* ================= POINT RULES ================= */
const PRIORITY_POINTS = {
  P0: 20,
  P1: 15,
  P2: 10,
  P3: 5,
};

/* ================= REWARD STORE ================= */
const REWARDS = [
  {
    id: "notebook",
    title: "BatterySmart Notebook",
    cost: 40,
    img: "/rewards/notebook.png",
  },
  {
    id: "penkit",
    title: "Field Ops Pen Kit",
    cost: 30,
    img: "/rewards/pen-kit.png",
  },
  {
    id: "tshirt",
    title: "BatterySmart T-Shirt",
    cost: 80,
    img: "/rewards/tshirt.png",
  },
  {
    id: "cap",
    title: "BatterySmart Cap",
    cost: 60,
    img: "/rewards/cap.png",
  },
  {
    id: "bag",
    title: "Field Ops Sling Bag",
    cost: 120,
    img: "/rewards/bag.png",
  },
  {
    id: "voucher",
    title: "₹100 Shopping Voucher",
    cost: 150,
    img: "/rewards/voucher.png",
  },
];

/* ================= MAIN ================= */
export default function Rewards() {
  const navigate = useNavigate();
  const tickets = useAdminStore((s) => s.tickets);

  /* ---------- CALCULATION (REAL DATA ONLY) ---------- */
  const stats = useMemo(() => {
    let solved = 0;
    let points = 0;

    tickets.forEach((t) => {
      if (t.status === "resolved") {
        solved++;
        points += PRIORITY_POINTS[t.priority];
      }
    });

    return { solved, points };
  }, [tickets]);

  const [balance, setBalance] = useState(stats.points);
  const [history, setHistory] = useState<
    { title: string; cost: number; date: string }[]
  >([]);

  const redeem = (reward: any) => {
    if (balance < reward.cost) return;
    setBalance(balance - reward.cost);
    setHistory([
      {
        title: reward.title,
        cost: reward.cost,
        date: new Date().toLocaleDateString(),
      },
      ...history,
    ]);
  };

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: "url('/intro-bg.png')",
            backgroundSize: "cover",
            filter: "blur(1.5px)",
            opacity: 0.85,
          }}
        />
        <div className="absolute inset-0 bg-white/10" />
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/field-ops")}>
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-bold flex gap-2 items-center">
            <Trophy className="text-emerald-600" />
            Rewards & Recognition
          </h1>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6">
          <Stat title="Problems Solved" value={stats.solved} />

          <Stat title="Total Points" value={stats.points} showCoin />

          <Stat title="Available Points" value={balance} showCoin />
        </div>

        {/* REDEEM STORE */}
        <Card className="p-6 rounded-2xl bg-white/60 backdrop-blur">
          <h2 className="text-lg font-bold mb-4 flex gap-2 items-center">
            <Gift className="text-emerald-600" />
            Redeem Rewards
          </h2>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {REWARDS.map((r) => (
              <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="h-56 w-full bg-slate-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={r.img}
                    alt={r.title}
                    className="h-full w-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <h3 className="font-semibold">{r.title}</h3>

                <div className="flex items-center gap-1 text-sm mt-1">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold text-black">{r.cost}</span>
                </div>

                <Button
                  className="w-full mt-3"
                  disabled={balance < r.cost}
                  onClick={() => redeem(r)}
                >
                  Redeem
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* HISTORY */}
        <Card className="p-6 rounded-2xl bg-white/60 backdrop-blur">
          <h2 className="font-bold mb-3">Redemption History</h2>

          {history.length === 0 && (
            <p className="text-slate-500 text-sm">No rewards redeemed yet</p>
          )}

          {history.map((h, i) => (
            <div key={i} className="flex justify-between text-sm py-2">
              <span>{h.title}</span>
              <span className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="text-black font-semibold">-{h.cost}</span>
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */
function Stat({
  title,
  value,
  showCoin = false,
}: {
  title: string;
  value: number;
  showCoin?: boolean;
}) {
  return (
    <Card className="p-6 rounded-2xl bg-white/60 backdrop-blur">
      <p className="text-sm text-slate-500">{title}</p>

      <div className="flex items-center gap-2 mt-1">
        {showCoin && <Coins className="h-6 w-6 text-yellow-500" />}
        <p className="text-3xl font-bold text-black">{value}</p>
      </div>
    </Card>
  );
}
