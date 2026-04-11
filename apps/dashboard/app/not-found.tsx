import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-[420px]">
        {/* Graphic */}
        <div className="relative">
          <p
            className="font-mono font-bold text-[var(--bg-tertiary)] select-none"
            style={{ fontSize: "clamp(80px, 20vw, 140px)", lineHeight: 1 }}
            aria-hidden="true"
          >
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-2xl bg-purple-500/15 flex items-center justify-center">
              <span className="text-[28px] font-bold text-purple-400">M</span>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <p className="text-[22px] font-semibold text-[var(--text-primary)]">
            Page not found
          </p>
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="h-10 px-6 rounded-lg text-[14px] font-semibold text-white bg-purple-500 hover:bg-purple-600 transition-colors duration-150 inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
