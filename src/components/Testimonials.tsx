import { Card, CardContent } from '@/components/ui/card';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';

// Mock testimonials data
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rahul Sharma',
    location: 'Delhi',
    avatar: '/assets/avatars/avatar-1.png',
    quote: 'I was skeptical at first, but MobileTrade offered me the best price for my old iPhone. The pickup was smooth and payment was instant!',
    rating: 5
  },
  {
    id: 2,
    name: 'Priya Patel',
    location: 'Mumbai',
    avatar: '/assets/avatars/avatar-2.png',
    quote: 'Super convenient service! Got a fair price for my Samsung Galaxy, and the entire process was hassle-free. Would definitely recommend.',
    rating: 4
  },
  {
    id: 3,
    name: 'Amit Kumar',
    location: 'Bangalore',
    avatar: '/assets/avatars/avatar-3.png',
    quote: 'I compared prices across multiple platforms, and MobileTrade gave me the highest offer. Quick pickup and immediate payment.',
    rating: 5
  },
  {
    id: 4,
    name: 'Sneha Gupta',
    location: 'Hyderabad',
    avatar: '/assets/avatars/avatar-4.png',
    quote: 'The evaluation was fair and transparent. I appreciate how they explained every aspect of my phone\'s condition that affected the price.',
    rating: 5
  },
  {
    id: 5,
    name: 'Vikram Singh',
    location: 'Pune',
    avatar: '/assets/avatars/avatar-5.png',
    quote: 'MobileTrade made selling my old OnePlus so easy. Their executive was professional and the money was in my account within minutes.',
    rating: 4
  }
];

export function Testimonials() {
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <svg 
        key={index}
        className={`h-4 w-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" 
          clipRule="evenodd" 
        />
      </svg>
    ));
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what customers who have sold their phones through MobileTrade have to say.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {TESTIMONIALS.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="mr-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                          <img 
                            src={testimonial.avatar || `https://placehold.co/100x100?text=${testimonial.name[0]}`}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://placehold.co/100x100?text=${testimonial.name[0]}`;
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <p className="text-sm text-gray-500">{testimonial.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex mb-3">
                      {renderStars(testimonial.rating)}
                    </div>
                    
                    <blockquote className="text-gray-700 italic">
                      "{testimonial.quote}"
                    </blockquote>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-8 gap-2">
            <CarouselPrevious className="static" />
            <CarouselNext className="static" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}