"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getExampleQueries } from "@/lib/search/semantic-search";
import type { AudienceType } from "@/types";

interface SearchBarProps {
  defaultValue?: string;
  audience?: AudienceType;
  size?: "default" | "large";
}

export function SearchBar({ defaultValue = "", audience = "beleidsmakers", size = "default" }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();
  const examples = getExampleQueries();

  const handleSearch = (q?: string) => {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery) return;
    const params = new URLSearchParams({ q: searchQuery, audience });
    router.push(`/tes/zoeken?${params.toString()}`);
  };

  const isLarge = size === "large";

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className={isLarge ? "relative" : "flex gap-2"}
      >
        <div className={isLarge ? "relative" : "flex-1 relative"}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Vraag iets over arbeid, loopbaan, carrière, leiderschap of duurzame inzetbaarheid..."
            className={
              isLarge
                ? "h-14 pl-12 pr-28 text-base rounded-2xl border-border/80 shadow-sm"
                : "pl-10"
            }
          />
          {isLarge && (
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl"
            >
              Zoeken
            </Button>
          )}
        </div>
        {!isLarge && (
          <Button type="submit">Zoeken</Button>
        )}
      </form>

      {isLarge && (
        <div className="mt-8">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Voorbeeldvragen
          </p>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setQuery(ex);
                  handleSearch(ex);
                }}
                className="text-left text-sm px-4 py-2 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
