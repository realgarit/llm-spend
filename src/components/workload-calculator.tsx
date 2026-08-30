"use client";

import { DEFAULT_WORKLOAD, formatTokens, type Workload } from "@/lib/calc";

/**
 * The "how much input/output/cache" workload controls for the compare page.
 * Split out of compare-explorer.tsx (which also renders the scenario
 * controls and the results table) purely to keep that file a manageable
 * size — this component is self-contained and holds no logic beyond parsing
 * its own number inputs.
 */
export function WorkloadCalculator({
  workload,
  onChange,
}: {
  workload: Workload;
  onChange: (w: Workload) => void;
}) {
  return (
    <div className="card-2" style={{ padding: "1.4rem 1.5rem", marginBottom: "1.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.1rem" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: "0.35rem" }}>Interactive</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>Workload cost calculator</h2>
        </div>
        <button
          type="button"
          className="btn"
          style={{ fontSize: "0.8rem" }}
          onClick={() => onChange(DEFAULT_WORKLOAD)}
        >
          Reset to example
        </button>
      </div>

      <div style={{ display: "grid", gap: "1.4rem", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
        <NumberField
          id="workload-input"
          label="Input tokens (M)"
          value={workload.inputTokens}
          onChange={(v) => onChange({ ...workload, inputTokens: v })}
          hint={formatTokens(workload.inputTokens)}
        />
        <NumberField
          id="workload-output"
          label="Output tokens (K)"
          value={workload.outputTokens}
          onChange={(v) => onChange({ ...workload, outputTokens: v })}
          hint={formatTokens(workload.outputTokens)}
          thousands
        />
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <label htmlFor="cacherate" className="eyebrow">Cache hit rate</label>
            <span className="mono" style={{ color: "var(--brand)", fontSize: "0.85rem" }}>
              {Math.round(workload.cacheHitRate * 100)}%
            </span>
          </div>
          <input
            id="cacherate"
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(workload.cacheHitRate * 100)}
            onChange={(e) => onChange({ ...workload, cacheHitRate: Number(e.target.value) / 100 })}
          />
          <p style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.5rem" }}>
            Share of input tokens served from cache. Applied only to models with a cache meter.
          </p>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  hint,
  thousands,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint: string;
  thousands?: boolean;
}) {
  const divisor = thousands ? 1_000 : 1_000_000;
  const displayValue = value === 0 ? "" : String(Number((value / divisor).toFixed(4)));

  const parseAndCommit = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed === "-") {
      onChange(0);
      return;
    }
    const units = Number(trimmed);
    if (Number.isNaN(units)) return;
    const tokens = Math.max(0, Math.round(units * divisor));
    onChange(tokens);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <label htmlFor={id} className="eyebrow">{label}</label>
        <span className="mono" style={{ color: "var(--text-faint)", fontSize: "0.8rem" }}>{hint}</span>
      </div>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        defaultValue={displayValue}
        placeholder="0"
        onBlur={(e) => parseAndCommit(e.target.value)}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange(0);
            return;
          }
          const units = Number(raw);
          if (!Number.isNaN(units) && units >= 0) {
            const tokens = Math.round(units * divisor);
            onChange(tokens);
          }
        }}
        style={{ width: "100%" }}
      />
    </div>
  );
}
