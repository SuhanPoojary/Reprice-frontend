import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Search, ArrowRight, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import { useAuth } from "@/context/AuthContext";

function formatVariant(variant?: string) {
  if (!variant) return null;

  const raw = variant.trim();
  if (!raw || raw === "N/A") return null;

  const compact = raw.replace(/\s+/g, "").match(/^(\d+)(GB)?\/(\d+)(GB)?$/i);
  if (compact) return `${compact[1]}/${compact[3]}`;

  return raw;
}

console.log("🔥 THIS SellPhone FILE IS LOADED");

/* ================= TYPES ================= */

interface BackendPhone {
  brand: string;
  model: string;
  variant?: string;
  price: number;
  image?: string;
  link?: string;
}

interface Phone {
  id: string;
  name: string;
  brand: string;
  image: string;
  maxPrice: number;
  variant?: string;
  variants?: Array<{ variant: string; price: number }>;
}

interface BrandItem {
  id: string;
  name: string;
  popularModels: string[];
}

function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function displayPhoneName(brand: string, model: string) {
  const b = (brand || "").trim();
  const m = (model || "").trim();
  if (!b) return m;
  if (!m) return b;

  // Some sources repeat brand inside model (e.g., brand: 'Redmi', model: 'Redmi 9 A').
  // Avoid showing 'Redmi Redmi 9 A'.
  if (m.toLowerCase().startsWith(b.toLowerCase())) return m;
  return `${b} ${m}`;
}

function uniqByKey<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function filterPhonesForQuery(phones: Phone[], query: string) {
  const q = normalizeText(query);
  if (!q) return phones;

  const tokens = q.split(" ").filter(Boolean);
  const scored: Array<{ score: number; phone: Phone }> = [];

  for (const phone of phones) {
    const full = normalizeText(`${phone.brand} ${phone.name} ${phone.variant ?? ""}`);
    if (!full) continue;

    const tokenMatches = tokens.reduce((acc, t) => acc + (full.includes(t) ? 1 : 0), 0);
    if (tokenMatches === 0) continue;

    const score = (full.includes(q) ? 100 : 0) + tokenMatches;
    scored.push({ score, phone });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.phone);
}

function pickDiverseByBrand(items: Phone[], limit: number) {
  const byBrand = new Map<string, Phone[]>();
  for (const item of items) {
    const brandKey = (item.brand || "").trim().toLowerCase();
    if (!brandKey) continue;
    const existing = byBrand.get(brandKey);
    if (existing) existing.push(item);
    else byBrand.set(brandKey, [item]);
  }

  const result: Phone[] = [];
  for (const [, list] of byBrand) {
    if (result.length >= limit) break;
    result.push(list[0]);
  }

  if (result.length < limit) {
    for (const item of items) {
      if (result.length >= limit) break;
      if (result.some((r) => r.id === item.id)) continue;
      result.push(item);
    }
  }

  return result.slice(0, limit);
}

/* ================= DATA ================= */

function brandLogoCandidates(brandId: string) {
  const id = toSlug(brandId);
  return [
    `/assets/brands/${id}.png`,
    `/assets/brands/${id}.jpg`,
    `/assets/brands/${id}.jpeg`,
    `/assets/brands/${id}.svg`,
  ];
}

function getFallbackPhoneImage(phone: Pick<Phone, "name" | "brand">) {
  const key = `${phone.brand} ${phone.name}`.toLowerCase();
  if (key.includes("iphone 13") || key.includes("iphone13")) return "/assets/phones/iphone-13-pro.png";
  if (key.includes("iphone 12") || key.includes("iphone12")) return "/assets/phones/iphone-12.png";
  if (key.includes("galaxy s21") || key.includes("s21")) return "/assets/phones/galaxy-s21.png";
  if (key.includes("oneplus") && (key.includes("9") || key.includes("9 pro"))) return "/assets/phones/oneplus9-pro.png";
  if (key.includes("pixel") && (key.includes("6") || key.includes("6 pro"))) return "/assets/phones/pixel6-pro.png";
  if (key.includes("mi") || key.includes("xiaomi")) return "/assets/phones/mi11.png";
  if (key.includes("oppo") || key.includes("find")) return "/assets/phones/oppo-findx3.png";
  return "/assets/phones/vivo.png";
}

