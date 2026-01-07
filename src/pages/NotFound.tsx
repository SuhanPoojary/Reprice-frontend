import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mb-6">
            <h1 className="text-9xl font-bold text-gray-200">404</h1>
          </div>
          <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            The page you are looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>
          <div className="space-x-4">
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
            <Link to="/sell-phone">
              <Button variant="outline">Sell Your Phone</Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}