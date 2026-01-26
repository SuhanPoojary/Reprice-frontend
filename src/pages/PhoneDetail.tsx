import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { fetchSearchPhonesRaw } from "@/lib/phoneSearchApi";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Box,
  HardDrive,
  Smartphone,
  DollarSign,
  Info,
  Loader2,
} from "lucide-react";

const STEPS = [
  { id: 1, name: "Variant", icon: HardDrive },
  { id: 2, name: "Condition", icon: Smartphone },
  { id: 3, name: "Final Quote", icon: DollarSign },
];

/**
 * Safely format a number as currency, handling null/undefined/NaN
 */
const formatPrice = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  const numValue = Number(value);
  if (!isFinite(numValue)) {
    return "0";
  }

  return Math.round(numValue).toLocaleString("en-IN");
};

const API_BASE_URL = (import.meta.env.VITE_AI_API_URL as string | undefined) ??
  "https://reprice-ml3.onrender.com";

const AI_FALLBACK_URL = "https://reprice-ml3.onrender.com";

type BackendStatus = "unknown" | "ready" | "initializing" | "down";

type VariantOption = {
  key: string;
  rawVariant: string;
  ramGb?: number;
  storageGb?: number;
  price: number;
};

function formatVariant(variant: unknown): string | undefined {
  if (typeof variant !== "string") return undefined;
  const raw = variant.trim();
  if (!raw || raw === "N/A") return undefined;

  const compactGb = raw
    .replace(/\s+/g, "")
    .match(/^(\d+)(GB)?\/(\d+)(GB)?$/i);
  if (compactGb) return `${compactGb[1]}/${compactGb[3]}`;

  return raw;
}

function parseVariantToRamStorageGb(variant: string): { ramGb?: number; storageGb?: number } {
  const raw = String(variant || "").trim();
  if (!raw) return {};

  const compact = raw.replace(/\s+/g, "");
  const matchPair = compact.match(/^(\d+)(GB)?\/(\d+)(GB)?$/i);
  if (matchPair) {
    const ramGb = Number(matchPair[1]);
    const storageGb = Number(matchPair[3]);
    return {
      ramGb: Number.isFinite(ramGb) ? ramGb : undefined,
      storageGb: Number.isFinite(storageGb) ? storageGb : undefined,
    };
  }

  const matchStorageOnly = compact.match(/^(\d+)(GB)?$/i);
  if (matchStorageOnly) {
    const storageGb = Number(matchStorageOnly[1]);
    return { storageGb: Number.isFinite(storageGb) ? storageGb : undefined };
  }

  return {};
}

