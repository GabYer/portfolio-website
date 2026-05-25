import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Gabyer — Senior Data Engineer Portfolio",
  description: "Real-time data engineering portfolio: Kafka, Airflow, dbt, ClickHouse, PostgreSQL, Grafana. Live crypto & forex pipelines.",
  keywords: ["data engineer", "portfolio", "kafka", "airflow", "dbt", "clickhouse"],
  openGraph: {
    title: "Gabyer — Senior Data Engineer",
    description: "Live data pipelines powering real-time analytics",
    url: "https://portfolio.gabyer.dev",
    siteName: "gabyer.dev",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0f1117] text-slate-200 antialiased">
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
