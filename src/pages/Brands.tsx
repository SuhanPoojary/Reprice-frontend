import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Sample data for brands
const BRANDS = [
  { id: 'apple', name: 'Apple', logo: '/assets/brands/apple.png', devices: 32 },
  { id: 'samsung', name: 'Samsung', logo: '/assets/brands/samsung.png', devices: 56 },
  { id: 'oneplus', name: 'OnePlus', logo: '/assets/brands/oneplus.png', devices: 18 },
  { id: 'google', name: 'Google', logo: '/assets/brands/google.png', devices: 12 },
  { id: 'xiaomi', name: 'Xiaomi', logo: '/assets/brands/xiaomi.png', devices: 40 },
  { id: 'oppo', name: 'OPPO', logo: '/assets/brands/oppo.png', devices: 27 },
  { id: 'vivo', name: 'Vivo', logo: '/assets/brands/vivo.png', devices: 24 },
  { id: 'nokia', name: 'Nokia', logo: '/assets/brands/nokia.png', devices: 16 },
  { id: 'motorola', name: 'Motorola', logo: '/assets/brands/motorola.png', devices: 22 },
  { id: 'huawei', name: 'Huawei', logo: '/assets/brands/huawei.png', devices: 19 },
  { id: 'sony', name: 'Sony', logo: '/assets/brands/sony.png', devices: 8 },
  { id: 'lg', name: 'LG', logo: '/assets/brands/lg.png', devices: 10 }
];

// Sample data for phones by brand
const BRAND_PHONES = {
  'apple': [
    { id: 'iphone-13-pro', name: 'iPhone 13 Pro', image: '/assets/phones/iphone-13-pro.png', maxPrice: 45000 },
    { id: 'iphone-13', name: 'iPhone 13', image: '/assets/phones/iphone-13.png', maxPrice: 38000 },
    { id: 'iphone-12-pro', name: 'iPhone 12 Pro', image: '/assets/phones/iphone-12-pro.png', maxPrice: 35000 },
    { id: 'iphone-12', name: 'iPhone 12', image: '/assets/phones/iphone-12.png', maxPrice: 30000 },
    { id: 'iphone-11-pro', name: 'iPhone 11 Pro', image: '/assets/phones/iphone-11-pro.png', maxPrice: 28000 },
    { id: 'iphone-11', name: 'iPhone 11', image: '/assets/phones/iphone-11.png', maxPrice: 24000 }
  ],
  'samsung': [
    { id: 'samsung-s21-ultra', name: 'Galaxy S21 Ultra', image: '/assets/phones/samsung-s21.png', maxPrice: 40000 },
    { id: 'samsung-s21-plus', name: 'Galaxy S21+', image: '/assets/phones/samsung-s21-plus.png', maxPrice: 35000 },
    { id: 'samsung-s21', name: 'Galaxy S21', image: '/assets/phones/samsung-s21-base.png', maxPrice: 30000 },
    { id: 'samsung-note-20', name: 'Galaxy Note 20', image: '/assets/phones/samsung-note-20.png', maxPrice: 32000 },
    { id: 'samsung-s20', name: 'Galaxy S20', image: '/assets/phones/samsung-s20.png', maxPrice: 25000 }
  ]
};

export default function Brands() {
  const { brandId } = useParams<{ brandId: string }>();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter brands based on search query
  const filteredBrands = BRANDS.filter(brand => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // If a specific brand is selected, show its phones
  if (brandId) {
    const brand = BRANDS.find(b => b.id === brandId);
    const phones = BRAND_PHONES[brandId as keyof typeof BRAND_PHONES] || [];
    
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Link to="/brands" className="text-blue-600 hover:underline">
                ← Back to all brands
              </Link>
              <div className="flex items-center mt-4">
                <div className="w-16 h-16 bg-white rounded-full p-2 flex items-center justify-center mr-4 shadow-sm">
                  <img 
                    src={brand?.logo || `https://placehold.co/100x100?text=${brand?.name}`} 
                    alt={brand?.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/100x100?text=${brand?.name}`;
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{brand?.name || 'Brand'} Phones</h1>
                  <p className="text-gray-500">Select a model to get a quote</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <form className="max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for a model..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {phones
                .filter(phone => phone.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((phone) => (
                  <Link to={`/sell/${phone.id}`} key={phone.id}>
                    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 flex items-center justify-center mb-3">
                            <img 
                              src={phone.image || `https://placehold.co/240x240?text=${phone.name}`} 
                              alt={phone.name}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://placehold.co/240x240?text=${phone.name}`;
                              }}
                            />
                          </div>
                          <h3 className="font-medium text-center text-sm">{phone.name}</h3>
                          <p className="text-blue-600 font-semibold text-sm mt-1">
                            Up to ₹{phone.maxPrice.toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  // Otherwise, show all brands
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-8">Browse by Brand</h1>
          
          <div className="mb-6">
            <form className="max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for a brand..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredBrands.map((brand) => (
              <Link to={`/brands/${brand.id}`} key={brand.id}>
                <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 flex items-center justify-center mb-4 bg-white rounded-full p-2 border border-gray-100">
                        <img 
                          src={brand.logo || `https://placehold.co/100x100?text=${brand.name}`} 
                          alt={brand.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://placehold.co/100x100?text=${brand.name}`;
                          }}
                        />
                      </div>
                      <h3 className="font-medium text-center">{brand.name}</h3>
                      <p className="text-xs text-gray-500">{brand.devices} models</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}