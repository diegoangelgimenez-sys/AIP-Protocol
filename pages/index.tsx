import { sign } from "crypto";
import React, { useEffect, useState } from "react";

const MOCK_REGISTRY_KEY = "aip:mock_registry";

function randomSeed() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function sha256Hex(message: string) {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function Home() {
  const [seed, setSeed] = useState("");
  const [hash, setHash] = useState("");
  const [registered, setRegistered] = useState(false);
  const [verification, setVerification] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(1000);

  useEffect(() => {
    setSeed(randomSeed());
  }, []);

  useEffect(() => {
    const reg = JSON.parse(localStorage.getItem(MOCK_REGISTRY_KEY) || "[]");
    setRegistered(reg.includes(hash));
  }, [hash]);

  async function handleGenerateProof() {
    setLoading(true);
    try {
      const nonce = randomSeed();
      const combined = `${seed}::${nonce}`;
      const h = await sha256Hex(combined);
      const anonId = "0x" + h.slice(0, 40);
      setHash(anonId);
      setVerification(null);
    } finally {
      setLoading(false);
    }
  }

  function handleRegister() {
    if (!hash) return alert("Generate a proof first");

    if (balance < 1) return alert("Insufficient balance");

    const reg = JSON.parse(localStorage.getItem(MOCK_REGISTRY_KEY) || "[]");
    if (!reg.includes(hash)) reg.push(hash);

    localStorage.setItem(MOCK_REGISTRY_KEY, JSON.stringify(reg));

    setRegistered(true);
    setBalance((prev) => Math.max(0, prev - 1));
  }

  function handleVerify() {
    setLoading(true);
    setTimeout(() => {
      const reg = JSON.parse(localStorage.getItem(MOCK_REGISTRY_KEY) || "[]");
      const ok = reg.includes(hash);
      setVerification(ok ? "VALID" : "INVALID");
      setLoading(false);
    }, 600);
  }

  function copyHash() {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
  }

  return (
    <div className="min-h-screen relative text-white px-6 py-10 flex flex-col items-center">
      <div className="particles" />

      <div className="max-w-5xl w-full section-fade relative z-10">
        <header className="mb-10 flex justify-between items-center">
          <h1 className="text-3xl font-bold glow-soft">
            AIP — Anonymous Identity Protocol
          </h1>

          <div className="text-right">
            <div className="text-sm text-slate-400">Mock $AID balance</div>
            <div className="text-sky-300 text-xl font-semibold">
              {balance} $AID
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="card rounded-xl p-6 section-fade">
            <h2 className="text-xl font-semibold mb-3">
              1 — Generate anonymous identity
            </h2>

            <label className="block text-slate-300 text-sm mb-1">
              Local seed
            </label>
            <input
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="w-full rounded px-3 py-2 mb-3 outline-none"
            />

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setSeed(randomSeed())}
                className="px-3 py-2 rounded bg-slate-600 hover:bg-slate-500 transition"
              >
                Randomize
              </button>

              <button
                onClick={handleGenerateProof}
                className="px-3 py-2 rounded bg-sky-500 hover:brightness-110 text-black font-semibold"
              >
                {loading ? "Generating..." : "Generate Proof"}
              </button>
            </div>

            <div>
              <div className="text-slate-400 text-sm mb-1">Anonymous ID</div>
              <div className="bg-slate-900/40 border border-slate-700 rounded p-3 flex justify-between items-center mb-3">
                <code className="font-mono text-sm break-all">
                  {hash || <span className="text-slate-600">(none)</span>}
                </code>

                <button
                  onClick={copyHash}
                  className="text-slate-300 text-sm hover:text-white"
                >
                  Copy
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRegister}
                  className="px-3 py-2 rounded bg-emerald-500 text-black font-semibold"
                >
                  Register (1 $AID)
                </button>

                <button
                  onClick={handleVerify}
                  className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 transition"
                >
                  Verify
                </button>
              </div>

              <div className="mt-3 text-sm">
                <div>
                  Registered:{" "}
                  <span
                    className={
                      registered ? "text-emerald-300" : "text-slate-500"
                    }
                  >
                    {registered ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  Verification:{" "}
                  <span className="text-slate-300">
                    {verification ?? "-"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <aside className="card rounded-xl p-6 section-fade">
            <h2 className="text-xl font-semibold mb-3">2 — AIP Integration</h2>
            <ol className="list-decimal list-inside text-slate-300 space-y-2">
              <li>Users create anonymous proofs.</li>
              <li>dApps verify without exposing personal data.</li>
              <li>Validators stake tokens and earn fees.</li>
            </ol>

            <div className="mt-6 p-4 text-center rounded bg-slate-900/50 border border-slate-700">
              <div className="text-xs text-slate-400">Token</div>
              <div className="text-sky-300 text-xl font-semibold">$AID</div>
            </div>
          </aside>
        </main>

        <footer className="text-center mt-10 text-slate-500 text-sm">
          AIP — Privacy is your ID
        </footer>
      </div>
    </div>
  );
}
