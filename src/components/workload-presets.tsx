"use client";

import React from "react";
import type { Workload } from "@/lib/calc";
import { WORKLOAD_PRESETS, workloadMatchesPreset } from "@/lib/compare-insights";

export function WorkloadPresets({
  workload,
  onChange,
}: {
  workload: Workload;
  onChange: (workload: Workload) => void;
}) {
  return (
    <section className="preset-panel" aria-labelledby="preset-heading">
      <div className="preset-panel-copy">
        <div className="eyebrow">Start with a pattern</div>
        <h2 id="preset-heading">Illustrative workloads</h2>
        <p>Pick a useful starting shape, then fine-tune every input below.</p>
      </div>
      <div className="preset-grid">
        {WORKLOAD_PRESETS.map((preset) => {
          const active = workloadMatchesPreset(workload, preset);
          return (
            <button
              key={preset.id}
              type="button"
              className="preset-button"
              aria-pressed={active}
              onClick={() => onChange({ ...preset.workload })}
            >
              <span className="preset-label">{preset.label}</span>
              <span className="preset-description mono">{preset.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
