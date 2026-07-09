import type { Raadsstuk } from "@/lib/types";

interface RaadsstukkenTableProps {
  items: Raadsstuk[];
  loading: boolean;
}

const STATUS_STYLES = {
  aangenomen: "bg-emerald-100 text-emerald-800",
  verworpen: "bg-rose-100 text-rose-800",
  onbekend: "bg-slate-100 text-slate-700",
} as const;

const STATUS_LABELS = {
  aangenomen: "Aangenomen",
  verworpen: "Verworpen",
  onbekend: "Onbekend",
} as const;

export function RaadsstukkenTable({ items, loading }: RaadsstukkenTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="animate-pulse space-y-3 p-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-10 rounded bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
        Geen raadsstukken gevonden met de huidige filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Type
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Onderwerp
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Status
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Partijen
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Datum
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Gemeente
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Bron
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id} className="align-top hover:bg-slate-50/80">
              <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                {item.type}
              </td>
              <td className="max-w-xs px-4 py-3 font-medium text-slate-900">
                {item.onderwerp}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[item.status]}`}
                >
                  {STATUS_LABELS[item.status]}
                </span>
              </td>
              <td className="max-w-[10rem] px-4 py-3 text-slate-600">
                {item.partijen}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                {item.datum ?? "—"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                {item.gemeente}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <a
                    href={item.dataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-orange-700 hover:underline"
                    title={item.dataUrl}
                  >
                    ORI-data
                  </a>
                  {item.pdfUrl && (
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-500 hover:text-slate-800 hover:underline"
                      title="PDF-bestand via openraadsinformatie.nl"
                    >
                      Bestand
                    </a>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
