import { useState } from "react";

// API base URL for backend
const API_URL = "http://127.0.0.1:3001";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Search, ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";

// Sample data for brands
const BRANDS = [
  {
    id: "apple",
    name: "Apple",
    logo: "/assets/brands/apple.jpg",
    popularModels: ["iPhone 13 Pro", "iPhone 12"],
  },
  {
    id: "samsung",
    name: "Samsung",
    logo: "/assets/brands/samsung.png",
    popularModels: ["Galaxy S21", "Galaxy A52"],
  },
  {
    id: "oneplus",
    name: "OnePlus",
    logo: "/assets/brands/oneplus.png",
    popularModels: ["OnePlus 9 Pro", "OnePlus Nord"],
  },
  {
    id: "google",
    name: "Google",
    logo: "/assets/brands/googlepixel.jpg",
    popularModels: ["Pixel 6 Pro", "Pixel 5"],
  },
  {
    id: "xiaomi",
    name: "Xiaomi",
    logo: "/assets/brands/xiaomi.svg",
    popularModels: ["Mi 11 Ultra", "Redmi Note 10"],
  },
  {
    id: "oppo",
    name: "OPPO",
    logo: "/assets/brands/oppo.png",
    popularModels: ["Find X3 Pro", "Reno6"],
  },
  {
    id: "vivo",
    name: "Vivo",
    logo: "/assets/brands/vivo.png",
    popularModels: ["X70 Pro", "V21"],
  },
  {
    id: "nokia",
    name: "Nokia",
    logo: "/assets/brands/nokia.png",
    popularModels: ["XR20", "G20"],
  },
];

const SLIDER_IMAGES = [
  "/images/slider1.jpg",
  "/images/slider2.jpg",
  "/images/slider3.jpg",
  "/images/slider4.jpg",
];

// Sample data for popular phones
const POPULAR_PHONES = [
  {
    id: "iphone-13-pro",
    name: "iPhone 13 Pro",
    brand: "Apple",
    image: "/assets/phones/iphone-13-pro.png",
    maxPrice: 45000,
  },
  {
    id: "samsung-s21-ultra",
    name: "Galaxy S21 Ultra",
    brand: "Samsung",
    image: "/assets/phones/galaxy-s21.png",
    maxPrice: 40000,
  },
  {
    id: "oneplus-9-pro",
    name: "OnePlus 9 Pro",
    brand: "OnePlus",
    image: "/assets/phones/oneplus9-pro.png",
    maxPrice: 32000,
  },
  {
    id: "pixel-6-pro",
    name: "Pixel 6 Pro",
    brand: "Google",
    image: "/assets/phones/pixel6-pro.png",
    maxPrice: 35000,
  },
  {
    id: "iphone-12",
    name: "iPhone 12",
    brand: "Apple",
    image: "/assets/phones/iphone-12.png",
    maxPrice: 30000,
  },
  {
    id: "xiaomi-mi-11",
    name: "Mi 11 Ultra",
    brand: "Xiaomi",
    image: "/assets/phones/mi11.png",
    maxPrice: 28000,
  },
  {
    id: "oppo-find-x3",
    name: "Find X3 Pro",
    brand: "OPPO",
    image: "/assets/phones/oppo-findx3.png",
    maxPrice: 29000,
  },
  {
    id: "vivo-x70-pro",
    name: "X70 Pro",
    brand: "Vivo",
    image: "/assets/phones/vivo.png",
    maxPrice: 27000,
  },
];

export default function SellPhone() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPhones, setFilteredPhones] = useState(POPULAR_PHONES);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!searchQuery.trim()) {
    setFilteredPhones(POPULAR_PHONES);
    return;
  }

  setIsSearching(true);

  try {
    const res = await fetch(
      `${API_URL}/search-phones?q=${encodeURIComponent(searchQuery)}`
    );

    if (!res.ok) {
      throw new Error("Search request failed");
    }

    const data = await res.json();

    const mapped = data.map((item: any, idx: number) => ({
      id: item.model.toLowerCase().replace(/[\s\/]+/g, "-") + "-" + idx,
      name: `${item.brand} ${item.model} ${item.variant || ""}`,
      brand: item.brand,
      image: "",
      maxPrice: item.price,
    }));

    setFilteredPhones(mapped);
  } catch (err) {
    console.error("Search failed", err);
    setFilteredPhones(POPULAR_PHONES); // graceful fallback
  } finally {
    setIsSearching(false);
  }
};


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

            <Tabs defaultValue="popular">
              <TabsList className="mx-auto">
                <TabsTrigger value="popular">Popular Phones</TabsTrigger>
                <TabsTrigger value="brands">Browse by Brand</TabsTrigger>
              </TabsList>

              <TabsContent value="popular" className="mt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {filteredPhones.map((phone) => (
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
                                className="w-full h-full object-cover drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
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
                              <p className="text-xs text-gray-500 mb-2">
                                {phone.brand}
                              </p>
                              <div className="pt-2">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-lg font-bold text-gray-900">
                                    ₹{phone.maxPrice.toLocaleString()}
                                  </p>
                                  <Button
                                    size="sm"
                                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-4 py-1 text-xs font-medium"
                                  >
                                    Buy
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
              </TabsContent>

              <TabsContent value="brands" className="mt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
                  {BRANDS.map((brand) => (
                    <Link
                      to={`/brands/${brand.id}`}
                      key={brand.id}
                      className="group"
                    >
                      <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 h-[320px]">
                        <CardContent className="p-6 flex flex-col items-center h-full">
                          <div className="w-28 h-28 flex items-center justify-center mb-4 bg-white/80 backdrop-blur-sm rounded-full p-3 group-hover:bg-white transition-all group-hover:scale-110 duration-300 shadow-lg overflow-hidden">
                            <img
                              src={
                                brand.logo || `/assets/brands/${brand.id}.png`
                              }
                              alt={brand.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                if (img.dataset.attempt === "1") {
                                  img.src = `https://placehold.co/150x150/818cf8/ffffff?text=${encodeURIComponent(
                                    brand.name
                                  )}`;
                                  return;
                                }
                                img.dataset.attempt = "1";
                                img.src = `/assets/brands/${brand.id}.png`;
                              }}
                            />
                          </div>
                          <h3 className="font-bold text-center mb-2 text-lg text-gray-900">
                            {brand.name}
                          </h3>
                          <p className="text-xs text-gray-600 text-center line-clamp-2 mb-3">
                            {brand.popularModels.slice(0, 2).join(", ")} & more
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
                    </Link>
                  ))}
                </div>
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
