import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
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

const AI_WARMUP_MAX_WAIT_MS = 20_000;
const AI_WARMUP_RETRY_DELAY_MS = 1_250;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

type BackendStatus = "unknown" | "ready" | "initializing" | "down";

// If true, the UI will prefer waiting for AI rather than showing any estimated quote.
const PREFER_AI_QUOTE = true;

type PriceResponse = {
  final_price?: number | null;
  base_price?: number | null;
  logs?: unknown;
  estimated?: boolean;
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

function normalizeModelName(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

function stripBrandPrefix(fullName: string, brand: string) {
  const name = normalizeModelName(fullName);
  const b = normalizeModelName(brand);

  if (!name || !b) return name;
  const lowerName = name.toLowerCase();
  const lowerBrand = b.toLowerCase();

  if (lowerName === lowerBrand) return name;
  if (lowerName.startsWith(lowerBrand + " ")) {
    return name.slice(b.length).trim();
  }

  return name;
}

function buildModelNameCandidates(fullName: string, brand: string) {
  const primary = normalizeModelName(fullName);
  const stripped = stripBrandPrefix(fullName, brand);
  const candidates = [primary, stripped].filter(Boolean);
  return Array.from(new Set(candidates));
}

export default function PhoneDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const passedPhone = location.state?.phoneData;

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
  const [aiWaitDeadlineMs, setAiWaitDeadlineMs] = useState<number | null>(null);
  const [aiWaitSeconds, setAiWaitSeconds] = useState<number>(0);

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
    image: passedPhone.image || `https://placehold.co/200x200/3b82f6/white?text=${encodeURIComponent(passedPhone.brand + ' ' + passedPhone.name)}`,
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

  useEffect(() => {
    if (currentStep === 3) {
      fetchPriceFromBackend();
    }
  }, [currentStep]);

  useEffect(() => {
    if (!aiWaitDeadlineMs) return;

    const tick = () => {
      const remainingMs = Math.max(0, aiWaitDeadlineMs - Date.now());
      setAiWaitSeconds(Math.ceil(remainingMs / 1000));
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [aiWaitDeadlineMs]);

  const checkBackendHealth = async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);

    try {
      // Try a health endpoint first (if present)
      const healthRes = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      }).catch(() => null);

      if (healthRes && healthRes.ok) {
        const body = (await healthRes.json().catch(() => null)) as
          | { vector_db_ready?: boolean; vector_db_initializing?: boolean }
          | null;

        if (body && typeof body.vector_db_ready === "boolean") {
          if (body.vector_db_ready) {
            setBackendStatus("ready");
          } else if (body.vector_db_initializing) {
            setBackendStatus("initializing");
          } else {
            setBackendStatus("ready");
          }
        } else {
          setBackendStatus("ready");
        }
        return;
      }

      // Fallback: if /health doesn't exist, check base URL reachability
      const rootRes = await fetch(`${API_BASE_URL}/`, {
        method: "GET",
        signal: controller.signal,
      }).catch(() => null);

      if (rootRes && rootRes.ok) {
        setBackendStatus("ready");
      } else {
        setBackendStatus("down");
      }
    } catch {
      setBackendStatus("down");
    } finally {
      window.clearTimeout(timeout);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPriceFromBackend = async () => {
    // Don't bail out just because the health check failed.
    // Cold starts can make /health time out, but /calculate-price may succeed shortly after.

    setIsLoading(true);
    setBackendError(null);
    setAiWaitDeadlineMs(Date.now() + AI_WARMUP_MAX_WAIT_MS);

    try {
      const candidates = buildModelNameCandidates(phone.name, phone.brand);

      const warmupStart = Date.now();

      let lastLogs: string[] = [];
      let lastEstimated = false;

      for (const modelCandidate of candidates) {
        let response: Response | null = null;
        // If the service is cold-starting, it may return 503 for a few seconds.
        // Wait/retry (up to AI_WARMUP_MAX_WAIT_MS total) so the user gets the real AI quote.
        while (true) {
          try {
            response = await fetch(`${API_BASE_URL}/calculate-price`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model_name: modelCandidate,
            turns_on: deviceTurnsOn === "yes",
            screen_condition:
              phone.screenConditions.find((s) => s.id === selectedScreenCondition)
                ?.name || "Good",
            has_box: hasOriginalBox === "yes",
            has_bill: hasOriginalBill === "yes",
            is_under_warranty: isUnderWarranty === "yes",
                prefer_ai: PREFER_AI_QUOTE,
          }),
            });
          } catch {
            response = null;
          }

          // Network/timeout while the service is booting: retry for a bit.
          if (!response) {
            setBackendStatus("initializing");
            setBackendError("AI warming up… please wait");

            if (Date.now() - warmupStart >= AI_WARMUP_MAX_WAIT_MS) {
              setBackendStatus("down");
              setBackendError("AI service unavailable right now. Please try again.");
              return;
            }

            await sleep(AI_WARMUP_RETRY_DELAY_MS);
            continue;
          }

          if (response && response.status === 503) {
            setBackendStatus("initializing");
            setBackendError("AI warming up… please wait");

            if (Date.now() - warmupStart >= AI_WARMUP_MAX_WAIT_MS) {
              setBackendError("AI service is still loading. Please try again.");
              window.setTimeout(checkBackendHealth, 1500);
              return;
            }

            await sleep(AI_WARMUP_RETRY_DELAY_MS);
            continue;
          }

          break;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.detail || `Server error: ${response.status}`);
        }

        const data = (await response.json()) as PriceResponse;

        const finalPrice =
          typeof data?.final_price === "number" && isFinite(data.final_price)
            ? data.final_price
            : null;

        const basePrice =
          typeof data?.base_price === "number" && isFinite(data.base_price)
            ? data.base_price
            : null;

        const logs = Array.isArray(data?.logs)
          ? (data.logs.filter((l): l is string => typeof l === "string") as string[])
          : [];

        lastLogs = logs;
        lastEstimated = Boolean(data?.estimated);

        // If the API couldn't find any base price, it's effectively a "no match".
        // Retry with another candidate (e.g., without brand prefix).
        const noMatch = basePrice === null && (finalPrice === null || finalPrice <= 0);
        if (noMatch) continue;

        setApiPrice(finalPrice);
        setApiBasePrice(basePrice);
        setApiLogs(logs);
        // If backend ever returns an estimated quote, we still treat it as not acceptable here.
        // We want only the AI-predicted quote.
        if (lastEstimated) {
          setApiPrice(null);
          setApiBasePrice(null);
          setApiLogs(logs);
          setBackendError("AI warming up… please wait");
          continue;
        }

        setBackendError(null);
        setAiWaitDeadlineMs(null);
        return;
      }

      // All candidates failed to resolve to a usable quote.
      setApiPrice(null);
      setApiBasePrice(null);
      setApiLogs(lastLogs);
      setBackendError("No AI pricing match found for this model.");
    } catch (error) {
      console.error("Error fetching price:", error);
      setBackendError("AI unavailable right now. Please try again.");
      setApiPrice(null);
      setApiBasePrice(null);
      setApiLogs([]);
    } finally {
      setIsLoading(false);
      setAiWaitDeadlineMs(null);
    }
  };

  const hasAiQuote = typeof apiPrice === "number" && isFinite(apiPrice) && apiPrice > 0;

  const generateAIReasoning = () => {
    const reasons: string[] = [];
    const screenOption = phone.screenConditions.find(
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
      reasons.push(`✓ Device powers on properly adds ₹2,000`);
    } else if (deviceTurnsOn === "no") {
      reasons.push(
        `• Device not turning on significantly reduces value by ₹8,000`
      );
    }
    if (hasOriginalBox === "yes") {
      reasons.push(`✓ Original box included adds ₹1,000`);
    }
    if (hasOriginalBill === "yes") {
      reasons.push(`✓ Original bill/invoice adds ₹1,500 (proof of authenticity)`);
    }
    return reasons;
  };

  const canProceed = () => {
    if (currentStep === 1) return true;
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
    if (!hasAiQuote) {
      setBackendError("AI price is still loading. Please wait.");
      return;
    }
    const checkoutState = {
      phoneData: {
        id: phone.id,
        name: phone.name,
        brand: phone.brand,
        variant: phone.variant ?? "N/A",
        condition:
          phone.screenConditions.find((s) => s.id === selectedScreenCondition)
            ?.name ?? "Good",
        price: apiPrice,
        maxPrice: phone.basePrice,
        image: phone.image,
      },
    };

    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          redirectTo: "/checkout",
          redirectState: checkoutState,
        },
      });
      return;
    }

    navigate("/checkout", { state: checkoutState });
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
                        Confirm your phone variant
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Variant is auto-detected for this model
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
                          {phone.brand} • {(() => {
                            const variant = formatVariant(phone.variant);
                            return variant ? variant : '';
                          })()}{(() => {
                            const variant = formatVariant(phone.variant);
                            return variant ? 'GB' : '';
                          })()}{currentStep === 3 && selectedScreenCondition && ` • ${phone.screenConditions.find(s => s.id === selectedScreenCondition)?.name}`}
                        </p>
                        <p className="text-sm font-semibold text-blue-600 mt-1">
                          Base: ₹
                          {formatPrice(apiBasePrice ?? phone.basePrice)}
                        </p>
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
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <HardDrive className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="text-sm text-gray-500">Variant</div>
                          <div className="font-semibold text-gray-900">
                            {formatVariant(phone.variant) ?? "N/A"}
                          </div>
                        </div>
                      </div>
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
                        {phone.screenConditions.map((condition) => (
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
                      <p className="text-sm opacity-90 mb-2">AI Predicted Price</p>

                      {!hasAiQuote ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-2xl font-bold">AI warming up…</p>
                          </div>
                          <div className="text-sm text-white/90 flex items-start gap-2">
                            <Info size={16} className="mt-0.5" />
                            <span>
                              Please wait{aiWaitSeconds > 0 ? ` (${aiWaitSeconds}s)` : ""} for AI price
                            </span>
                          </div>
                          {backendError ? (
                            <div className="text-sm text-white/90">{backendError}</div>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-6xl font-bold mb-4">₹{formatPrice(apiPrice)}</p>
                      )}

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
                      {!hasAiQuote ? (
                        <div className="text-sm text-gray-700">
                          AI price breakdown will appear once the AI quote is ready.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm pb-3 border-b">
                            <span className="text-gray-600">Base Price</span>
                            <span className="font-semibold">₹{formatPrice(apiBasePrice ?? phone.basePrice)}</span>
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
                            <span>Final Price</span>
                            <span className="text-blue-600">₹{formatPrice(apiPrice)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="space-y-3">
                      <Button 
                        onClick={handleProceedToSell}
                        disabled={!hasAiQuote || isLoading}
                        className="w-full h-14 text-lg rounded-2xl"
                      >
                        Proceed to Sell <ArrowRight className="ml-2" />
                      </Button>

                      {!hasAiQuote ? (
                        <Button
                          variant="secondary"
                          onClick={fetchPriceFromBackend}
                          disabled={isLoading}
                          className="w-full h-12 text-base rounded-2xl"
                        >
                          {isLoading ? "Fetching AI Price…" : "Retry AI Price"}
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