"use client";

import { useState, useEffect, type FormEvent } from "react";

type Audit = {
  summary: string;
  hauntings: {
    title: string;
    priority: "High" | "Medium" | "Low";
    evidence: string;
    explanation: string;
    fix: string;
  } [];
  rewrite: {
    headline: string;
    introduction: string;
    callToAction: string;
  };
};

type SavedAudit = {
  businessType: string;
  audience: string;
  websiteCopy: string;
  audit: Audit;
};

const STORAGE_KEY = "haunt-audit-latest";

const hauntings = [
  {
    icon: "🪦",
    title: "Buried information",
    description:
      "Uncover the details visitors need but your copy leaves out.",
  },
  {
    icon: "👻",
    title: "Ghosted visitors",
    description:
      "Find unclear calls to action that leave people wondering what to do.",
  },
  {
    icon: "🕸️",
    title: "Cobweb copy",
    description:
      "Clear away vague wording and explain what makes your business useful.",
  },
];

export default function Home() {
  const [businessType, setBusinessType] = useState("");
  const [audience, setAudience] = useState("");
  const [websiteCopy, setWebsiteCopy] = useState("");
  const [ error, setError] = useState("");

  const [audit, setAudit] = useState<Audit | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    try{
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) return;

      const saved: SavedAudit = JSON.parse(stored);

      if (
        typeof saved.businessType !== "string" ||
        typeof saved.audience !== "string" ||
        typeof saved.websiteCopy !== "string" ||
        !saved.audit ||
        typeof saved.audit.summary !== "string" ||
        !Array.isArray(saved.audit.hauntings) ||
        !saved.audit.hauntings.every(
          (item) =>
            item &&
          typeof item.title === "string" &&
          ["High", "Medium", "Low"].includes(item.priority) &&
          typeof item.evidence === "string" &&
          typeof item.explanation === "string" &&
          typeof item.fix === "string"
        ) ||
        !saved.audit.rewrite ||
        typeof saved.audit.rewrite.headline !== "string" ||
        typeof saved.audit.rewrite.introduction !== "string" ||
        typeof saved.audit.rewrite.callToAction !== "string"
      ) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      setBusinessType(saved.businessType);
      setAudience(saved.audience);
      setWebsiteCopy(saved.websiteCopy);
      setAudit(saved.audit);
      } catch {
        // The app can still work if browser storage is unavailable.
      }
    }, []);
  

   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) return;

    setError("");
    setAudit(null);
    setCopyMessage("");

    const cleanedBusinessType = businessType.trim();
    const cleanedAudience = audience.trim();
    const cleanedCopy = websiteCopy.trim();

    if (!cleanedBusinessType || !cleanedAudience || !cleanedCopy){
      setError("Please complete all three fields.");
      return;
    }

    if (cleanedCopy.length < 50){
      setError("Please enter at least 50 characters of website copy.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessType: cleanedBusinessType,
          audience: cleanedAudience,
          websiteCopy: cleanedCopy,
        }),
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `The server returned HTTP ${response.status} instead of JSON.`
        );
      }

      const data = await response.json();

      if(!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setAudit(data);

      try {
        const saved: SavedAudit = {
          businessType: cleanedBusinessType,
          audience: cleanedAudience,
          websiteCopy: cleanedCopy,
          audit: data,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch {
        // Keep the generated audit visible if saving fails.
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not reach the server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }
  
    async function copyRewrite() {
      if(!audit) return

      const text = [
        audit.rewrite.headline,
        audit.rewrite.introduction,
        audit.rewrite.callToAction,
      ].join("\n\n");

      try {
        await navigator.clipboard.writeText(text);
        setCopyMessage("Copied to clipboard!");
      } catch {
        setCopyMessage(
          "Could not copy automatically. Please select and copy the text."
        )
      }
    }
    function loadExample() {
      setBusinessType("Local gardening business");
      setAudience("Homeowners on the Gold Coast");
      setWebsiteCopy(
        "Welcome to Green Gardens. We offer quality solutions for all your outdoor needs. Our team goes above and beyond to deliver great results. We do lawn mowing, hedge trimming and garden clean-ups. Contact us for more information."
      );

      setAudit(null);
      setError("");
      setCopyMessage("");
    }
  


  function clearSavedAudit() {
    if (isLoading) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Clear the form even when browser storage is unavailable.
    }

    setBusinessType("");
    setAudience("");
    setWebsiteCopy("");
    setAudit(null);
    setError("");
    setCopyMessage("");
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a
            href="/"
            className="flex items-center gap-3 text-xl font-bold tracking-tight"
          >
            <span aria-hidden="true">👻</span>
            Haunt Audit
          </a>

          <span className="rounded-full border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-xs font-medium text-purple-200">
            Website copy inspector
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-lime-300">
            Something lurking in your website copy?
          </p>

          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Find what’s
            <span className="text-purple-400"> haunting </span>
            your website.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Reveal confusing wording, missing details and unclear next steps.
            Then bring your copy back to life.
          </p>
        </section>

        <section
          aria-labelledby="audit-heading"
          className="mt-12 grid items-start gap-8 lg:grid-cols-3"
        >
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:col-span-2">
            <h2 id="audit-heading" className="text-2xl font-semibold">
              Summon your audit
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Tell us who you help, then paste the copy you want inspected.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <button
                type="button"
                onClick={loadExample}
                disabled={isLoading}
                className="rounded-xl border border-purple-400/30 px-4 py-2 text-sm font-medium text-purple-200 transition-colors hover:bg-purple-400/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Try an example
              </button>

              <button
                type="button"
                onClick={clearSavedAudit}
                disabled={isLoading}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear audit
              </button>

              <p className="text-xs text-zinc-500">
                Your latest successful audit is saved in this browser. Clear audit removes it.
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="businessType"
                    className="mb-2 block text-sm font-medium text-zinc-200"
                  >
                    Business type
                  </label>

                  <input
                    id="businessType"
                    name="businessType"
                    type="text"
                    placeholder="e.g. Local electrician"
                    value={businessType}
                    onChange={(event) => setBusinessType(event.target.value)}
                    maxLength={100}
                    required
                    className="w-full rounded-xl border border-white/15 bg-zinc-950 px-4 py-3 text-base placeholder:text-zinc-600 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="audience"
                    className="mb-2 block text-sm font-medium text-zinc-200"
                  >
                    Target audience
                  </label>

                  <input
                    id="audience"
                    name="audience"
                    type="text"
                    placeholder="e.g. Homeowners in Gold Coast"
                    value={audience}
                    onChange={(event) => setAudience(event.target.value)}
                    maxLength={200}
                    required
                    className="w-full rounded-xl border border-white/15 bg-zinc-950 px-4 py-3 text-base placeholder:text-zinc-600 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="websiteCopy"
                  className="mb-2 block text-sm font-medium text-zinc-200"
                >
                  Website copy
                </label>

                <textarea
                  id="websiteCopy"
                  name="websiteCopy"
                  rows={9}
                  maxLength={5000}
                  required
                  aria-describedby="copy-help"
                  value={websiteCopy}
                  onChange={(event) => setWebsiteCopy(event.target.value)}
                  placeholder="Paste your headline, introduction, service description or other website text..."
                  className="w-full resize-y rounded-xl border border-white/15 bg-zinc-950 px-4 py-3 text-base leading-relaxed placeholder:text-zinc-600 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
                />

                <p id="copy-help" className="mt-2 flex justify-between gap-4 text-xs text-zinc-500">
                  <span>Only paste public marketing copy.</span>
                  <span>{websiteCopy.length.toLocaleString()} / 5,000</span>
                </p>
              </div>

              {error && (
                <p
                role="alert"
                className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200"
                >
                  {error}
                </p>
              )}

              <button type="submit" disabled={isLoading}
                    className="w-full rounded-xl bg-lime-300 px-6 py-4 font-bold text-zinc-950
                      transition-colors hover:bg-lime-200 focus-visible:outline-2 
                      focus-visible:outline-offset-4 focus-visible:outline-lime-300
                      disabled:cursor-wait disabled:opacity-60"
              >
                {isLoading ? "Inspecting your copy..." : "Reveal the Hauntings 👻"}
              </button>

              <p className="text-center text-xs text-zinc-500">
                Your text is sent to OpenRouter and its model provider to generate this
                audit. Only submit public marketing copy.
              </p>
            </form>

            {audit && (
  <section
    aria-labelledby="results-heading"
    aria-live="polite"
    className="mt-8 space-y-6"
  >
    <div>
      <h3 id="results-heading" className="text-2xl font-bold">
        Your hauntings revealed 👻
      </h3>

      <p className="mt-3 leading-relaxed text-zinc-300">
        {audit.summary}
      </p>
    </div>

        {audit.hauntings.map((haunting, index) => (
          <article
            key={`${index}-${haunting.title}`}
            className="rounded-2xl border border-purple-400/25 bg-purple-400/5 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-purple-200">
                {haunting.title}
              </h4>

              <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium">
                {haunting.priority} priority
              </span>
            </div>

            <blockquote className="mt-4 border-l-2 border-purple-400 pl-4 text-sm italic text-zinc-400">
              “{haunting.evidence}”
            </blockquote>

            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              {haunting.explanation}
            </p>

            <p className="mt-3 text-sm leading-relaxed text-lime-200">
              <span className="font-semibold">The fix: </span>
              {haunting.fix}
            </p>
          </article>
        ))}

        <div className="rounded-2xl border border-lime-300/25 bg-lime-300/5 p-5">
          <h3 className="text-xl font-semibold text-lime-200">
            Bring your copy back to life ✨
          </h3>

          <dl className="mt-5 space-y-5">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Headline
              </dt>
              <dd className="mt-2 text-xl font-bold">
                {audit.rewrite.headline}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Introduction
              </dt>
              <dd className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {audit.rewrite.introduction}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Call to action
              </dt>
              <dd className="mt-2 font-medium text-lime-200">
                {audit.rewrite.callToAction}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={copyRewrite}
            className="mt-6 rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-zinc-950 transition-colors hover:bg-lime-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
          >
            Copy improved copy
          </button>

          <p role="status" className="mt-3 text-sm text-lime-200">
            {copyMessage}
          </p>


          <p className="mt-5 text-xs leading-relaxed text-zinc-400">
            Review before publishing. Replace bracketed placeholders with
            confirmed business details.
          </p>
        </div>
      </section>
    )}
    </div>

          <aside className="space-y-4">
            <h2 className="mb-5 text-lg font-semibold">
              What’s hiding in your copy?
            </h2>

            {hauntings.map((haunting) => (
              <div
                key={haunting.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <span aria-hidden="true" className="text-2xl">
                  {haunting.icon}
                </span>

                <h3 className="mt-3 font-semibold text-purple-200">
                  {haunting.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {haunting.description}
                </p>
              </div>
            ))}

            <p className="px-1 text-xs leading-relaxed text-zinc-500">
              We inspect the text you provide. This audit won’t check page speed,
              accessibility or technical SEO.
            </p>
          </aside>
        </section>

        <footer className="mt-16 border-t border-white/10 pt-6 text-center text-sm text-zinc-500">
          Haunt Audit · Bring your website copy back to life.
        </footer>
      </div>
    </main>
  );
}

