import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-50">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              How MobileTrade Works
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Sell your old phone in 3 simple steps
            </p>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Step 1 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-16">
                <div className="md:col-span-2 order-2 md:order-1">
                  <img
                    src="/assets/how-it-works-1.png"
                    alt="Get a quote"
                    className="w-full rounded-lg shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/600x400?text=Get+a+Quote";
                    }}
                  />
                </div>
                <div className="md:col-span-3 order-1 md:order-2">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3">
                      1
                    </div>
                    <h2 className="text-2xl font-bold">Get an Instant Quote</h2>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Select your phone's brand and model from our extensive
                    catalog. Answer a few simple questions about its condition,
                    such as whether the screen is cracked, if there are dents,
                    or if there are functionality issues.
                  </p>
                  <p className="text-gray-600">
                    Based on your responses, our advanced algorithm will
                    calculate the best possible price for your device instantly.
                    No waiting, no haggling, just a fair and transparent offer.
                  </p>
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                    <h3 className="font-semibold mb-2">Pro Tips:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>
                        Be honest about your device condition for accurate
                        pricing
                      </li>
                      <li>
                        Have your IMEI number ready for a more precise quote
                      </li>
                      <li>
                        Check if any accessories like chargers can increase your
                        offer
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-16">
                <div className="md:col-span-3">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3">
                      2
                    </div>
                    <h2 className="text-2xl font-bold">
                      Schedule a Free Pickup
                    </h2>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Once you're happy with the quote, schedule a pickup at a
                    time and location that's convenient for you. Our pickup
                    service is completely free and available in over 1,500
                    cities and towns across the country.
                  </p>
                  <p className="text-gray-600">
                    Our trained executives will come to your doorstep with all
                    the necessary equipment to verify your device's condition.
                    They'll perform a quick diagnostic test to ensure everything
                    matches your description.
                  </p>
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                    <h3 className="font-semibold mb-2">What to expect:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>
                        Our executive will arrive within the scheduled time
                        window
                      </li>
                      <li>
                        The condition check takes approximately 10-15 minutes
                      </li>
                      <li>You'll need to provide a valid ID proof</li>
                      <li>
                        Make sure to back up and reset your device before the
                        pickup
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <img
                    src="/assets/how-it-works-2.png"
                    alt="Schedule pickup"
                    className="w-full rounded-lg shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/600x400?text=Schedule+Pickup";
                    }}
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                <div className="md:col-span-2 order-2 md:order-1">
                  <img
                    src="/assets/how-it-works-3.png"
                    alt="Get paid"
                    className="w-full rounded-lg shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/600x400?text=Get+Paid";
                    }}
                  />
                </div>
                <div className="md:col-span-3 order-1 md:order-2">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3">
                      3
                    </div>
                    <h2 className="text-2xl font-bold">Get Instant Payment</h2>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Once the device verification is complete and everything
                    checks out, you'll receive your payment immediately. No
                    waiting periods, no delays. Choose your preferred payment
                    method:
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600">
                        Bank Transfer (IMPS/NEFT/UPI)
                      </span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600">
                        E-wallets (PayTM, PhonePe, Amazon Pay)
                      </span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600">
                        Cash payment (in select cities)
                      </span>
                    </li>
                  </ul>
                  <p className="text-gray-600">
                    Our data wiping process ensures that all your personal
                    information is completely removed from the device, giving
                    you complete peace of mind.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              <p className="text-gray-600">
                Everything you need to know about selling your phone
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold">
                  Is it safe to sell my phone online?
                </h3>
                <p className="text-gray-600 mt-2">
                  Yes, it's completely safe with MobileTrade. We ensure secure
                  data wiping of your device, and our executives are trained
                  professionals who follow strict protocols.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold">
                  What if I don't agree with the final price offered after
                  inspection?
                </h3>
                <p className="text-gray-600 mt-2">
                  You're under no obligation to sell. If you're not satisfied
                  with the final offer after inspection, you can decline it with
                  no questions asked.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold">
                  Do I need to provide any documents?
                </h3>
                <p className="text-gray-600 mt-2">
                  Yes, you'll need to provide a valid ID proof (Aadhar, PAN,
                  Driving License, etc.) and the original purchase invoice if
                  available.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold">
                  How do I prepare my phone before selling?
                </h3>
                <p className="text-gray-600 mt-2">
                  Back up your data, sign out of all accounts, remove SIM/SD
                  cards, perform a factory reset, and disable any anti-theft
                  features like Find My iPhone or Google Lock.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold">
                  Can I sell a phone with a broken screen?
                </h3>
                <p className="text-gray-600 mt-2">
                  Absolutely! We buy phones in all conditions, including those
                  with broken screens, though it will affect the final price
                  offered.
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
