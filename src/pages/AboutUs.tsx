import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-50">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              About MobileTrade
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              India's leading platform for selling used smartphones
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Our Story</h2>
              <div className="prose prose-lg">
                <p>
                  Founded in 2018, MobileTrade started with a simple idea: to
                  create a transparent, hassle-free way for people to sell their
                  used smartphones for the best possible price.
                </p>
                <p>
                  What began as a small startup operating out of a single office
                  in Mumbai has now grown into India's leading platform for
                  selling used phones, with operations in over 1,500 cities and
                  towns across the country.
                </p>
                <p>
                  Our journey has been driven by a passion for technology and a
                  commitment to creating a circular economy where devices find
                  new homes instead of ending up in landfills. By extending the
                  lifecycle of smartphones, we're not only providing value to
                  our customers but also contributing to a more sustainable
                  future.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission & Vision */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                  <p className="text-gray-600">
                    To create a seamless marketplace that offers the best value
                    for used mobile devices while promoting sustainability
                    through device reuse and responsible recycling.
                  </p>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                  <p className="text-gray-600">
                    To become the world's most trusted platform for buying and
                    selling pre-owned technology, making device upgrades
                    affordable and environmentally responsible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold">Our Values</h2>
              <p className="text-gray-600">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Transparency</h3>
                <p className="text-gray-600">
                  We believe in complete honesty about our pricing, processes,
                  and policies. No hidden fees, no last-minute surprises.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Innovation</h3>
                <p className="text-gray-600">
                  We continuously improve our technology and processes to offer
                  the best experience and value to our customers.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Sustainability</h3>
                <p className="text-gray-600">
                  We're committed to extending the lifecycle of electronic
                  devices and reducing e-waste through responsible recycling
                  practices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold">Our Leadership Team</h2>
              <p className="text-gray-600">
                The people behind MobileTrade's success
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {/* Team Member 1 */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                  <img
                    src="/assets/team/ceo.png"
                    alt="CEO"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/200x200?text=CEO";
                    }}
                  />
                </div>
                <h3 className="font-semibold">Rohit Sharma</h3>
                <p className="text-sm text-gray-500">CEO & Founder</p>
              </div>

              {/* Team Member 2 */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                  <img
                    src="/assets/team/cto.png"
                    alt="CTO"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/200x200?text=CTO";
                    }}
                  />
                </div>
                <h3 className="font-semibold">Priya Patel</h3>
                <p className="text-sm text-gray-500">CTO</p>
              </div>

              {/* Team Member 3 */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                  <img
                    src="/assets/team/coo.png"
                    alt="COO"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/200x200?text=COO";
                    }}
                  />
                </div>
                <h3 className="font-semibold">Vikram Mehta</h3>
                <p className="text-sm text-gray-500">COO</p>
              </div>

              {/* Team Member 4 */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                  <img
                    src="/assets/team/cmo.png"
                    alt="CMO"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/200x200?text=CMO";
                    }}
                  />
                </div>
                <h3 className="font-semibold">Aditi Singh</h3>
                <p className="text-sm text-gray-500">CMO</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
