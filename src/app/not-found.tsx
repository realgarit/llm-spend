import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="container-page"
      style={{ paddingBlock: "6rem", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "1rem", minHeight: "50vh" }}
    >
      <div className="mono" style={{ color: "var(--brand)", fontSize: "3rem", fontWeight: 700, letterSpacing: "-0.03em" }}>
        404
      </div>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 600 }}>No line item here</h1>
      <p style={{ color: "var(--text-muted)", maxWidth: "30rem" }}>
        That page isn&rsquo;t on the ledger. Head back to the pricing reference.
      </p>
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
        <Link href="/" className="btn btn-primary">Home</Link>
        <Link href="/compare" className="btn">Compare models</Link>
      </div>
    </div>
  );
}
