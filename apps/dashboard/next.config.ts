import type { NextConfig } from "next";

// typescript.ignoreBuildErrors was set here (commit 87f8090 "skip typescript
// build errors"). It is removed deliberately: a CI job that typechecks while the
// app ships with typechecking disabled verifies nothing, and the errors it was
// hiding were real — the EVM-shaped types leaking through the UI.
const nextConfig: NextConfig = {};

export default nextConfig;
