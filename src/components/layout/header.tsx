"use client";

import { Download, FileSpreadsheet, FileJson, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  downloadFile,
  exportToCsv,
  exportToExcel,
  exportToJson,
} from "@/lib/export/export-utils";
import type { PolicyDocument } from "@/types/policy-document";

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  documents: PolicyDocument[];
}

export function Header({ search, onSearchChange, documents }: HeaderProps) {
  const handleExportCsv = () => {
    const csv = exportToCsv(documents);
    downloadFile(csv, "beleidsdocumenten.csv", "text/csv;charset=utf-8;");
  };

  const handleExportJson = () => {
    const json = exportToJson(documents);
    downloadFile(json, "beleidsdocumenten.json", "application/json");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">
            Beleidsdashboard OpenRaadsinformatie
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Doorzoek en analyseer openbare beleidsdocumenten
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Zoeken…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCsv}>
                <FileText className="mr-2 h-4 w-4" />
                Exporteer CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(documents)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exporteer Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJson}>
                <FileJson className="mr-2 h-4 w-4" />
                Exporteer JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
