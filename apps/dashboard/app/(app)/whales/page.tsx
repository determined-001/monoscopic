"use client";

import { useState } from "react";
import { WhaleStats } from "@/components/whales/whale-stats";
import {
  WhaleFilters,
  DEFAULT_FILTERS,
  type WhaleFilterState,
} from "@/components/whales/whale-filters";
import { WhaleFeed } from "@/components/whales/whale-feed";
import { FollowedWhales } from "@/components/whales/followed-whales";

export default function WhalesPage() {
  const [filters, setFilters] = useState<WhaleFilterState>(DEFAULT_FILTERS);

  return (
    <div className="flex flex-col gap-5 py-6">
      {/* Stats row */}
      <WhaleStats />

      {/* Feed + sidebar */}
      <div className="flex gap-5 items-start">
        {/* Main content column */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <WhaleFilters filters={filters} onChange={setFilters} />
          <WhaleFeed filters={filters} />
        </div>

        {/* Desktop sidebar — FollowedWhales renders itself hidden on < xl */}
        <FollowedWhales />
      </div>
    </div>
  );
}
