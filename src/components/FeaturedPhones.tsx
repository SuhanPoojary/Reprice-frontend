import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

// Mock data for featured phones
const FEATURED_PHONES = [
  {
    id: "iphone-13-pro",
    name: "iPhone 13 Pro",
    brand: "Apple",
    maxPrice: 45000,
    image: "/assets/phones/iphone-13-pro.png",
    popular: true,
  },
  {
    id: "samsung-s21-ultra",
    name: "Galaxy S21 Ultra",
    brand: "Samsung",
    maxPrice: 40000,
    image: "/assets/phones/galaxy-s21.png",
    popular: true,
  },
  {
    id: "oneplus-9-pro",
    name: "OnePlus 9 Pro",
    brand: "OnePlus",
    maxPrice: 32000,
    image: "/assets/phones/oneplus9-pro.png",
    popular: false,
  },
  {
    id: "pixel-6-pro",
    name: "Pixel 6 Pro",
    brand: "Google",
    maxPrice: 35000,
    image: "/assets/phones/pixel6-pro.png",
    popular: true,
  },
  {
    id: "iphone-12",
    name: "iPhone 12",
    brand: "Apple",
    maxPrice: 30000,
    image: "/assets/phones/iphone-12.png",
    popular: false,
  },
  {
    id: "xiaomi-mi-11",
    name: "Mi 11 Ultra",
    brand: "Xiaomi",
    maxPrice: 28000,
    image: "/assets/phones/mi-11.png",
    popular: false,
  },
];

export function FeaturedPhones() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {FEATURED_PHONES.map((phone) => (
        <div key={phone.id} className="group">
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 rounded-[28px] bg-gradient-to-br from-pink-50 via-blue-50 to-yellow-50">
            <CardContent className="p-6 relative">
              {/* Heart Icon */}
              <button className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all hover:scale-110">
                <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
              </button>

              {/* Popular Badge */}
              {phone.popular && (
                <Badge className="absolute top-4 left-4 bg-green-500 hover:bg-green-600 rounded-full px-3 py-1">
                  Popular
                </Badge>
              )}

              {/* Product Image */}
              <Link to={`/sell/${phone.id}`} className="block">
                <div className="relative aspect-square mb-6 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl p-6 group-hover:bg-white/80 transition-all">
                  <img
                    src={phone.image}
                    alt={phone.name}
                    className="max-h-full max-w-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (
                        e.target as HTMLImageElement
                      ).src = `https://placehold.co/400x400/e0e7ff/6366f1?text=${encodeURIComponent(
                        phone.name
                      )}`;
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-2 mb-4">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                    {phone.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    This is the best phone you can buy at this price point. It
                    stands not...
                  </p>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹ {phone.maxPrice.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 py-6 font-medium transition-all hover:scale-105"
                    asChild
                  >
                    <span>Buy</span>
                  </Button>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