function normalizeModelText(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function stripBrandPrefix(model: string, brand: string) {
  const m = String(model || "").trim();
  const b = String(brand || "").trim();
  if (!m || !b) return m;
  if (m.toLowerCase().startsWith(b.toLowerCase())) {
    return m.slice(b.length).trim();
  }
  return m;
}

function variantLabel(option: Pick<VariantOption, "ramGb" | "storageGb" | "rawVariant">): string {
  if (typeof option.ramGb === "number" && typeof option.storageGb === "number") {
    return `${option.ramGb}GB RAM / ${option.storageGb}GB`;
  }
  if (typeof option.storageGb === "number") {
    return `${option.storageGb}GB`;
  }
  return option.rawVariant;
}

function createPlaceholderSvgDataUri(label: string): string {
  const safe = String(label || "Phone").slice(0, 40);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="36" fill="url(#g)"/>
  <rect x="120" y="70" width="160" height="260" rx="26" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)"/>
  <circle cx="200" cy="100" r="7" fill="rgba(255,255,255,0.55)"/>
  <text x="200" y="355" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="22" fill="white" text-anchor="middle" opacity="0.95">${safe}</text>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function PhoneDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const passedPhone = location.state?.phoneData;

  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [selectedVariantKey, setSelectedVariantKey] = useState<string>("");
  const [isVariantLoading, setIsVariantLoading] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedScreenCondition, setSelectedScreenCondition] = useState("");
  const [deviceTurnsOn, setDeviceTurnsOn] = useState<string>("");
  const [hasOriginalBox, setHasOriginalBox] = useState<string>("");
  const [hasOriginalBill, setHasOriginalBill] = useState<string>("");
  const [isUnderWarranty, setIsUnderWarranty] = useState<string>("");
  const [apiPrice, setApiPrice] = useState<number | null>(null);
  const [apiBasePrice, setApiBasePrice] = useState<number | null>(null);
  const [apiLogs, setApiLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("unknown");
  const [backendError, setBackendError] = useState<string | null>(null);
  const [pricingSupported, setPricingSupported] = useState(true);
  const [pricingRetryAttempt, setPricingRetryAttempt] = useState(0);
  const pricingRetryAttemptRef = useRef(0);
  const pricingRetryTimeoutRef = useRef<number | null>(null);
  const lastQuoteKeyRef = useRef<string | null>(null);

  const [aiBaseUrl, setAiBaseUrl] = useState(() => {
    try {
      const cached = localStorage.getItem("reprice.aiBaseUrl.v1");
      if (
        cached &&
        typeof cached === "string" &&
        !cached.includes("reprice-ml-backend.onrender.com")
      ) {
        return cached;
      }
    } catch {
      // ignore
    }

    // If env points to the /search-only backend, fall back automatically.
    if (API_BASE_URL.includes("reprice-ml-backend.onrender.com")) {
      return AI_FALLBACK_URL;
    }

    return API_BASE_URL;
  });

  const pricingSupportKey = `reprice.aiPricingSupported.v1.${aiBaseUrl}`;

  type PassedVariant = { variant: string; price: number };
  const passedVariants = (passedPhone as any)?.variants as PassedVariant[] | undefined;

  if (!passedPhone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Phone not found</p>
          <Button onClick={() => navigate("/")}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  const phone = {
    id: passedPhone.id,
    name: passedPhone.name,
    brand: passedPhone.brand,
    variant: passedPhone.variant,
    image:
      passedPhone.image ||
      createPlaceholderSvgDataUri(`${passedPhone.brand} ${passedPhone.name}`),
    releaseYear: 2023,
    description: `Sell your ${passedPhone.name} for the best price.`,
    basePrice: passedPhone.maxPrice || 0,
    screenConditions: [
      {
        id: "good",
        name: "Good",
        description: "No scratches, pristine condition",
        priceAdjustment: 0,
      },
      {
        id: "minor-scratches",
        name: "Minor Scratches",
        description: "Light scratches, barely visible",
        priceAdjustment: -Math.round((passedPhone.maxPrice || 0) * 0.1),
      },
      {
        id: "major-scratches",
        name: "Major Scratches",
        description: "Visible scratches across screen",
        priceAdjustment: -Math.round((passedPhone.maxPrice || 0) * 0.25),
      },
      {
        id: "cracked",
        name: "Cracked",
        description: "Screen has cracks but functional",
        priceAdjustment: -Math.round((passedPhone.maxPrice || 0) * 0.5),
      },
      {
        id: "shattered",
        name: "Shattered",
        description: "Severely damaged screen",
        priceAdjustment: -Math.round((passedPhone.maxPrice || 0) * 0.75),
      },
    ],
  };

  // Fetch variants for this model and let user choose RAM/Storage.
  useEffect(() => {
    let cancelled = false;

    const initVariants = async () => {
      const brand = String(passedPhone?.brand ?? "").trim();
      const fullName = String(passedPhone?.name ?? "").trim();
      const currentVariant = formatVariant(passedPhone?.variant) ?? "";
      const currentPrice = Number(passedPhone?.maxPrice ?? 0) || 0;

      if (!brand || !fullName) return;

      // If Sell page provided variants, prefer those (no network dependency).
      if (Array.isArray(passedVariants) && passedVariants.length > 0) {
        const map = new Map<string, VariantOption>();
        for (const v of passedVariants) {
          const raw = formatVariant(v?.variant) ?? "";
          const price = Number(v?.price ?? 0) || 0;
          if (!raw || !Number.isFinite(price) || price <= 0) continue;
          const { ramGb, storageGb } = parseVariantToRamStorageGb(raw);
          const key = raw.toLowerCase();
          const existing = map.get(key);
          if (!existing || price > existing.price) {
            map.set(key, { key, rawVariant: raw, ramGb, storageGb, price });
          }
        }

        // Ensure currently selected variant exists.
        if (currentVariant) {
          const key = currentVariant.toLowerCase();
          if (!map.has(key)) {
            const { ramGb, storageGb } = parseVariantToRamStorageGb(currentVariant);
            map.set(key, {
              key,
              rawVariant: currentVariant,
              ramGb,
              storageGb,
              price: currentPrice,
            });
          }
        }

        const options = Array.from(map.values()).sort((a, b) => {
          const ar = a.ramGb ?? 0;
          const br = b.ramGb ?? 0;
          if (ar !== br) return ar - br;
          const as = a.storageGb ?? 0;
          const bs = b.storageGb ?? 0;
          if (as !== bs) return as - bs;
          return (a.price ?? 0) - (b.price ?? 0);
        });

        if (!cancelled) {
          setVariantOptions(options);

          const matchedCurrent =
            currentVariant && options.find((o) => o.key === currentVariant.toLowerCase())?.key;

          // Require explicit user selection when variants exist.
          // Only restore selection if we already have one or if a specific variant was passed.
          if (matchedCurrent) {
            setSelectedVariantKey((prev) => prev || matchedCurrent);
          } else if (options.length === 1) {
            // If there's only one variant, auto-select it.
            setSelectedVariantKey((prev) => prev || options[0].key);
          }
        }

        // If only one variant was passed, still try to discover additional variants
        // from the search API/local CSV so the user can select.
        if (passedVariants.length > 1) {
          return;
        }
      }

      setIsVariantLoading(true);
      setVariantError(null);

      try {
        const modelOnly = fullName
          .replace(new RegExp(`^${brand.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\s+`, "i"), "")
          .trim();

        const results = await fetchSearchPhonesRaw(fullName);

        const normalizedBrand = normalizeModelText(brand);
        const desiredModelKey = normalizeModelText(
          stripBrandPrefix(modelOnly || fullName, brand)
        );

        const map = new Map<string, VariantOption>();

        for (const r of results) {
          const rBrand = String((r as any)?.brand ?? "").trim();
          const rModel = String((r as any)?.model ?? "").trim();
          const variant = formatVariant((r as any)?.variant);
          const price = Number((r as any)?.price ?? 0) || 0;

          if (!rBrand || !rModel || !variant) continue;
          if (normalizeModelText(rBrand) !== normalizedBrand) continue;

          const rModelKey = normalizeModelText(stripBrandPrefix(rModel, brand));
          if (rModelKey !== desiredModelKey) continue;
          if (!price || !Number.isFinite(price)) continue;

          const { ramGb, storageGb } = parseVariantToRamStorageGb(variant);
          const key = variant.toLowerCase();
          const existing = map.get(key);
          if (!existing || price > existing.price) {
            map.set(key, {
              key,
              rawVariant: variant,
              ramGb,
              storageGb,
              price,
            });
          }
        }

        // Ensure the currently selected variant is always available as an option.
        if (currentVariant) {
          const key = currentVariant.toLowerCase();
          if (!map.has(key)) {
            const { ramGb, storageGb } = parseVariantToRamStorageGb(currentVariant);
            map.set(key, {
              key,
              rawVariant: currentVariant,
              ramGb,
              storageGb,
              price: currentPrice,
            });
          }
        }

        const options = Array.from(map.values()).sort((a, b) => {
          // Sort by RAM, then storage, then price
          const ar = a.ramGb ?? 0;
          const br = b.ramGb ?? 0;
          if (ar !== br) return ar - br;
          const as = a.storageGb ?? 0;
          const bs = b.storageGb ?? 0;
          if (as !== bs) return as - bs;
          return (a.price ?? 0) - (b.price ?? 0);
        });

        if (!cancelled) {
          setVariantOptions(options);

          const matchedCurrent =
            currentVariant && options.find((o) => o.key === currentVariant.toLowerCase())?.key;

          // Require explicit user selection when variants exist.
          if (matchedCurrent) {
            setSelectedVariantKey((prev) => prev || matchedCurrent);
          } else if (options.length === 1) {
            // If there's only one variant, auto-select it.
            setSelectedVariantKey((prev) => prev || options[0].key);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setVariantError("Unable to load variants. You can continue with the auto-detected option.");
        }
      } finally {
        if (!cancelled) setIsVariantLoading(false);
      }
    };

    void initVariants();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passedPhone?.id, passedVariants]);

  const selectedVariantOption = useMemo(() => {
    if (!selectedVariantKey) return null;
    return variantOptions.find((o) => o.key === selectedVariantKey) ?? null;
  }, [selectedVariantKey, variantOptions]);

  const effectiveVariantOption = useMemo(() => {
    return selectedVariantOption ?? (variantOptions.length === 1 ? variantOptions[0] : null);
  }, [selectedVariantOption, variantOptions]);

  const effectiveVariant =
    effectiveVariantOption?.rawVariant ?? formatVariant(passedPhone?.variant) ?? undefined;
  const effectiveBasePrice =
    (effectiveVariantOption?.price ?? Number(passedPhone?.maxPrice ?? 0)) || 0;

  const effectiveScreenConditions = useMemo(() => {
    const base = effectiveBasePrice;
    return [
      {
        id: "good",
        name: "Good",
        description: "No scratches, pristine condition",
        priceAdjustment: 0,
      },
      {
        id: "minor-scratches",
        name: "Minor Scratches",
        description: "Light scratches, barely visible",
        priceAdjustment: -Math.round(base * 0.1),
      },
      {
        id: "major-scratches",
        name: "Major Scratches",
        description: "Visible scratches across screen",
        priceAdjustment: -Math.round(base * 0.25),
      },
      {
        id: "cracked",
        name: "Cracked",
        description: "Screen has cracks but functional",
        priceAdjustment: -Math.round(base * 0.5),
      },
      {
        id: "shattered",
        name: "Shattered",
        description: "Severely damaged screen",
        priceAdjustment: -Math.round(base * 0.75),
      },
    ];
  }, [effectiveBasePrice]);

  const ramChoices = useMemo(() => {
    const set = new Set<number>();
    for (const o of variantOptions) {
      if (typeof o.ramGb === "number" && Number.isFinite(o.ramGb)) set.add(o.ramGb);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [variantOptions]);

  const storageChoices = useMemo(() => {
    const set = new Set<number>();
    const targetRam = selectedVariantOption?.ramGb;
    for (const o of variantOptions) {
      if (typeof o.storageGb !== "number" || !Number.isFinite(o.storageGb)) continue;
      if (typeof targetRam === "number" && typeof o.ramGb === "number" && o.ramGb !== targetRam) continue;
      set.add(o.storageGb);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [variantOptions, selectedVariantOption?.ramGb]);



  const checkBackendHealth = async (baseUrl: string) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);

    try {
      // Try a health endpoint first (if present)
      const healthRes = await fetch(`${baseUrl}/health`, {
        method: "GET",
        signal: controller.signal,
      }).catch(() => null);

      if (healthRes && healthRes.ok) {
        setBackendStatus("ready");
        return;
      }

      // If /health doesn't exist (common), don't mark as down. We'll rely on
      // calculate-price responses (200/404/503) to determine status.
      setBackendStatus("unknown");
    } catch {
      setBackendStatus("down");
    } finally {
      window.clearTimeout(timeout);
    }
  };

  useEffect(() => {
    // Read cached capability for this backend URL.
    try {
      const cached = localStorage.getItem(pricingSupportKey);
      if (cached === "false") {
        setPricingSupported(false);
      }
    } catch {
      // ignore
    }

    // Persist chosen AI backend to reuse next sessions.
    try {
      localStorage.setItem("reprice.aiBaseUrl.v1", String(aiBaseUrl));
    } catch {
      // ignore
    }

    checkBackendHealth(aiBaseUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiBaseUrl]);

  useEffect(() => {
    return () => {
      if (pricingRetryTimeoutRef.current !== null) {
        window.clearTimeout(pricingRetryTimeoutRef.current);
      }
    };
  }, []);

  const buildQuoteKey = () => {
    const screenCondition =
      effectiveScreenConditions.find((s) => s.id === selectedScreenCondition)?.name ||
      "Good";

    const modelNameWithVariant = `${phone.name}${effectiveVariant ? ` ${effectiveVariant}` : ""}`;

    return JSON.stringify({
      model_name: modelNameWithVariant,
      turns_on: deviceTurnsOn === "yes",
      screen_condition: screenCondition,
      has_box: hasOriginalBox === "yes",
      has_bill: hasOriginalBill === "yes",
      is_under_warranty: isUnderWarranty === "yes",
    });
  };

  const fetchPriceFromBackend = async () => {
    if (!pricingSupported) {
      return;
    }

    if (isLoading) return;

    const quoteKey = buildQuoteKey();
    if (apiPrice !== null && lastQuoteKeyRef.current === quoteKey) {
      return;
    }

    setIsLoading(true);
    setBackendError(null);

    const callCalculatePrice = async (baseUrl: string) => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 25000);
      try {
        return await fetch(`${baseUrl}/calculate-price`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
          signal: controller.signal,
        body: buildQuoteKey(),
        });
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    try {
      let response = await callCalculatePrice(aiBaseUrl);

      if (response.ok) {
        setBackendStatus("ready");
      }

      if (!response.ok) {
        if (response.status === 404) {
          // This backend doesn't support calculate-price. Try fallback once.
          if (aiBaseUrl !== AI_FALLBACK_URL) {
            response = await callCalculatePrice(AI_FALLBACK_URL);
            if (response.ok) {
              setAiBaseUrl(AI_FALLBACK_URL);
            }
          }

          if (!response.ok) {
            setPricingSupported(false);
            setBackendStatus("down");
            setBackendError("AI pricing is unavailable right now. Please try again later.");
            try {
              localStorage.setItem(pricingSupportKey, "false");
            } catch {
              // ignore
            }
            return;
          }
        }
        if (response.status === 503) {
          setBackendStatus("initializing");
          const maxRetries = 6;
          const nextAttempt = pricingRetryAttemptRef.current + 1;
          pricingRetryAttemptRef.current = nextAttempt;
          setPricingRetryAttempt(nextAttempt);

          const delayMs = Math.min(2000 * Math.pow(2, nextAttempt - 1), 30000);
          const delaySec = Math.max(1, Math.round(delayMs / 1000));

          setBackendError(
            nextAttempt <= maxRetries
              ? `AI service is warming up (${nextAttempt}/${maxRetries}). Retrying in ${delaySec}s...`
              : "AI service is still warming up. Please try again in a moment."
          );

          window.setTimeout(() => checkBackendHealth(aiBaseUrl), 3000);

          if (pricingRetryTimeoutRef.current !== null) {
            window.clearTimeout(pricingRetryTimeoutRef.current);
          }

          if (nextAttempt <= maxRetries) {
            pricingRetryTimeoutRef.current = window.setTimeout(() => {
              void fetchPriceFromBackend();
            }, delayMs);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.detail || `Server error: ${response.status}`);
        }
        return;
      }

      if (pricingRetryAttemptRef.current !== 0) {
        pricingRetryAttemptRef.current = 0;
        setPricingRetryAttempt(0);
      }

      const data = await response.json();

      if (data && typeof data.final_price === "number" && isFinite(data.final_price)) {
        setApiPrice(data.final_price);
        lastQuoteKeyRef.current = quoteKey;

        if (typeof data.base_price === "number" && isFinite(data.base_price)) {
          setApiBasePrice(data.base_price);
        } else {
          setApiBasePrice(null);
        }

        setApiLogs(Array.isArray(data.logs) ? data.logs : []);
        setBackendError(null);
      } else {
        console.warn("Invalid price data from API:", data);
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error fetching price:", error);
      setBackendError("AI pricing failed. Please try again.");
      setApiPrice(null);
      setApiBasePrice(null);
      setApiLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // When the user changes answers while on step 3, invalidate the quote and refetch.
  useEffect(() => {
    if (currentStep !== 3) return;

    if (
      !selectedScreenCondition ||
      !deviceTurnsOn ||
      !hasOriginalBox ||
      !hasOriginalBill ||
      !isUnderWarranty
    ) {
      return;
    }

    if (pricingRetryTimeoutRef.current !== null) {
      window.clearTimeout(pricingRetryTimeoutRef.current);
      pricingRetryTimeoutRef.current = null;
    }

    pricingRetryAttemptRef.current = 0;
    setPricingRetryAttempt(0);
    lastQuoteKeyRef.current = null;
    setApiPrice(null);
    setApiBasePrice(null);
    setApiLogs([]);

    void fetchPriceFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentStep,
    selectedVariantKey,
    selectedScreenCondition,
    deviceTurnsOn,
    hasOriginalBox,
    hasOriginalBill,
    isUnderWarranty,
    aiBaseUrl,
    pricingSupported,
  ]);

  const generateAIReasoning = () => {
    const reasons: string[] = [];
    const screenOption = effectiveScreenConditions.find(
      (s) => s.id === selectedScreenCondition
    );
    if (screenOption) {
      if (screenOption.priceAdjustment === 0) {
        reasons.push(`✓ Excellent screen condition maintains full value`);
      } else {
        reasons.push(
          `• Screen condition (${screenOption.name}) reduces value by ₹${formatPrice(Math.abs(screenOption.priceAdjustment))}`
        );
      }
    }
    if (deviceTurnsOn === "yes") {
      reasons.push(`✓ Device powers on properly (better resale value)`);
    } else if (deviceTurnsOn === "no") {
      reasons.push(
        `• Device not turning on significantly reduces value by ₹8,000`
      );
    }
    if (hasOriginalBox === "yes") {
      reasons.push(`✓ Original box included (improves buyer trust)`);
    } else if (hasOriginalBox === "no") {
      reasons.push(`• No box (may reduce perceived condition)`);
    }
    if (hasOriginalBill === "yes") {
      reasons.push(`✓ Original bill/invoice (proof of authenticity)`);
    } else if (hasOriginalBill === "no") {
      reasons.push(`• No bill/invoice (verification may take longer)`);
    }

    if (isUnderWarranty === "yes") {
      reasons.push(`✓ Under warranty (better demand)`);
    } else if (isUnderWarranty === "no") {
      reasons.push(`• Out of warranty (typical depreciation)`);
    }

    return reasons;
  };

  const canProceed = () => {
    if (currentStep === 1) {
      // If variants exist, require a selection (single-variant models are auto-selected).
      if (variantOptions.length >= 1) return Boolean(selectedVariantKey);
      return true;
    }
    if (currentStep === 2)
      return (
        selectedScreenCondition !== "" &&
        deviceTurnsOn !== "" &&
        hasOriginalBox !== "" &&
        hasOriginalBill !== "" &&
        isUnderWarranty !== ""
      );
    return true;
  };

  const handleProceedToSell = () => {
    if (typeof apiPrice !== "number" || !isFinite(apiPrice)) {
      setBackendError("Please wait for the AI quote before continuing.");
      return;
    }

    const checkoutState = {
      phoneData: {
        id: phone.id,
        name: phone.name,
        brand: phone.brand,
        variant: effectiveVariant ?? "N/A",
        condition:
          effectiveScreenConditions.find((s) => s.id === selectedScreenCondition)
            ?.name ?? "Good",
        price: apiPrice,
        maxPrice: apiPrice,
        image: phone.image,
      },
    };

    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          redirectTo: "/checkout",
          redirectState: checkoutState,
          backgroundLocation: location,
        },
      });
      return;
    }

    navigate("/checkout", { state: checkoutState });
  };

  const handleRetryQuote = () => {
    if (pricingRetryTimeoutRef.current !== null) {
      window.clearTimeout(pricingRetryTimeoutRef.current);
      pricingRetryTimeoutRef.current = null;
    }
    pricingRetryAttemptRef.current = 0;
    setPricingRetryAttempt(0);
    setBackendError(null);
    setBackendStatus("unknown");
    lastQuoteKeyRef.current = null;
    setApiPrice(null);
    setApiBasePrice(null);
    setApiLogs([]);
    void fetchPriceFromBackend();
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />

      <main className="flex-grow flex items-center">
        <div className="container mx-auto px-4 py-8 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full max-h-[calc(100vh-200px)]">
            {/* Left Side */}
            <div className="flex flex-col justify-between bg-white/40 backdrop-blur-sm rounded-3xl p-8 lg:p-12">
              <div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
                >
                  <ArrowLeft size={20} />
                  <span className="font-medium">Homepage</span>
                </Link>

                <div className="mb-8">
                  <p className="text-sm font-medium text-blue-600 mb-2">
                    step {currentStep}/{STEPS.length}
                  </p>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mb-8">
                  {currentStep === 1 && (
                    <>
                      <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
                        Select your phone variant
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Choose RAM & storage to get the right quote
                      </p>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
                        Device Condition?
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Help us assess your device
                      </p>
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
                        Your Price Quote
                      </h1>
                      <p className="text-gray-600 text-lg">
                        {!isLoggedIn 
                          ? "Login is only required to schedule pickup and place the order."
                          : "Based on your selections"}
                      </p>
                    </>
                  )}
                </div>

                {/* Phone Info Card */}
                <Card className="bg-white/60 backdrop-blur border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={phone.image}
                        alt={phone.name}
                        className="w-20 h-20 object-contain rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://placehold.co/200x200/3b82f6/white?text=${encodeURIComponent(phone.name)}`;
                        }}
                      />
                      <div>
                        <h3 className="font-bold text-lg">{phone.name}</h3>
                        <p className="text-sm text-gray-600">
                          {phone.brand}
                          {effectiveVariant ? ` • ${effectiveVariant}` : ""}
                          {currentStep === 3 && selectedScreenCondition
                            ? ` • ${effectiveScreenConditions.find((s) => s.id === selectedScreenCondition)?.name}`
                            : ""}
                        </p>
                        {apiPrice !== null ? (
                          <p className="text-sm font-semibold text-blue-600 mt-1">
                            AI Quote: ₹{formatPrice(apiPrice)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                {currentStep > 1 && currentStep < STEPS.length && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="rounded-full px-6"
                  >
                    Previous
                  </Button>
                )}
              </div>
            </div>

            {/* Right Side - Options Panel */}
            <div className="flex flex-col justify-center">
              <div className="max-w-xl mx-auto w-full space-y-4">
                {/* Step 1: Variant */}
                {currentStep === 1 && (
                  <Card className="bg-white/60 backdrop-blur border-0 shadow-lg">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <HardDrive className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="text-sm text-gray-500">Variant</div>
                          <div className="font-semibold text-gray-900">
                            {effectiveVariant ?? "Please select"}
                          </div>
                        </div>
                      </div>

                      {variantError ? (
                        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                          {variantError}
                        </div>
                      ) : null}

                      {isVariantLoading ? (
                        <div className="text-sm text-gray-600">Loading variants...</div>
                      ) : variantOptions.length >= 1 ? (
                        <div className="space-y-4">
                          {!selectedVariantKey && variantOptions.length > 1 ? (
                            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                              Please select a RAM/Storage variant to continue.
                            </div>
                          ) : null}

                          {ramChoices.length > 1 ? (
                            <div>
                              <div className="text-sm font-semibold text-gray-700 mb-2">RAM</div>
                              <RadioGroup
                                value={
                                  typeof selectedVariantOption?.ramGb === "number"
                                    ? String(selectedVariantOption.ramGb)
                                    : ""
                                }
                                onValueChange={(v) => {
                                  const nextRam = Number(v);
                                  const preferredStorage = selectedVariantOption?.storageGb;

                                  const exact = variantOptions.find(
                                    (o) =>
                                      o.ramGb === nextRam &&
                                      (typeof preferredStorage !== "number" || o.storageGb === preferredStorage)
                                  );
                                  const fallback = variantOptions.find((o) => o.ramGb === nextRam);
                                  const next = exact ?? fallback;
                                  if (next) setSelectedVariantKey(next.key);
                                }}
                                className="grid grid-cols-2 gap-3"
                              >
                                {ramChoices.map((ram) => (
                                  <div key={ram}>
                                    <RadioGroupItem
                                      value={String(ram)}
                                      id={`ram-${ram}`}
                                      className="peer sr-only"
                                    />
                                    <Label
                                      htmlFor={`ram-${ram}`}
                                      className="flex items-center justify-center border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                                    >
                                      <span className="font-semibold">{ram}GB</span>
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          ) : null}

                          {storageChoices.length > 1 ? (
                            <div>
                              <div className="text-sm font-semibold text-gray-700 mb-2">Storage</div>
                              <RadioGroup
                                value={
                                  typeof selectedVariantOption?.storageGb === "number"
                                    ? String(selectedVariantOption.storageGb)
                                    : ""
                                }
                                onValueChange={(v) => {
                                  const nextStorage = Number(v);
                                  const preferredRam = selectedVariantOption?.ramGb;

                                  const exact = variantOptions.find(
                                    (o) =>
                                      o.storageGb === nextStorage &&
                                      (typeof preferredRam !== "number" || o.ramGb === preferredRam)
                                  );
                                  const fallback = variantOptions.find((o) => o.storageGb === nextStorage);
                                  const next = exact ?? fallback;
                                  if (next) setSelectedVariantKey(next.key);
                                }}
                                className="grid grid-cols-2 gap-3"
                              >
                                {storageChoices.map((storage) => (
                                  <div key={storage}>
                                    <RadioGroupItem
                                      value={String(storage)}
                                      id={`storage-${storage}`}
                                      className="peer sr-only"
                                    />
                                    <Label
                                      htmlFor={`storage-${storage}`}
                                      className="flex items-center justify-center border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                                    >
                                      <span className="font-semibold">{storage}GB</span>
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          ) : null}

                          {/* Fallback: show full variant list when parsing isn't helpful */}
                          {ramChoices.length <= 1 && storageChoices.length <= 1 ? (
                            <div>
                              <div className="text-sm font-semibold text-gray-700 mb-2">Choose Variant</div>
                              <RadioGroup
                                value={selectedVariantKey}
                                onValueChange={setSelectedVariantKey}
                                className="space-y-2"
                              >
                                {variantOptions.map((o) => (
                                  <div key={o.key}>
                                    <RadioGroupItem
                                      value={o.key}
                                      id={`variant-${o.key}`}
                                      className="peer sr-only"
                                    />
                                    <Label
                                      htmlFor={`variant-${o.key}`}
                                      className="flex items-center justify-between gap-3 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                                    >
                                      <span className="font-semibold">{variantLabel(o)}</span>
                                      <span className="text-sm text-gray-600">₹{formatPrice(o.price)}</span>
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          ) : null}

                          <div className="text-xs text-gray-500">
                            Base price for selected variant: ₹{formatPrice(effectiveBasePrice)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">Variant is auto-detected for this model.</div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Condition Assessment */}
                {currentStep === 2 && (
                  <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Screen Condition */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">
                        Screen Condition
                      </h4>
                      <RadioGroup
                        value={selectedScreenCondition}
                        onValueChange={setSelectedScreenCondition}
                        className="space-y-3"
                      >
                        {effectiveScreenConditions.map((condition) => (
                          <div key={condition.id}>
                            <RadioGroupItem
                              value={condition.id}
                              id={`screen-${condition.id}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`screen-${condition.id}`}
                              className="flex items-start gap-3 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                            >
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                  selectedScreenCondition === condition.id
                                    ? "border-blue-600 bg-blue-600"
                                    : "border-gray-300"
                                }`}
                              >
                                {selectedScreenCondition === condition.id && (
                                  <div className="w-3 h-3 rounded-full bg-white" />
                                )}
                              </div>
                              <div className="flex-grow">
                                <div className="font-semibold">
                                  {condition.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {condition.description}
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Device Turns On */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">
                        Device turns on?
                      </h4>
                      <RadioGroup
                        value={deviceTurnsOn}
                        onValueChange={setDeviceTurnsOn}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <RadioGroupItem
                            value="yes"
                            id="turns-on-yes"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="turns-on-yes"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <Check size={18} />
                            <span className="font-semibold">Yes</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="no"
                            id="turns-on-no"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="turns-on-no"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:bg-red-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <span className="font-semibold">No</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Original Box */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">
                        Original box?
                      </h4>
                      <RadioGroup
                        value={hasOriginalBox}
                        onValueChange={setHasOriginalBox}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <RadioGroupItem
                            value="yes"
                            id="box-yes"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="box-yes"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <Box size={18} />
                            <span className="font-semibold">Yes</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="no"
                            id="box-no"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="box-no"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-gray-600 peer-data-[state=checked]:bg-gray-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <span className="font-semibold">No</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Original Bill */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">
                        Original bill/invoice?
                      </h4>
                      <RadioGroup
                        value={hasOriginalBill}
                        onValueChange={setHasOriginalBill}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <RadioGroupItem
                            value="yes"
                            id="bill-yes"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="bill-yes"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <Check size={18} />
                            <span className="font-semibold">Yes</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="no"
                            id="bill-no"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="bill-no"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-gray-600 peer-data-[state=checked]:bg-gray-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <span className="font-semibold">No</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Under Warranty */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">
                        Is device under warranty?
                      </h4>
                      <RadioGroup
                        value={isUnderWarranty}
                        onValueChange={setIsUnderWarranty}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <RadioGroupItem
                            value="yes"
                            id="warranty-yes"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="warranty-yes"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <Check size={18} />
                            <span className="font-semibold">Yes</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="no"
                            id="warranty-no"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="warranty-no"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-gray-600 peer-data-[state=checked]:bg-gray-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <span className="font-semibold">No</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}

                {/* Step 3: Final Quote */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* Price Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
                      <p className="text-sm opacity-90 mb-2">AI Quote</p>
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <p className="text-4xl font-bold">Calculating...</p>
                        </div>
                      ) : apiPrice !== null ? (
                        <p className="text-6xl font-bold mb-4">₹{formatPrice(apiPrice)}</p>
                      ) : (
                        <p className="text-2xl font-semibold mb-4 text-white/90">
                          Waiting for AI quote...
                        </p>
                      )}
                      {backendError ? (
                        <div className="mt-2 text-sm text-white/90 flex items-start gap-2">
                          <Info size={16} className="mt-0.5" />
                          <span>{backendError}</span>
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2 text-sm opacity-90">
                        <Check size={16} />
                        <span>Instant payment upon verification</span>
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="bg-white/80 backdrop-blur rounded-3xl p-6 max-h-[40vh] overflow-y-auto custom-scrollbar">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                          AI
                        </span>
                        Price Breakdown
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm pb-3 border-b">
                          <span className="text-gray-600">Model Base</span>
                          <span className="font-semibold">
                            ₹
                            {formatPrice(apiBasePrice ?? effectiveBasePrice)}
                          </span>
                        </div>
                        {apiLogs.length > 0
                          ? apiLogs.map((log, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-gray-700 pl-4 border-l-2 border-blue-300 py-1"
                              >
                                {log}
                              </div>
                            ))
                          : generateAIReasoning().map((reason, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-gray-700 pl-4 border-l-2 border-blue-300 py-1"
                              >
                                {reason}
                              </div>
                            ))}
                        <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between font-bold">
                          <span>AI Quote</span>
                          <span className="text-blue-600">
                            {apiPrice !== null ? `₹${formatPrice(apiPrice)}` : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-3">
                      <Button 
                        onClick={handleProceedToSell}
                        className="w-full h-14 text-lg rounded-2xl"
                        disabled={isLoading || apiPrice === null}
                      >
                        Proceed to Sell <ArrowRight className="ml-2" />
                      </Button>

                      {apiPrice === null && !isLoading && pricingSupported ? (
                        <Button
                          variant="outline"
                          onClick={handleRetryQuote}
                          className="w-full h-12 text-base rounded-2xl"
                        >
                          Retry Quote
                        </Button>
                      ) : null}
                      
                      <Button
                        variant="outline"
                        onClick={() => navigate("/")}
                        className="w-full h-12 text-base rounded-2xl"
                      >
                        Change Phone
                      </Button>
                    </div>
                  </div>
                )}

                {/* Next Button for steps 1-2 */}
                {currentStep < STEPS.length && (
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={!canProceed()}
                      className="rounded-2xl px-8 py-6 text-lg"
                      size="lg"
                    >
                      Next
                      <ArrowRight className="ml-2" size={20} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}