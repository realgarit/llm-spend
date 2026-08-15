"use client";

import {
  DEFAULT_CUSTOM_HOUR_UTC,
  DEFAULT_SCENARIO,
  OFF_PEAK_HOUR_UTC,
  PEAK_HOUR_UTC,
  SERVICE_TIER_OPTIONS,
  type Scenario,
  type TimeMode,
} from "@/lib/scenario";

const TIME_MODE_OPTIONS: { value: TimeMode; label: string; title: string }[] = [
  { value: "now", label: "Now", title: "Live — whatever hour it actually is right now, UTC" },
  {
    value: "off-peak",
    label: "Off-peak",
    title: `Preview a representative off-peak hour (${String(OFF_PEAK_HOUR_UTC).padStart(2, "0")}:00 UTC)`,
  },
  {
    value: "peak",
    label: "Peak",
    title: `Preview a representative peak hour (${String(PEAK_HOUR_UTC).padStart(2, "0")}:00 UTC)`,
  },
  { value: "custom", label: "Custom hour", title: "Pick any UTC hour to preview" },
];

/**
 * Time / service-tier scenario picker for the compare page, alongside the
 * workload calculator. Purely controlled — all state and the mapping to a
 * `RateContext` live in `lib/scenario.ts`; this component only renders the
 * current `Scenario` and reports changes via `onChange`.
 *
 * The active time mode is shown brand-filled (the site's established
 * "selected/emphasized" treatment — see `.badge-active` / `.variant-chip.is-active`
 * in globals.css) so the current scenario is unambiguous at a glance.
 */
export function ScenarioControls({
  scenario,
  onChange,
}: {
  scenario: Scenario;
  onChange: (s: Scenario) => void;
}) {
  return (
    <div className="card-2" style={{ padding: "1.1rem 1.25rem", marginBottom: "1.1rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem 2rem", alignItems: "flex-start" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: "0.55rem" }}>
            Time
          </div>
          <div
            role="group"
            aria-label="Pricing time scenario"
            style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}
          >
            {TIME_MODE_OPTIONS.map((opt) => {
              const active = scenario.time.mode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  title={opt.title}
                  className="btn"
                  style={
                    active
                      ? { background: "var(--brand)", borderColor: "var(--brand)", color: "#0a0c10" }
                      : undefined
                  }
                  onClick={() =>
                    onChange({ ...scenario, time: { mode: opt.value, customHourUtc: scenario.time.customHourUtc } })
                  }
                >
                  {opt.label}
                </button>
              );
            })}
            {scenario.time.mode === "custom" && (
              <>
                <label htmlFor="scenario-hour" className="eyebrow" style={{ marginLeft: "0.15rem" }}>
                  Hour
                </label>
                <select
                  id="scenario-hour"
                  value={scenario.time.customHourUtc ?? DEFAULT_CUSTOM_HOUR_UTC}
                  onChange={(e) =>
                    onChange({ ...scenario, time: { mode: "custom", customHourUtc: Number(e.target.value) } })
                  }
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00 UTC
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: "0.55rem" }}>
            <label htmlFor="scenario-tier">Service tier</label>
          </div>
          <select
            id="scenario-tier"
            value={scenario.serviceTier}
            onChange={(e) => onChange({ ...scenario, serviceTier: e.target.value as Scenario["serviceTier"] })}
          >
            {SERVICE_TIER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn"
          style={{ fontSize: "0.8rem", marginLeft: "auto" }}
          onClick={() => onChange(DEFAULT_SCENARIO)}
        >
          Reset to now
        </button>
      </div>
      <p style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.8rem" }}>
        Rows with a rate that changes by time of day, promo window or service tier are priced for this scenario
        instead of their flat listed rate; a brand-colored label under the model name names which one applies.
        Context size for band-priced rows uses the input-token count below.
      </p>
      <p style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.4rem" }}>
        Picking a specific hour also previews time-of-day rates that are scheduled but have not started billing yet;
        those rows are labelled <span className="mono scenario-preview">· preview</span> with their start instant.{" "}
        <span className="mono">Now</span> only ever shows rates that are billable at this moment.
      </p>
    </div>
  );
}
