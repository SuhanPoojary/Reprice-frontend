import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from 'react-router-dom';

// Popular mobile brands
const POPULAR_BRANDS = [
  { id: 'apple', name: 'Apple' },
  { id: 'samsung', name: 'Samsung' },
  { id: 'oneplus', name: 'OnePlus' },
  { id: 'google', name: 'Google' },
  { id: 'xiaomi', name: 'Xiaomi' },
  { id: 'oppo', name: 'OPPO' },
  { id: 'vivo', name: 'Vivo' },
  { id: 'nokia', name: 'Nokia' }
];

export function MobileSearchForm() {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to search results page with query parameters
    navigate(`/search?query=${searchQuery}${selectedBrand ? `&brand=${selectedBrand}` : ''}`);
  };
  
  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-grow">
        <Input
          type="text"
          placeholder="Search for your phone model..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-gray-800 bg-white"
        />
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="h-12 bg-white text-gray-800 border-gray-200 justify-between min-w-[150px]"
          >
            {selectedBrand ? POPULAR_BRANDS.find(b => b.id === selectedBrand)?.name : "Select Brand"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" side="bottom">
          <Command>
            <CommandInput placeholder="Search brand..." />
            <CommandList>
              <CommandEmpty>No brand found</CommandEmpty>
              <CommandGroup heading="Popular Brands">
                {POPULAR_BRANDS.map((brand) => (
                  <CommandItem
                    key={brand.id}
                    value={brand.name}
                    onSelect={() => {
                      setSelectedBrand(brand.id);
                      setOpen(false);
                    }}
                  >
                    {brand.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button type="submit" className="h-12 min-w-[100px]">
        Get Price
      </Button>
    </form>
  );
}