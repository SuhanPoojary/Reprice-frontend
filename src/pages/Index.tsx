import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BadgeCheck,
  ChartLine,
  CheckCircle,
  DollarSign,
  PhoneIcon,
  Shield,
  Smartphone,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Zap,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { motion } from "motion/react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
  hover: {
    scale: 1.05,
    y: -10,
    transition: {
      duration: 0.3,
    },
  },
};


export default function Index() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-background pt-20 pb-32 overflow-hidden">
        {/* Subtle animated accent */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full filter blur-xl opacity-60"
          animate={{
            scale: [1, 1.05, 1],
            x: [0, 20, 0],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto mb-16"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Left: Quote & CTAs */}
            <motion.div
              className="space-y-6 text-left px-4 md:px-0"
              variants={itemVariants}
            >
              <motion.div
                className="inline-block mb-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                whileHover={{ scale: 1.03 }}
              >
                🚀 India's Leading Mobile Trade Platform
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl font-bold mb-4 text-primary leading-tight"
                variants={itemVariants}
              >
                "Turn Your Old Phone Into Instant Cash"
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg text-gray-700"
              >
                We make selling devices simple, secure and fast — instant
                quotes, doorstep pickup, and guaranteed payments. Trusted by
                thousands of customers and a growing agent network.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4 mt-4"
                variants={itemVariants}
              >
                <Link to="/sell-phone">
                  <Button className="bg-primary text-primary-foreground hover:brightness-95">
                    Sell Now
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link to="/agent/register">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    Become an Agent
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: Provided image */}
            <motion.div
              className="flex items-center justify-center"
              variants={itemVariants}
            >
              <motion.img
                src="/images/landing2.jpg"
                alt="Agent and customer interaction"
                className="w-full max-w-xl rounded-2xl shadow-2xl object-cover"
                initial={{ opacity: 0, scale: 0.98, x: 40 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                whileHover={{ scale: 1.02 }}
              />
            </motion.div>
          </motion.div>

          {/* Dual CTA Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Customer Card */}
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="border-2 border-blue-200 h-full relative overflow-hidden group">
                <CardContent className="p-8 relative z-10">
                  <motion.div
                    className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Smartphone className="text-primary-foreground" size={32} />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-4">I'm a Customer</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Sell your old phone instantly. Get the best price, free
                    doorstep pickup, and instant payment.
                  </p>
                  <motion.ul className="space-y-3 mb-8">
                    {[
                      "Instant price quotes",
                      "Free doorstep pickup",
                      "Safe & secure payment",
                      "Data wiped securely",
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-center text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                      >
                        <CheckCircle
                          className="text-green-500 mr-2 flex-shrink-0"
                          size={18}
                        />
                        {item}
                      </motion.li>
                    ))}
                  </motion.ul>
                  <Link to="/sell-phone">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="w-full bg-primary text-primary-foreground hover:brightness-95">
                        Sell Your Phone Now
                        <motion.span
                          className="inline-block ml-2"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight size={18} />
                        </motion.span>
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Agent Card */}
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="border-2 border-purple-200 h-full relative overflow-hidden group">
                <CardContent className="p-8 relative z-10">
                  <motion.div
                    className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Users className="text-primary-foreground" size={32} />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-4">I'm an Agent</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Join our network and grow your mobile trading business with
                    powerful tools and support.
                  </p>
                  <motion.ul className="space-y-3 mb-8">
                    {[
                      "Access to wide inventory",
                      "Real-time price updates",
                      "Commission management",
                      "Dedicated agent dashboard",
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-center text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                      >
                        <CheckCircle
                          className="text-green-500 mr-2 flex-shrink-0"
                          size={18}
                        />
                        {item}
                      </motion.li>
                    ))}
                  </motion.ul>
                  <Link to="/agent/register">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="w-full bg-primary text-primary-foreground hover:brightness-95">
                        Become an Agent
                        <motion.span
                          className="inline-block ml-2"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight size={18} />
                        </motion.span>
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <motion.section
        className="py-20 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose CashNow?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              The most trusted platform for buying and selling used mobile
              phones in India
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Shield,
                title: "100% Safe",
                description:
                  "Secure transactions with complete data privacy protection",
                color: "blue",
              },
              {
                icon: DollarSign,
                title: "Best Prices",
                description:
                  "Competitive market rates with instant price evaluation",
                color: "green",
              },
              {
                icon: Zap,
                title: "Instant Process",
                description: "Quick verification and same-day payment options",
                color: "purple",
              },
              {
                icon: BadgeCheck,
                title: "Verified Agents",
                description:
                  "Network of trusted and certified mobile trade professionals",
                color: "orange",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center group"
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={`bg-${feature.color}-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-${feature.color}-100 transition-colors`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className={`text-${feature.color}-600`} size={32} />
                  </motion.div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works - Customer Section */}
      <motion.section
        className="py-20 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              How It Works - For Customers
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Sell your phone in just 3 simple steps
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: PhoneIcon,
                gradient: "from-blue-500 to-indigo-600",
                badgeColor: "bg-blue-600",
                title: "Get Instant Quote",
                description:
                  "Select your phone model and condition to receive an instant price quote in seconds",
              },
              {
                icon: Truck,
                gradient: "from-purple-500 to-pink-600",
                badgeColor: "bg-purple-600",
                title: "Free Pickup",
                description:
                  "Schedule a free doorstep pickup at your convenience. Our agent will collect your device",
              },
              {
                icon: Wallet,
                gradient: "from-green-500 to-emerald-600",
                badgeColor: "bg-green-600",
                title: "Get Paid Instantly",
                description:
                  "Receive payment immediately via UPI, bank transfer, or cash after device verification",
              },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  className="relative"
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
                    <motion.div
                      className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                      whileHover={{ rotate: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Icon className="text-primary-foreground" size={28} />
                    </motion.div>
                    <motion.div
                      className={`absolute -top-4 -left-4 ${step.badgeColor} text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg`}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.2 + index * 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      {index + 1}
                    </motion.div>
                    <h3 className="font-bold text-xl mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Agent Benefits Section */}
      <motion.section
        className="py-20 bg-background"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Grow Your Business as an Agent
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Join our growing network and unlock unlimited earning potential
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: ChartLine,
                gradient: "from-blue-500 to-indigo-600",
                title: "Higher Earnings",
                description:
                  "Competitive commission structure with bonuses for top performers",
              },
              {
                icon: TrendingUp,
                gradient: "from-purple-500 to-pink-600",
                title: "Business Tools",
                description:
                  "Access advanced dashboard, analytics, and inventory management",
              },
              {
                icon: Shield,
                gradient: "from-green-500 to-emerald-600",
                title: "Full Support",
                description:
                  "Dedicated support team, training, and marketing materials",
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className="border-none shadow-lg h-full">
                    <CardContent className="p-6">
                      <motion.div
                        className="bg-primary w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                        whileHover={{ rotate: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Icon className="text-primary-foreground" size={24} />
                      </motion.div>
                      <h3 className="font-bold text-lg mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/agent/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:brightness-95"
                >
                  Start Your Agent Journey Today
                  <motion.span
                    className="inline-block ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={18} />
                  </motion.span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="py-20 bg-primary text-primary-foreground relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated background shapes */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { number: "50K+", label: "Happy Customers" },
              { number: "2K+", label: "Active Agents" },
              { number: "₹10Cr+", label: "Transactions" },
              { number: "4.8★", label: "Customer Rating" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="text-4xl md:text-5xl font-bold mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                  }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-10">
              Join thousands of satisfied customers and agents on India's most
              trusted mobile trading platform
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/sell-phone">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:brightness-95 w-full sm:w-auto"
                  >
                    <Smartphone className="mr-2" size={20} />
                    Sell My Phone
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/agent/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-primary text-primary hover:bg-primary/10 w-full sm:w-auto"
                  >
                    <Users className="mr-2" size={20} />
                    Become an Agent
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
