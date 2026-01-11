import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

export default function App() {
  const [wallet, setWallet] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [etherscanTx, setEtherscanTx] = useState(null);

  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const [showWalletToast, setShowWalletToast] = useState(false);
  const [showApproveToast, setShowApproveToast] = useState(false);

  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState("");

  const [showConfetti, setShowConfetti] = useState(false);

  const [showWalletMenu, setShowWalletMenu] = useState(false);

  /* ---------------- WALLET ---------------- */

  async function connectWallet() {
    try {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWallet(address);
      setShowWalletToast(true);
      setTimeout(() => setShowWalletToast(false), 3000);
    } catch {
      setSendError("Wallet connection failed");
    }
  }

  function disconnectWallet() {
    setWallet("");
    setIsApproved(false);
    setRecipient("");
    setAmount("");
    setEtherscanTx(null);
    setShowWalletMenu(false);
  }

  /* ---------------- APPROVE ---------------- */

  async function approveUSDC() {
    try {
      setIsApproving(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const usdc = new ethers.Contract(
        "0x1B5336949072F738D31Bc650B7723DAcc0bb3659",
        ["function approve(address,uint256) returns (bool)"],
        signer
      );

      const tx = await usdc.approve(
        "0x7632C8C0b1C1B35E3F634A7fe642362B561D2c78",
        ethers.parseUnits("1000", 6)
      );

      await tx.wait();

      setIsApproved(true);
      setShowApproveToast(true);
      setTimeout(() => setShowApproveToast(false), 3000);
    } catch {
      setSendError("Approval failed");
    } finally {
      setIsApproving(false);
    }
  }

  /* ---------------- SEND ---------------- */

  async function sendUSDC() {
    try {
      setIsSending(true);
      setSendError("");
      setSendSuccess(false);
      setEtherscanTx(null);

      const res = await fetch("http://localhost:3000/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: wallet, recipient, amount }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEtherscanTx(data.etherscanTx);
      setSendSuccess(true);
      setShowConfetti(true);

      setTimeout(() => setShowConfetti(false), 3000);
    } catch (e) {
      setSendError(e.message || "Transaction failed");
    } finally {
      setIsSending(false);
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-dark text-white px-6 py-6 relative">


        {showConfetti && <Confetti recycle={false} />}

        {/* ---------- OVERLAYS ---------- */}
        <AnimatePresence>
          {isApproving && (
            <Overlay
              title="Approval in progress…"
              subtitle="Please confirm in MetaMask"
            />
          )}
          {isSending && (
            <Overlay
              title="Sending transaction…"
              subtitle="Instapay is handling gas for you"
            />
          )}
        </AnimatePresence>

        {/* ---------- SUCCESS MODAL ---------- */}
        <AnimatePresence>
          {sendSuccess && (
            <SuccessModal
              etherscanTx={etherscanTx}
              onClose={() => setSendSuccess(false)}
            />
          )}
        </AnimatePresence>

        {/* ---------- TOASTS ---------- */}
        <AnimatePresence>
          {showWalletToast && <Toast message="Wallet connected successfully" />}
          {showApproveToast && <Toast message="USDC approved successfully" />}
          {sendError && <Toast message={sendError} error />}
        </AnimatePresence>

        {/* ---------- NAVBAR ---------- */}
        <header className="flex items-center justify-between max-w-6xl mx-auto mb-16 relative">
          <h1 className="text-xl font-bold tracking-wide">⚡ Instapay</h1>

          <div className="flex items-center gap-4">

            {!wallet ? (
              <button
                onClick={connectWallet}
                className="bg-brand px-4 py-2 rounded-lg font-medium hover:opacity-90 transition"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="relative">
                <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center gap-2 bg-card px-4 py-2 rounded-full 
                          border border-neutral-800 hover:border-brand 
                          transition text-sm"
              >
                <span>
                  {wallet.slice(0, 6)}…{wallet.slice(-4)}
                </span>

                <span className="opacity-60">↗</span>
              </button>


                <AnimatePresence>
                  {showWalletMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 bg-card border border-neutral-800 rounded-xl p-3 z-50"
                    >
                      <button
                        onClick={disconnectWallet}
                        className="text-sm text-red-400 hover:underline"
                      >
                        Disconnect
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        {/* ---------- HERO ---------- */}
        <section className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Gasless <span className="text-brand">Stablecoin</span> Transfers
          </h2>
          <p className="opacity-70">
            Send USDC without holding ETH. Instapay covers the gas for you.
          </p>
        </section>

        {/* ---------- CARD ---------- */}
        <main className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-8 w-full max-w-xl"
          >
            <h3 className="text-lg font-semibold mb-6">Transfer USDC</h3>

            <input
              placeholder="Recipient address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full mb-4 p-3 rounded-lg bg-black border border-neutral-800 focus:outline-none"
            />

            <input
              placeholder="Amount (USDC)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mb-6 p-3 rounded-lg bg-black border border-neutral-800 focus:outline-none"
            />

            {!isApproved ? (
              <button
                onClick={approveUSDC}
                disabled={!wallet}
                className="w-full mb-3 py-3 rounded-lg bg-neutral-700 hover:bg-neutral-600 transition"
              >
                Approve USDC
              </button>
            ) : (
              <div className="mb-3 text-green-400">✓ USDC Approved</div>
            )}

            <button
              onClick={sendUSDC}
              disabled={!wallet || !isApproved || !amount || !recipient}
              className="w-full py-3 rounded-lg bg-brand disabled:opacity-40 hover:opacity-90 transition"
            >
              Send with Instapay →
            </button>
          </motion.div>
        </main>

        {/* ---------- FOOTER ---------- */}
        <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs opacity-50">
          Made with ❤️ by <span className="font-medium">Zenithra</span>
        </footer>
      </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Overlay({ title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-card px-10 py-8 rounded-2xl text-center shadow-xl"
      >
        <div className="mb-4 animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full mx-auto"></div>
        <p className="text-lg font-medium">{title}</p>
        <p className="text-sm opacity-60 mt-1">{subtitle}</p>
      </motion.div>
    </motion.div>
  );
}

function SuccessModal({ etherscanTx, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-card px-10 py-8 rounded-2xl text-center shadow-xl"
      >
        <div className="text-green-400 text-4xl mb-3">🎉</div>
        <h3 className="text-xl font-semibold mb-2">
          Transaction Successful
        </h3>
        <p className="opacity-70 mb-4">
          Your USDC was sent successfully.
        </p>

        {etherscanTx && (
          <a
            href={etherscanTx}
            target="_blank"
            rel="noreferrer"
            className="block text-blue-400 hover:underline mb-4"
          >
            View on Etherscan
          </a>
        )}

        <button
          onClick={onClose}
          className="bg-brand px-6 py-2 rounded-lg hover:opacity-90 transition"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

function Toast({ message, error }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-6 right-6 px-6 py-3 rounded-xl shadow-xl z-50
        ${error ? "bg-red-500/90" : "bg-card border border-neutral-800"}`}
    >
      {error ? "❌ " : "✅ "} {message}
    </motion.div>
  );
}
