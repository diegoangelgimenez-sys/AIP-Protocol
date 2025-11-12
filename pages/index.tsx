import React, { useEffect, useState } from 'react';

const MOCK_REGISTRY_KEY = 'aip:mock_registry';

function randomSeed() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function sha256Hex(message: string) {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function Home() {
  const [seed, setSeed] = useState<string>('');
  const [hash, setHash] = useState<string>('');
  const [registered, setRegistered] = useState<boolean>(false);
  const [verification, setVerification] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(1000);

  useEffect(() => {
    setSeed(randomSeed());
  }, []);

  useEffect(() => {
    const reg = JSON.parse(localStorage.getItem(MOCK_REGISTRY_KEY) || '[]');
    setRegistered(reg.includes(hash));
  }, [hash]);

  async function handleGenerateProof() {
    setLoading(true);
    try {
      const nonce = randomSeed();
      const combined = `${seed}::${nonce}`;
      const h = await sha256Hex(combined);
      const anonId = '0x' + h.slice(0, 40);
      setHash(anonId);
      setVerification(null);
    } finally {
      setLoading(false);
    }
  }

  function handleRegisterOnChainMock() {
    if (!hash) return alert('Generate a proof first');
    if (balance < 1) return alert('Insufficient $AID (demo)');
    const reg = JSON.parse(localStorage.getItem(MOCK_REGISTRY_KEY) || '[]');
    if (!reg.includes(hash)) reg.push(hash);
    localStorage.setItem(MOCK_REGISTRY_KEY, JSON.stringify(reg));
    setRegistered(true);
    setBalance(prev => Math.max(0, prev - 1));
  }

  function handleVerifyWithDappMock() {
    setLoading(true);
    setTimeout(() => {
      const reg = JSON.parse(localStorage.getItem(MOCK_REGISTRY_KEY) || '[]');
      const ok = reg.includes(hash);
      setVerification(ok ? 'VALID' : 'INVALID');
      setLoading(false);
    }, 700);
  }

  function copyHash() {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white p-6 flex items-center justify-center relative overflow-hidden">
      <div className="particles" aria-hidden />
      <div className="max-w-4xl w-full bg-gradient-to-b from-slate-900/80 to-slate-900/60 rounded-2xl p-8 shadow-2xl border border-slate-800 backdrop-blur-sm">
        <header className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-tr from-aipcyan to-aipblue rounded-xl shadow-lg glow pulse">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3c3.866 0 7 3.134 7 7s-3.134 7-7 7-7-3.134-7-7 3.134-7 7-7z" fill="rgba(255,255,255,0.06)"/>
              <path d="M6 20c2 0 3.5-3 6-3s4 3 6 3" stroke="#ffffff" strokeOpacity="0.95" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-semibold">AIP — Anonymous Identity Protocol</h1>
            <p className="text-slate-400 mt-1">Privacy is your ID · Web3 identity layer</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm text-slate-400">Mock $AID balance</div>
            <div className="font-medium text-sky-300 text-lg">{balance} $AID</div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-slate-800/60 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-3">1 — Generate anonymous identity</h2>
            <p className="text-slate-400 text-sm mb-4">Simulates local ZK-like proof generation by hashing a local seed + nonce.</p>

            <label className="block text-slate-300 text-sm mb-2">Local seed</label>
            <input value={seed} onChange={e => setSeed(e.target.value)} className="w-full bg-slate-900/40 border border-slate-700 rounded px-3 py-2 mb-3 outline-none" />

            <div className="flex gap-2">
              <button onClick={() => setSeed(randomSeed())} className="px-3 py-2 rounded bg-slate-700/80 hover:bg-slate-700">Randomize</button>
              <button onClick={handleGenerateProof} className="px-3 py-2 rounded bg-sky-500 hover:brightness-105 text-black font-semibold">{loading ? 'Generating...' : 'Generate Proof'}</button>
            </div>

            <div className="mt-4">
              <div className="text-slate-400 text-sm mb-1">Anonymous ID</div>
              <div className="bg-slate-900/30 border border-slate-700 rounded p-3 flex items-center justify-between">
                <code className="font-mono text-sm break-all">{hash || <span className="text-slate-600">(none)</span>}</code>
                <button onClick={copyHash} className="text-slate-400 text-sm">Copy</button>
              </div>

              <div className="mt-3 flex gap-2">
                <button onClick={handleRegisterOnChainMock} className="px-3 py-2 rounded bg-emerald-500 text-black font-semibold">Register (1 $AID)</button>
                <button onClick={handleVerifyWithDappMock} className="px-3 py-2 rounded bg-indigo-600">Verify</button>
              </div>

              <div className="mt-3 text-sm">
                <div>Registered: <span className={`font-medium ${registered ? 'text-emerald-300' : 'text-slate-500'}`}>{registered ? 'Yes' : 'No'}</span></div>
                <div>Verification: <span className="font-medium text-slate-300">{verification ?? '-'}</span></div>
              </div>
            </div>
          </section>

          <aside className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 flex flex-col gap-4">
            <h2 className="text-xl font-semibold mb-2">2 — AIP Integration</h2>
            <ol className="list-decimal list-inside text-slate-400 space-y-2">
              <li>Users create local anonymous proofs.</li>
              <li>dApps verify without personal data.</li>
              <li>Validators stake tokens and earn fees.</li>
            </ol>
            <div className="p-3 mt-auto rounded bg-slate-900/40 border border-slate-700 text-center">
              <div className="text-xs text-slate-400">Token</div>
              <div className="text-lg font-semibold text-sky-300">$AID</div>
            </div>
          </aside>
        </main>

        <footer className="mt-6 text-sm text-slate-500 text-center">AIP — Privacy is your ID</footer>
      </div>
    </div>
  );
}
