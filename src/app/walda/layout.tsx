import type { Metadata } from "next";
import "./theme.css";

export const metadata: Metadata = {
  title: "Walda Coaching",
  description:
    "Professionele coachingspraktijk — zelftests, begeleiding en persoonlijke groei.",
};

export default function WaldaLayout({ children }: { children: React.ReactNode }) {
  return <div className="walda-coaching min-h-screen">{children}</div>;
}
