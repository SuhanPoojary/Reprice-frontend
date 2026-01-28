import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-50">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  About MobileTrade
                </h1>
                <p className="text-lg md:text-xl opacity-90 max-w-xl">
                  We help you sell your phone with an instant AI quote, free pickup, and fast payments.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm">
                    Transparent pricing
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm">
                    Doorstep pickup
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm">
                    Secure data handling
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-white/10 to-white/0 blur-xl" />
                <img
                  src="/images/landing_page.jpg"
                  alt="MobileTrade overview"
                  className="relative w-full rounded-2xl shadow-xl object-cover max-h-[360px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Our Story</h2>
              <div className="prose prose-lg">
                <p>
                  MobileTrade started with a simple idea: make selling used smartphones as easy as ordering food.
                  Pick your model, answer a few condition questions, and get an instant quote.
                </p>
                <p>
                  We built this platform to remove haggling, hidden deductions, and uncertainty.
                  Our pricing is transparent, and our pickup flow is designed to be fast and friendly.
                </p>
                <p>
                  Every device that gets a second life helps reduce e-waste.
                  We refurbish and responsibly recycle so phones find new homes instead of landfills.
                </p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold">10 min</div>
                  <div className="text-sm text-gray-600 mt-1">Typical pickup inspection time</div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold">Instant</div>
                  <div className="text-sm text-gray-600 mt-1">AI-assisted quoting</div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold">Secure</div>
                  <div className="text-sm text-gray-600 mt-1">Data reset checklist & guidance</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                  <p className="text-gray-600">
                    Make selling a phone simple, transparent, and fair — with clear condition checks and instant payouts.
                  </p>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                  <p className="text-gray-600">
                    Build the most trusted circular marketplace for pre-owned devices, reducing e-waste and making upgrades affordable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What we buy (with images) */}
        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold">We Buy Popular Models</h2>
              <p className="text-gray-600">From flagship iPhones to Android favorites</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {["/assets/phones/iphone-13-pro.png", "/assets/phones/iphone-12.png", "/assets/phones/pixel6-pro.png", "/assets/phones/galaxy-s21.png"].map(
                (src) => (
                  <div key={src} className="bg-white rounded-xl border shadow-sm p-4 flex items-center justify-center">
                    <img src={src} alt="Phone" className="h-24 w-auto object-contain" />
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-14 bg-white">
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

        {/* Team */}
        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold">Our Leadership Team</h2>
              <p className="text-gray-600">A small team obsessed with customer experience</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { name: "Rohit Sharma", role: "Founder" },
                { name: "Priya Patel", role: "Engineering" },
                { name: "Vikram Mehta", role: "Operations" },
                { name: "Aditi Singh", role: "Growth" },
              ].map((member) => {
                const initials = member.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]!.toUpperCase())
                  .join("");

                return (
                  <div key={member.name} className="text-center">
                    <div className="w-28 h-28 rounded-full mx-auto mb-4 grid place-items-center bg-gradient-to-br from-primary/20 to-primary/5 border">
                      <span className="text-2xl font-bold text-primary">{initials}</span>
                    </div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