const SLIDER_IMAGES = [
  "/images/slider1.jpg",
  "/images/slider2.jpg",
  "/images/slider3.jpg",
  "/images/slider4.jpg",
];

const STATIC_BRAND_NAMES = [
  "Apple",
  "Samsung",
  "OnePlus",
  "OPPO",
  "Vivo",
  "Xiaomi",
  "Redmi",
  
  "Realme",
  "Honor",
  "Motorola",
  
  "Infinix",
  
  "iQOO",
  "Nothing",
  "Google",

  "Lenovo",
];

function buildStaticBrands(): BrandItem[] {
  return STATIC_BRAND_NAMES.map((name) => ({
    id: toSlug(name),
    name,
    popularModels: [],
  }));
}

function mergeBrands(preferred: BrandItem[], fallback: BrandItem[]) {
  const map = new Map<string, BrandItem>();

  for (const b of fallback) {
    if (!b?.id) continue;
    map.set(b.id, b);
  }

  for (const b of preferred) {
    if (!b?.id) continue;
    const existing = map.get(b.id);
    map.set(b.id, {
      id: b.id,
      name: b.name || existing?.name || b.id,
      popularModels:
        b.popularModels && b.popularModels.length > 0
          ? b.popularModels
          : existing?.popularModels ?? [],
    });
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/* ================= COMPONENT ================= */

export default function SellPhone() {
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [defaultPhones, setDefaultPhones] = useState<Phone[]>([]);
  const [filteredPhones, setFilteredPhones] = useState<Phone[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDefaultLoading, setIsDefaultLoading] = useState<boolean>(true);
  const [defaultError, setDefaultError] = useState<string>("");
  const [searchError, setSearchError] = useState<string>("");

  type SortOrder = "none" | "price-asc" | "price-desc";
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  const [brands, setBrands] = useState<BrandItem[]>(() => buildStaticBrands());
  const [selectedBrand, setSelectedBrand] = useState<BrandItem | null>(null);
  const [brandPhones, setBrandPhones] = useState<Phone[]>([]);
  const [isBrandPhonesLoading, setIsBrandPhonesLoading] = useState(false);
  const [brandPhonesError, setBrandPhonesError] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"popular" | "brands">("popular");
  const [pendingBrandId, setPendingBrandId] = useState<string | null>(null);

  const POPULAR_LIMIT = 10;
  const POPULAR_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
  const popularCacheKey = useMemo(() => {
    const userKey = isLoggedIn && user?.id ? String(user.id) : "guest";
    return `reprice.popularPhones.v1.${userKey}`;
  }, [isLoggedIn, user?.id]);

  const readPopularCache = (): Phone[] | null => {
    try {
      const raw = localStorage.getItem(popularCacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { ts: number; phones: unknown };
      if (!parsed || typeof parsed.ts !== "number" || !Array.isArray(parsed.phones)) return null;
      if (Date.now() - parsed.ts > POPULAR_CACHE_TTL_MS) return null;
      const phones = parsed.phones as any[];
      const safe = phones
        .filter(Boolean)
        .map((p) => ({
          id: String(p.id ?? ""),
          name: String(p.name ?? ""),
          brand: String(p.brand ?? ""),
          image: String(p.image ?? ""),
          maxPrice: Number(p.maxPrice ?? 0),
          variant: typeof p.variant === "string" ? p.variant : undefined,
          variants: Array.isArray(p.variants)
            ? p.variants
                .filter(Boolean)
                .map((v: any) => ({
                  variant: String(v.variant ?? "").trim(),
                  price: Number(v.price ?? 0),
                }))
                .filter((v: any) => v.variant && Number.isFinite(v.price) && v.price > 0)
            : undefined,
        }))
        .filter((p) => p.id && p.name && p.brand);
      return safe.slice(0, POPULAR_LIMIT);
    } catch {
      return null;
    }
  };

  const writePopularCache = (phones: Phone[]) => {
    try {
      localStorage.setItem(
        popularCacheKey,
        JSON.stringify({ ts: Date.now(), phones: phones.slice(0, POPULAR_LIMIT) })
      );
    } catch {
      // ignore quota / privacy mode
    }
  };

  const SEARCH_API_URL =
    (import.meta.env.VITE_SEARCH_API_URL as string | undefined) ??
    "https://reprice-ml-backend.onrender.com/search";

  const parseBackendSearchResponse = async (res: Response): Promise<BackendPhone[]> => {
    // Supports either:
    // 1) FastAPI shape: { query, count, phones: [...] }
    // 2) Legacy shape: [ ... ]
    const payload = await res.json().catch(() => null);
    if (!payload) return [];
    if (Array.isArray(payload)) return payload as BackendPhone[];
    if (typeof payload === "object" && Array.isArray((payload as any).phones)) {
      return (payload as any).phones as BackendPhone[];
    }
    return [];
  };

  const fetchPhonesByQuery = async (q: string): Promise<BackendPhone[]> => {
    const query = q ?? "";

    // Never hit the backend with an empty query.
    if (!query.trim()) return [];

    // Primary (your FastAPI backend): POST with JSON body { q: "..." }
    try {
      const resPost = await fetch(SEARCH_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ q: query }),
      });

      if (resPost.ok) return parseBackendSearchResponse(resPost);

      // Some backends may expect { query: "..." }
      if (resPost.status === 422) {
        const resPostAlt = await fetch(SEARCH_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ query }),
        });
        if (resPostAlt.ok) return parseBackendSearchResponse(resPostAlt);
      }

      // If backend doesn't allow POST, fall back to GET styles.
      if (resPost.status !== 405) return [];
    } catch {
      // fall through to GET fallback
    }

    // Fallback: GET with ?q=...
    const urlQ = `${SEARCH_API_URL}?q=${encodeURIComponent(query)}`;
    const resQ = await fetch(urlQ);
    if (resQ.ok) return parseBackendSearchResponse(resQ);

    // Fallback: some backends use ?query=...
    const urlQuery = `${SEARCH_API_URL}?query=${encodeURIComponent(query)}`;
    const resQuery = await fetch(urlQuery);
    if (resQuery.ok) return parseBackendSearchResponse(resQuery);

    return [];
  };

  const mapBackendPhones = (
    data: BackendPhone[],
    options?: {
      dedupe?: boolean;
    }
  ) => {
    const dedupe = options?.dedupe ?? true;
    // Auto-fill missing variants using the first available variant per (brand, model).
    const firstVariantByModel = new Map<string, string>();

    const grouped = new Map<
      string,
      {
        phone: Phone;
        variants: Map<string, { variant: string; price: number }>;
      }
    >();

    for (const item of data) {
      const brand = (item.brand || "").trim();
      const model = (item.model || "").trim();
      if (!brand || !model) continue;

      const key = `${brand.toLowerCase()}|${model.toLowerCase()}`;
      const maxPrice = Number(item.price ?? 0) || 0;
      const image = (item.image || item.link || "").toString();

      const variant = formatVariant(item.variant);

      if (variant && !firstVariantByModel.has(key)) {
        firstVariantByModel.set(key, variant);
      }

      const entry = grouped.get(key);
      if (!entry) {
        const phone: Phone = {
          id: `${toSlug(brand)}-${toSlug(model)}`,
          name: displayPhoneName(brand, model),
          brand,
          variant: undefined,
          maxPrice,
          image,
          variants: [],
        };
        const variantsMap = new Map<string, { variant: string; price: number }>();
        if (variant) {
          variantsMap.set(variant.toLowerCase(), { variant, price: maxPrice });
        }
        grouped.set(key, { phone, variants: variantsMap });
        continue;
      }

      // Keep the best (highest) price across variants.
      if (maxPrice > (entry.phone.maxPrice ?? 0)) {
        entry.phone.maxPrice = maxPrice;
      }

      // Keep first non-empty image.
      if (!entry.phone.image && image) {
        entry.phone.image = image;
      }

      // Merge variants (keep highest price for same variant label)
      if (variant) {
        const vKey = variant.toLowerCase();
        const existingVariant = entry.variants.get(vKey);
        if (!existingVariant || maxPrice > existingVariant.price) {
          entry.variants.set(vKey, { variant, price: maxPrice });
        }
      }
    }

    if (dedupe) {
      const collapsed = Array.from(grouped.values()).map(({ phone, variants }) => {
        const variantsArr = Array.from(variants.values());
        return {
          ...phone,
          variants: variantsArr.length > 0 ? variantsArr : undefined,
        } satisfies Phone;
      });
      return collapsed;
    }

    const mapped = data
      .map((item, idx) => {
        const brand = (item.brand || "").trim();
        const model = (item.model || "").trim();
        if (!brand || !model) return null;

        const key = `${brand.toLowerCase()}|${model.toLowerCase()}`;
        const variant =
          formatVariant(item.variant) ?? firstVariantByModel.get(key) ?? undefined;

        const id = `${toSlug(brand)}-${toSlug(model)}-${toSlug(variant ?? "na")}-${idx}`;
        return {
          id,
          name: `${brand} ${model}`,
          brand,
          variant,
          maxPrice: item.price,
          image: item.image || item.link || "",
        } satisfies Phone;
      })
      .filter(Boolean) as Phone[];

    return mapped;
  };

  const sortPhones = (phones: Phone[]) => {
    if (sortOrder === "none") return phones;
    const copy = [...phones];
    copy.sort((a, b) => (a.maxPrice ?? 0) - (b.maxPrice ?? 0));
    if (sortOrder === "price-desc") copy.reverse();
    return copy;
  };

  useEffect(() => {
    let cancelled = false;

    const fetchByQuery = async (q: string) => {
      const data = await fetchPhonesByQuery(q);
      return mapBackendPhones(data, { dedupe: true });
    };

    const loadDefault = async () => {
      setIsDefaultLoading(true);
      setDefaultError("");

      // Fast path: load cached popular phones (per user) and skip network.
      const cached = readPopularCache();
      if (cached && cached.length > 0) {
        if (!cancelled) {
          setDefaultPhones(cached);
          if (!searchQuery.trim()) setFilteredPhones(cached);
          setIsDefaultLoading(false);
        }
        return;
      }

      try {
        const candidates: Phone[] = [];
        const seen = new Set<string>();

        const add = (phones: Phone[]) => {
          for (const p of phones) {
            const key = `${p.brand.toLowerCase()}|${p.name.toLowerCase()}|${p.variant ?? ""}`;
            if (seen.has(key)) continue;
            seen.add(key);
            candidates.push(p);
          }
        };

        // Fast popular list: fetch until we have enough unique brands.
        const popularByBrand = new Map<string, Phone>();
        const seeds = [
          "iphone",
          "samsung",
          "oneplus",
          "oppo",
          "vivo",
          "xiaomi",
          "realme",
          "pixel",
          "motorola",
          "nokia",
          "redmi",
          "iqoo",
          "nothing",
        ];

        for (const seed of seeds) {
          if (popularByBrand.size >= POPULAR_LIMIT) break;
          try {
            const phones = await fetchByQuery(seed);
            add(phones);
            for (const p of phones) {
              const brandKey = (p.brand || "").trim().toLowerCase();
              if (!brandKey) continue;
              if (!popularByBrand.has(brandKey)) {
                popularByBrand.set(brandKey, p);
                if (popularByBrand.size >= POPULAR_LIMIT) break;
              }
            }
          } catch {
            // ignore a single seed failure
          }
        }

        // Derive brand list from backend data for "Browse by Brand"
        const byBrandModels = new Map<string, string[]>();
        for (const p of candidates) {
          const brandId = toSlug(p.brand);
          if (!brandId) continue;
          const list = byBrandModels.get(brandId) ?? [];
          if (!list.includes(p.name)) list.push(p.name);
          byBrandModels.set(brandId, list);
        }

        const derivedBrands: BrandItem[] = uniqByKey(
          candidates.map((p) => ({ id: toSlug(p.brand), name: p.brand })),
          (b) => b.id
        )
          .map((b) => ({
            id: b.id,
            name: b.name,
            popularModels: (byBrandModels.get(b.id) ?? []).slice(0, 2),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        // One phone per brand only.
        const diverse = Array.from(popularByBrand.values()).slice(0, POPULAR_LIMIT);
        // Never throw: just show a friendly empty state.

        if (!cancelled) {
          setDefaultPhones(diverse);
          if (!searchQuery.trim()) setFilteredPhones(diverse);
          setBrands(mergeBrands(derivedBrands, buildStaticBrands()));

          if (diverse.length > 0) {
            writePopularCache(diverse);
          }

          if (diverse.length === 0) {
            setDefaultError(
              "No phones available right now. Try searching for your phone model (e.g., iPhone, Galaxy, OnePlus)."
            );
          }
        }
      } catch (e) {
        console.error("Failed to load default phones", e);
        if (!cancelled) {
          setDefaultPhones([]);
          setFilteredPhones([]);
          setDefaultError("Default phones could not be loaded.");
          setBrands(buildStaticBrands());

        }
      } finally {
        if (!cancelled) setIsDefaultLoading(false);
      }
    };

    loadDefault();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popularCacheKey]);

  // Allow /brands route to redirect here and open Brands tab.
  useEffect(() => {
    const state = location.state as any;
    if (state?.tab === "brands") {
      setActiveTab("brands");
    }
    if (typeof state?.brandId === "string" && state.brandId.trim()) {
      setPendingBrandId(state.brandId.trim());
    }
  }, [location.state]);

  // If we were redirected with a brandId, auto-select that brand once brands are available.
  useEffect(() => {
    if (!pendingBrandId) return;
    if (selectedBrand) return;
    if (brands.length === 0) return;

    const match = brands.find((b) => b.id === pendingBrandId);
    if (!match) return;

    setPendingBrandId(null);
    void loadBrandPhones(match);
  }, [brands, pendingBrandId, selectedBrand]);

  useEffect(() => {
    if (!searchQuery.trim() && !isSearching) {
      setFilteredPhones(defaultPhones);
    }
  }, [searchQuery, isSearching, defaultPhones]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSearchError("");

    if (!searchQuery.trim()) {
      setFilteredPhones(defaultPhones);
      return;
    }

    setIsSearching(true);

    try {
      const data = await fetchPhonesByQuery(searchQuery);
      // Search-by-name should show ALL matching phones/variants from the backend.
      const mapped = mapBackendPhones(data, { dedupe: false });
      const relevant = filterPhonesForQuery(mapped, searchQuery);
      setFilteredPhones(relevant);

      if (relevant.length === 0) {
        setSearchError(
          `No phones matched “${searchQuery.trim()}”. Try a different keyword (e.g., brand + model).`
        );
      }
    } catch (err) {
      console.error("Search failed", err);
      setFilteredPhones([]);
      setSearchError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

    const loadBrandPhones = async (brand: BrandItem) => {
      setSelectedBrand(brand);
      setBrandPhones([]);
      setBrandPhonesError("");
      setIsBrandPhonesLoading(true);

      try {
        const data = await fetchPhonesByQuery(brand.name);
        // Brand view should show ALL phones for that brand.
        const mapped = mapBackendPhones(data, { dedupe: false });

        const exact = mapped.filter(
          (p) => p.brand.trim().toLowerCase() === brand.name.trim().toLowerCase()
        );

        setBrandPhones(exact.length > 0 ? exact : mapped);
      } catch (e) {
        console.error("Failed to load brand phones", e);
        setBrandPhones([]);
        setBrandPhonesError("Brand phones could not be loaded.");
      } finally {
        setIsBrandPhonesLoading(false);
      }
    };

  const sortedFilteredPhones = useMemo(
    () => sortPhones(filteredPhones),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredPhones, sortOrder]
  );

  const sortedBrandPhones = useMemo(
    () => sortPhones(brandPhones),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brandPhones, sortOrder]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Carousel Section */}
        <section className="bg-background">
          <div className="container mx-auto px-4 py-8">
            <Carousel
              opts={{ align: "start", loop: true }}
              plugins={[Autoplay({ delay: 4000 })]}
              className="w-full"
            >
              <CarouselContent>
                {SLIDER_IMAGES.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative h-[260px] md:h-[380px] rounded-2xl overflow-hidden">
                      <img
                        src={image}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src = `https://placehold.co/1200x400/3b82f6/ffffff?text=Slide+${
                            index + 1
                          }`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white">
                        <h2 className="text-lg md:text-3xl font-bold">
                          Sell Your Old Phone Today
                        </h2>
                        <p className="text-sm md:text-lg opacity-90">
                          Get instant quotes and best prices
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
        </section>

        {/* Search and Tabs Section */}
        <section className="py-8 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for your phone model or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Button
                  type="submit"
                  className="absolute right-1 top-1 h-8"
                  size="sm"
                >
                  Search
                </Button>
              </div>
            </form>

            <div className="max-w-2xl mx-auto mb-4 flex items-center justify-end gap-3">
              <div className="text-sm text-gray-600">Sort by</div>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
                <SelectTrigger className="w-[220px] bg-white">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Recommended</SelectItem>
                  <SelectItem value="price-asc">Price: low → high</SelectItem>
                  <SelectItem value="price-desc">Price: high → low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="mx-auto">
                <TabsTrigger value="popular">Popular Phones</TabsTrigger>
                <TabsTrigger value="brands">Browse by Brand</TabsTrigger>
              </TabsList>

              <TabsContent value="popular" className="mt-6">
                {isSearching || (isDefaultLoading && !searchQuery.trim()) ? (
                  <div className="text-center text-gray-600 py-10">
                    Loading phones...
                  </div>
                ) : defaultError && !searchQuery.trim() ? (
                  <div className="text-center text-red-600 py-10">
                    {defaultError}
                  </div>
                ) : sortedFilteredPhones.length === 0 ? (
                  <div className="text-center text-gray-600 py-10">
                    {searchError || "No phones found."}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {sortedFilteredPhones.map((phone) => (
                      <div key={phone.id} className="group">
                        <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 rounded-3xl bg-gradient-to-br from-pink-50 via-blue-50 to-yellow-50 h-[320px]">
                          <CardContent className="p-4 flex flex-col relative h-full">
                            {/* Heart Icon */}
                            <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all hover:scale-110">
                              <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                            </button>

                            <Link
                              to={`/sell/${phone.id}`}
                              state={{ phoneData: phone }}
                              className="flex flex-col h-full"
                            >
                              {/* Product Image: fixed height + robust fallback + object-cover */}
                              <div className="w-full h-44 md:h-56 mb-3 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl p-0 group-hover:bg-white/80 transition-all overflow-hidden">
                                <img
                                  src={
                                    phone.image ||
                                    `/assets/phones/${phone.id}.png`
                                  }
                                  alt={phone.name}
                                  className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    if (img.dataset.attempt === "1") {
                                      img.src = `https://placehold.co/400x300/e0e7ff/6366f1?text=${encodeURIComponent(
                                        phone.name
                                      )}`;
                                      return;
                                    }
                                    img.dataset.attempt = "1";
                                    img.src = `/assets/phones/${phone.id}.png`;
                                  }}
                                />
                              </div>

                              {/* Product Info: fixed space so cards align */}
                              <div className="flex-grow flex flex-col justify-start">
                                <h3 className="font-bold text-sm mb-1 line-clamp-2 text-gray-900">
                                  {phone.name}
                                </h3>

                                {/* Variants are selected on the next screen */}
                                <div className="pt-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-lg font-bold text-gray-900">
                                      ₹{phone.maxPrice.toLocaleString()}
                                    </p>
                                    <Button
                                      size="sm"
                                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-4 py-1 text-xs font-medium"
                                    >
                                      Sell
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="brands" className="mt-6">
                {selectedBrand ? (
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                          setSelectedBrand(null);
                          setBrandPhones([]);
                          setBrandPhonesError("");
                        }}
                      >
                        Back to Brands
                      </Button>
                      <div className="text-lg font-bold text-gray-900">
                        {selectedBrand.name}
                      </div>
                      <div className="w-[120px]" />
                    </div>

                    {isBrandPhonesLoading ? (
                      <div className="text-center text-gray-600 py-10">
                        Loading {selectedBrand.name} phones...
                      </div>
                    ) : brandPhonesError ? (
                      <div className="text-center text-red-600 py-10">
                        {brandPhonesError}
                      </div>
                    ) : sortedBrandPhones.length === 0 ? (
                      <div className="text-center text-gray-600 py-10">
                        No phones found for {selectedBrand.name}.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {sortedBrandPhones.map((phone) => (
                          <div key={phone.id} className="group">
                            <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 rounded-3xl bg-gradient-to-br from-pink-50 via-blue-50 to-yellow-50 h-[320px]">
                              <CardContent className="p-4 flex flex-col relative h-full">
                                <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all hover:scale-110">
                                  <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                                </button>

                                <Link
                                  to={`/sell/${phone.id}`}
                                  state={{ phoneData: phone }}
                                  className="flex flex-col h-full"
                                >
                                  <div className="w-full h-44 md:h-56 mb-3 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl p-0 group-hover:bg-white/80 transition-all overflow-hidden">
                                    <img
                                      src={phone.image || getFallbackPhoneImage(phone)}
                                      alt={phone.name}
                                      className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                                      onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        img.src = getFallbackPhoneImage(phone);
                                      }}
                                    />
                                  </div>

                                  <div className="flex-grow flex flex-col justify-start">
                                    <h3 className="font-bold text-sm mb-1 line-clamp-2 text-gray-900">
                                      {phone.name}
                                    </h3>

                                    {/* Variants are selected on the next screen */}
                                    <div className="pt-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="text-lg font-bold text-gray-900">
                                          ₹{phone.maxPrice.toLocaleString()}
                                        </p>
                                        <Button
                                          size="sm"
                                          className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-4 py-1 text-xs font-medium"
                                        >
                                          Sell
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : brands.length === 0 ? (
                  <div className="text-center text-gray-600 py-10">
                    Loading brands...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
                    {brands.map((brand) => (
                      <button
                        type="button"
                        key={brand.id}
                        className="group text-left"
                        onClick={() => loadBrandPhones(brand)}
                      >
                        <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 h-[320px]">
                          <CardContent className="p-6 flex flex-col items-center h-full">
                            <div className="w-28 h-28 flex items-center justify-center mb-4 bg-white/80 backdrop-blur-sm rounded-full p-3 group-hover:bg-white transition-all group-hover:scale-110 duration-300 shadow-lg overflow-hidden">
                              <img
                                src={brandLogoCandidates(brand.id)[0]}
                                alt={brand.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  const attempts = Number(img.dataset.attempt || "0");
                                  const candidates = brandLogoCandidates(brand.id);
                                  const next = candidates[attempts + 1];

                                  if (next) {
                                    img.dataset.attempt = String(attempts + 1);
                                    img.src = next;
                                    return;
                                  }

                                  img.src = `https://placehold.co/150x150/818cf8/ffffff?text=${encodeURIComponent(
                                    brand.name
                                  )}`;
                                }}
                              />
                            </div>
                            <h3 className="font-bold text-center mb-2 text-lg text-gray-900">
                              {brand.name}
                            </h3>
                            <p className="text-xs text-gray-600 text-center line-clamp-2 mb-3">
                              {brand.popularModels.length > 0
                                ? `${brand.popularModels.slice(0, 2).join(", ")} & more`
                                : "View models"}
                            </p>
                            <div className="mt-auto">
                              <Button
                                size="sm"
                                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                              >
                                View Models
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Why Sell With Us Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">
              Why Sell With MobileTrade?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Fast & Efficient</h3>
                <p className="text-gray-600">
                  Get a quote in minutes, not days. Our pickup process is quick
                  and hassle-free.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Trusted Service</h3>
                <p className="text-gray-600">
                  Over 1 million satisfied customers have trusted us with their
                  phones.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="M7 15h0"></path>
                    <path d="M12 15h0"></path>
                    <path d="M17 15h0"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Instant Payment</h3>
                <p className="text-gray-600">
                  Receive payment immediately upon phone verification, directly
                  to your preferred method.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}