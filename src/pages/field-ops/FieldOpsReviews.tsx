import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "@/pages/admin/hooks/useAdminStore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  MessageSquare,
  ArrowLeft,
  ThumbsUp,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ======================================================
   MOCK REVIEW RULE
   (Later: backend se aayega – HQ / Station side)
   ====================================================== */
const generateReview = (priority: string) => {
  if (priority === "P0")
    return {
      rating: 4,
      comment:
        "Critical issue resolved quickly. Field ops arrived on time and restored service efficiently.",
    };
  if (priority === "P1")
    return {
      rating: 4,
      comment:
        "Issue handled well with proper diagnostics. Slight delay but acceptable.",
    };
  return {
    rating: 5,
    comment:
      "Excellent work. Issue resolved smoothly without disruption.",
  };
};

export default function FieldOpsReviews() {
  const navigate = useNavigate();
  const tickets = useAdminStore((s) => s.tickets);

  /* ======================================================
     DERIVED REVIEWS (only resolved tickets get reviews)
     ====================================================== */
  const reviews = useMemo(() => {
    return tickets
      .filter((t) => t.status === "resolved")
      .map((t) => {
        const review = generateReview(t.priority);
        return {
          id: t.id,
          station: t.station_name,
          city: t.station_id.split("-")[0],
          priority: t.priority,
          rating: review.rating,
          comment: review.comment,
        };
      });
  }, [tickets]);

  const avgRating =
    reviews.length === 0
      ? 0
      : (
          reviews.reduce((acc, r) => acc + r.rating, 0) /
          reviews.length
        ).toFixed(1);

  /* ======================================================
     UI
     ====================================================== */
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800">
      {/* BACKGROUND – SAME AS DASHBOARD / REWARDS */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: "url('/intro-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(1.5px)",
            opacity: 0.85,
          }}
        />
        <div className="absolute inset-0 bg-white/10" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto p-6 space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/field-ops")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-emerald-600" />
                Field Ops Reviews
              </h1>
              <p className="text-slate-600 text-sm">
                Feedback from stations & HQ after issue resolution
              </p>
            </div>
          </div>

          <Badge className="bg-emerald-500/90 text-white px-4 py-1.5">
            Avg Rating ⭐ {avgRating}
          </Badge>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard
            title="Total Reviews"
            value={reviews.length}
            icon={MessageSquare}
          />
          <SummaryCard
            title="Positive Feedback"
            value={reviews.filter((r) => r.rating >= 4).length}
            icon={ThumbsUp}
          />
          <SummaryCard
            title="Critical Incidents"
            value={reviews.filter((r) => r.priority === "P0").length}
            icon={AlertTriangle}
          />
        </div>

        {/* REVIEWS LIST */}
        <Card className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg p-6">
          <h2 className="text-lg font-bold mb-4">
            Recent Reviews
          </h2>

          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-xl p-5 bg-gradient-to-br from-emerald-400/15 via-sky-400/10 to-blue-500/15 border border-white/40 backdrop-blur"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {r.station}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {r.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{r.priority}</Badge>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < r.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-slate-300",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">
                  {r.comment}
                </p>
              </div>
            ))}

            {reviews.length === 0 && (
              <p className="text-slate-500 text-sm">
                No reviews yet. Resolve tickets to receive feedback.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ======================================================
   SMALL SUMMARY CARD
   ====================================================== */
function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: any;
}) {
  return (
    <Card className="rounded-2xl bg-gradient-to-br from-emerald-400/15 via-sky-400/10 to-blue-500/15 backdrop-blur-xl border border-white/40 shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 font-semibold">
            {title}
          </p>
          <p className="text-3xl font-bold mt-1">
            {value}
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
