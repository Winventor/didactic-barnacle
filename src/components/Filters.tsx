"use client";

import type { DocumentStatus, DocumentType, Municipality } from "@/lib/types";

interface FiltersProps {
  type: DocumentType | "alle";
  status: DocumentStatus | "alle";
  gemeente: string;
  q: string;
  municipalities: Municipality[];
  documentTypes: readonly DocumentType[];
  statusLabels: Record<DocumentStatus, string>;
  onChange: (updates: Record<string, string>) => void;
}

export function Filters({
  type,
  status,
  gemeente,
  q,
  municipalities,
  documentTypes,
  statusLabels,
  onChange,
}: FiltersProps) {
  return (
    <form
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        onChange({
          q: String(formData.get("q") ?? ""),
          type: String(formData.get("type") ?? "alle"),
          status: String(formData.get("status") ?? "alle"),
          gemeente: String(formData.get("gemeente") ?? ""),
        });
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Zoeken</span>
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Onderwerp of trefwoord…"
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-orange-500 focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Type</span>
        <select
          name="type"
          defaultValue={type}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-orange-500 focus:ring-2"
        >
          <option value="alle">Alle typen</option>
          {documentTypes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Status</span>
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-orange-500 focus:ring-2"
        >
          <option value="alle">Alle statussen</option>
          {(Object.keys(statusLabels) as DocumentStatus[]).map((key) => (
            <option key={key} value={key}>
              {statusLabels[key]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Gemeente</span>
        <select
          name="gemeente"
          defaultValue={gemeente}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-orange-500 focus:ring-2"
        >
          <option value="">Alle gemeenten</option>
          {municipalities.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name.replace(/^Gemeente\s+/i, "")}
            </option>
          ))}
        </select>
      </label>

      <div className="sm:col-span-2 lg:col-span-4">
        <button
          type="submit"
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Zoeken
        </button>
      </div>
    </form>
  );
}
