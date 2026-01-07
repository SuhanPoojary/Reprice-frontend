import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Box,
  HardDrive,
  Smartphone,
  DollarSign,
  Home,
} from "lucide-react";

// Mock data for a phone
const PHONE_DATA = {
  "iphone-13-pro": {
    id: "iphone-13-pro",
    name: "iPhone 13 Pro",
    brand: "Apple",
    image: "/assets/phones/iphone-13-pro.png",
    releaseYear: 2021,
    description:
      "The iPhone 13 Pro is Apple's flagship phone featuring a Pro camera system, Super Retina XDR display with ProMotion, and A15 Bionic chip.",
    basePrice: 45000,
    ramOptions: [
      { id: "4gb", name: "4GB", priceAdjustment: -5000 },
      { id: "6gb", name: "6GB", priceAdjustment: 0 },
      { id: "8gb", name: "8GB", priceAdjustment: 3000 },
    ],
    storageOptions: [
      { id: "128gb", name: "128GB", priceAdjustment: -5000 },
      { id: "256gb", name: "256GB", priceAdjustment: 0 },
      { id: "512gb", name: "512GB", priceAdjustment: 5000 },
      { id: "1tb", name: "1TB", priceAdjustment: 10000 },
    ],
    screenConditions: [
      {
        id: "good",
        name: "Good",
        description: "No scratches, pristine condition",
        priceAdjustment: 0,
      },
      {
        id: "minor-scratches",
        name: "Minor Scratches",
        description: "Light scratches, barely visible",
        priceAdjustment: -2000,
      },
      {
        id: "major-scratches",
        name: "Major Scratches",
        description: "Visible scratches across screen",
        priceAdjustment: -5000,
      },
      {
        id: "cracked",
        name: "Cracked",
        description: "Screen has cracks but functional",
        priceAdjustment: -10000,
      },
      {
        id: "shattered",
        name: "Shattered",
        description: "Severely damaged screen",
        priceAdjustment: -15000,
      },
    ],
  },
  "samsung-s21-ultra": {
    id: "samsung-s21-ultra",
    name: "Galaxy S21 Ultra",
    brand: "Samsung",
    image: "/assets/phones/samsung-s21.png",
    releaseYear: 2021,
    description:
      "The Samsung Galaxy S21 Ultra features a 108MP camera, 100x Space Zoom, Dynamic AMOLED 2X display, and Exynos 2100/Snapdragon 888 processor.",
    basePrice: 40000,
    ramOptions: [
      { id: "8gb", name: "8GB", priceAdjustment: -3000 },
      { id: "12gb", name: "12GB", priceAdjustment: 0 },
      { id: "16gb", name: "16GB", priceAdjustment: 5000 },
    ],
    storageOptions: [
      { id: "128gb", name: "128GB", priceAdjustment: -3000 },
      { id: "256gb", name: "256GB", priceAdjustment: 0 },
      { id: "512gb", name: "512GB", priceAdjustment: 4000 },
    ],
    screenConditions: [
      {
        id: "good",
        name: "Good",
        description: "No scratches, pristine condition",
        priceAdjustment: 0,
      },
      {
        id: "minor-scratches",
        name: "Minor Scratches",
        description: "Light scratches, barely visible",
        priceAdjustment: -4000,
      },
      {
        id: "major-scratches",
        name: "Major Scratches",
        description: "Visible scratches across screen",
        priceAdjustment: -8000,
      },
      {
        id: "cracked",
        name: "Cracked",
        description: "Screen has cracks but functional",
        priceAdjustment: -18000,
      },
      {
        id: "shattered",
        name: "Shattered",
        description: "Severely damaged screen",
        priceAdjustment: -25000,
      },
    ],
  },
};

const STEPS = [
  { id: 1, name: "RAM", icon: HardDrive },
  { id: 2, name: "Storage", icon: HardDrive },
  { id: 3, name: "Condition", icon: Smartphone },
  { id: 4, name: "Final Quote", icon: DollarSign },
];

export default function PhoneDetail() {
  const { phoneId } = useParams<{ phoneId: string }>();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [selectedRam, setSelectedRam] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [selectedScreenCondition, setSelectedScreenCondition] = useState("");
  const [deviceTurnsOn, setDeviceTurnsOn] = useState<string>("");
  const [hasOriginalBox, setHasOriginalBox] = useState<string>("");
  const [hasOriginalBill, setHasOriginalBill] = useState<string>("");
  const [isUnderWarranty, setIsUnderWarranty] = useState<string>("");
  const [apiPrice, setApiPrice] = useState<number | null>(null);
  const [apiBasePrice, setApiBasePrice] = useState<number | null>(null);
  const [apiLogs, setApiLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const passedPhone = location.state?.phoneData;
  let phoneData = phoneId ? PHONE_DATA[phoneId as keyof typeof PHONE_DATA] : null;

  if (!phoneData && passedPhone) {
    const p = passedPhone;
    phoneData = {
      id: p.id,
      name: p.name,
      brand: p.brand,
      image: p.image,
      releaseYear: 2023,
      description: `Sell your ${p.name} for the best price.`,
      basePrice: p.maxPrice,
      ramOptions: [{ id: "standard", name: "Standard", priceAdjustment: 0 }],
      storageOptions: [
        { id: "standard", name: "Standard", priceAdjustment: 0 },
      ],
      screenConditions: [
        {
          id: "good",
          name: "Good",
          description: "No scratches, pristine condition",
          priceAdjustment: 0,
        },
        {
          id: "minor-scratches",
          name: "Minor Scratches",
          description: "Light scratches, barely visible",
          priceAdjustment: -Math.round(p.maxPrice * 0.1),
        },
        {
          id: "major-scratches",
          name: "Major Scratches",
          description: "Visible scratches across screen",
          priceAdjustment: -Math.round(p.maxPrice * 0.25),
        },
        {
          id: "cracked",
          name: "Cracked",
          description: "Screen has cracks but functional",
          priceAdjustment: -Math.round(p.maxPrice * 0.5),
        },
        {
          id: "shattered",
          name: "Shattered",
          description: "Severely damaged screen",
          priceAdjustment: -Math.round(p.maxPrice * 0.75),
        },
      ],
    };
  }

  const phone = phoneData || PHONE_DATA["iphone-13-pro"];

  useEffect(() => {
    if (phone.ramOptions.length === 1 && !selectedRam) {
      setSelectedRam(phone.ramOptions[0].id);
    }
    if (phone.storageOptions.length === 1 && !selectedStorage) {
      setSelectedStorage(phone.storageOptions[0].id);
    }
  }, [phone]);

  useEffect(() => {
    if (currentStep === 4) {
      fetchPriceFromBackend();
    }
  }, [currentStep]);

  const fetchPriceFromBackend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/calculate-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_name: phone.name,
          turns_on: deviceTurnsOn === "yes",
          screen_condition:
            phone.screenConditions.find((s) => s.id === selectedScreenCondition)
              ?.name || "Good",
          has_box: hasOriginalBox === "yes",
          has_bill: hasOriginalBill === "yes",
          is_under_warranty: isUnderWarranty === "yes",
        }),
      });
      const data = await response.json();
      setApiPrice(data.final_price);
      setApiBasePrice(data.base_price);
      setApiLogs(data.logs || []);
    } catch (error) {
      console.error("Error fetching price:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate final price
  const calculatePrice = () => {
    let price = phone.basePrice;

    // RAM adjustment
    const ramAdj =
      phone.ramOptions.find((r) => r.id === selectedRam)?.priceAdjustment || 0;
    price += ramAdj;

    // Storage adjustment
    const storageAdj =
      phone.storageOptions.find((s) => s.id === selectedStorage)
        ?.priceAdjustment || 0;
    price += storageAdj;

    // Screen condition adjustment
    const screenAdj =
      phone.screenConditions.find((s) => s.id === selectedScreenCondition)
        ?.priceAdjustment || 0;
    price += screenAdj;

    // Device turns on bonus
    if (deviceTurnsOn === "yes") price += 2000;
    else if (deviceTurnsOn === "no") price -= 8000;

    // Original box bonus
    if (hasOriginalBox === "yes") price += 1000;

    // Original bill bonus
    if (hasOriginalBill === "yes") price += 1500;

    return Math.max(price, 0);
  };

  // AI Reasoning Logic
  const generateAIReasoning = () => {
    const reasons = [];

    const ramOption = phone.ramOptions.find((r) => r.id === selectedRam);
    if (ramOption) {
      if (ramOption.priceAdjustment > 0) {
        reasons.push(
          `✓ Higher RAM (${
            ramOption.name
          }) increases resale value by ₹${ramOption.priceAdjustment.toLocaleString()}`
        );
      } else if (ramOption.priceAdjustment < 0) {
        reasons.push(
          `• Lower RAM (${ramOption.name}) reduces value by ₹${Math.abs(
            ramOption.priceAdjustment
          ).toLocaleString()}`
        );
      }
    }

    const storageOption = phone.storageOptions.find(
      (s) => s.id === selectedStorage
    );
    if (storageOption) {
      if (storageOption.priceAdjustment > 0) {
        reasons.push(
          `✓ Higher storage (${
            storageOption.name
          }) adds ₹${storageOption.priceAdjustment.toLocaleString()} to value`
        );
      } else if (storageOption.priceAdjustment < 0) {
        reasons.push(
          `• Lower storage (${storageOption.name}) reduces value by ₹${Math.abs(
            storageOption.priceAdjustment
          ).toLocaleString()}`
        );
      }
    }

    const screenOption = phone.screenConditions.find(
      (s) => s.id === selectedScreenCondition
    );
    if (screenOption) {
      if (screenOption.priceAdjustment === 0) {
        reasons.push(`✓ Excellent screen condition maintains full value`);
      } else {
        reasons.push(
          `• Screen condition (${
            screenOption.name
          }) reduces value by ₹${Math.abs(
            screenOption.priceAdjustment
          ).toLocaleString()}`
        );
      }
    }

    if (deviceTurnsOn === "yes") {
      reasons.push(`✓ Device powers on properly adds ₹2,000`);
    } else if (deviceTurnsOn === "no") {
      reasons.push(
        `• Device not turning on significantly reduces value by ₹8,000`
      );
    }

    if (hasOriginalBox === "yes") {
      reasons.push(`✓ Original box included adds ₹1,000`);
    }

    if (hasOriginalBill === "yes") {
      reasons.push(
        `✓ Original bill/invoice adds ₹1,500 (proof of authenticity)`
      );
    }

    return reasons;
  };

  const canProceed = () => {
    if (currentStep === 1) return selectedRam !== "";
    if (currentStep === 2) return selectedStorage !== "";
    if (currentStep === 3)
      return (
        selectedScreenCondition !== "" &&
        deviceTurnsOn !== "" &&
        hasOriginalBox !== "" &&
        hasOriginalBill !== "" &&
        isUnderWarranty !== ""
      );
    return true;
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />

      <main className="flex-grow flex items-center">
        <div className="container mx-auto px-4 py-8 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full max-h-[calc(100vh-200px)]">
            {/* Left Side - Question/Info Panel */}
            <div className="flex flex-col justify-between bg-white/40 backdrop-blur-sm rounded-3xl p-8 lg:p-12">
              {/* Header */}
              <div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
                >
                  <ArrowLeft size={20} />
                  <span className="font-medium">Homepage</span>
                </Link>

                {/* Step indicator */}
                <div className="mb-8">
                  <p className="text-sm font-medium text-blue-600 mb-2">
                    step {currentStep}/{STEPS.length}
                  </p>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Question Title */}
                <div className="mb-8">
                  {currentStep === 1 && (
                    <>
                      <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
                        What is your RAM?
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Select the RAM capacity
                      </p>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
                        Storage capacity?
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Select your device storage
                      </p>
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
                        Device Condition?
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Help us assess your device
                      </p>
                    </>
                  )}
                  {currentStep === 4 && (
                    <>
                      <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
                        Your Final Quote
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Based on your selections
                      </p>
                    </>
                  )}
                </div>

                {/* Phone Info Card */}
                <Card className="bg-white/60 backdrop-blur border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          phone.image ||
                          `https://placehold.co/100x100?text=${phone.name}`
                        }
                        alt={phone.name}
                        className="w-20 h-20 object-contain"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src = `https://placehold.co/100x100?text=${phone.name}`;
                        }}
                      />
                      <div>
                        <h3 className="font-bold text-lg">{phone.name}</h3>
                        <p className="text-sm text-gray-600">
                          {phone.brand} • {phone.releaseYear}
                        </p>
                        <p className="text-sm font-semibold text-blue-600 mt-1">
                          Base: ₹
                          {(apiBasePrice !== null
                            ? apiBasePrice
                            : phone.basePrice
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom - Navigation & Day */}
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-400 lowercase">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </p>
                  <div className="flex gap-3">
                    {currentStep > 1 && currentStep < 4 && (
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="rounded-full px-6"
                      >
                        Previous
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Options Panel */}
            <div className="flex flex-col justify-center">
              <div className="max-w-xl mx-auto w-full space-y-4">
                {/* Step 1: RAM Selection */}
                {currentStep === 1 && (
                  <RadioGroup
                    value={selectedRam}
                    onValueChange={setSelectedRam}
                    className="space-y-4"
                  >
                    {phone.ramOptions.map((ram) => (
                      <div key={ram.id}>
                        <RadioGroupItem
                          value={ram.id}
                          id={`ram-${ram.id}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`ram-${ram.id}`}
                          className="flex items-center gap-4 border-2 rounded-2xl p-5 cursor-pointer peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all hover:shadow-lg"
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedRam === ram.id
                                ? "border-blue-600 bg-blue-600"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedRam === ram.id && (
                              <div className="w-3 h-3 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="font-semibold text-lg flex-grow">
                            {ram.name}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Step 2: Storage Selection */}
                {currentStep === 2 && (
                  <RadioGroup
                    value={selectedStorage}
                    onValueChange={setSelectedStorage}
                    className="space-y-4"
                  >
                    {phone.storageOptions.map((storage) => (
                      <div key={storage.id}>
                        <RadioGroupItem
                          value={storage.id}
                          id={`storage-${storage.id}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`storage-${storage.id}`}
                          className="flex items-center gap-4 border-2 rounded-2xl p-5 cursor-pointer peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all hover:shadow-lg"
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedStorage === storage.id
                                ? "border-blue-600 bg-blue-600"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedStorage === storage.id && (
                              <div className="w-3 h-3 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="font-semibold text-lg flex-grow">
                            {storage.name}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Step 3: Condition Assessment */}
                {currentStep === 3 && (
                  <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Screen Condition */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">
                        Screen Condition
                      </h4>
                      <RadioGroup
                        value={selectedScreenCondition}
                        onValueChange={setSelectedScreenCondition}
                        className="space-y-3"
                      >
                        {phone.screenConditions.map((condition) => (
                          <div key={condition.id}>
                            <RadioGroupItem
                              value={condition.id}
                              id={`screen-${condition.id}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`screen-${condition.id}`}
                              className="flex items-start gap-3 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                            >
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                  selectedScreenCondition === condition.id
                                    ? "border-blue-600 bg-blue-600"
                                    : "border-gray-300"
                                }`}
                              >
                                {selectedScreenCondition === condition.id && (
                                  <div className="w-3 h-3 rounded-full bg-white" />
                                )}
                              </div>
                              <div className="flex-grow">
                                <div className="font-semibold">
                                  {condition.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {condition.description}
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Device Turns On */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">
                        Device turns on?
                      </h4>
                      <RadioGroup
                        value={deviceTurnsOn}
                        onValueChange={setDeviceTurnsOn}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <RadioGroupItem
                            value="yes"
                            id="turns-on-yes"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="turns-on-yes"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <Check size={18} />
                            <span className="font-semibold">Yes</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="no"
                            id="turns-on-no"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="turns-on-no"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:bg-red-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <span className="font-semibold">No</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Original Box */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">
                        Original box?
                      </h4>
                      <RadioGroup
                        value={hasOriginalBox}
                        onValueChange={setHasOriginalBox}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <RadioGroupItem
                            value="yes"
                            id="box-yes"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="box-yes"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <Box size={18} />
                            <span className="font-semibold">Yes</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="no"
                            id="box-no"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="box-no"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-gray-600 peer-data-[state=checked]:bg-gray-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <span className="font-semibold">No</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Original Bill */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">
                        Original bill/invoice?
                      </h4>
                      <RadioGroup
                        value={hasOriginalBill}
                        onValueChange={setHasOriginalBill}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <RadioGroupItem
                            value="yes"
                            id="bill-yes"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="bill-yes"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <Check size={18} />
                            <span className="font-semibold">Yes</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="no"
                            id="bill-no"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="bill-no"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-gray-600 peer-data-[state=checked]:bg-gray-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <span className="font-semibold">No</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Under Warranty */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">
                        Is device under warranty?
                      </h4>
                      <RadioGroup
                        value={isUnderWarranty}
                        onValueChange={setIsUnderWarranty}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <RadioGroupItem
                            value="yes"
                            id="warranty-yes"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="warranty-yes"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <Check size={18} />
                            <span className="font-semibold">Yes</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="no"
                            id="warranty-no"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="warranty-no"
                            className="flex items-center justify-center gap-2 border-2 rounded-2xl p-4 cursor-pointer peer-data-[state=checked]:border-gray-600 peer-data-[state=checked]:bg-gray-50 hover:bg-white/80 bg-white/60 backdrop-blur transition-all"
                          >
                            <span className="font-semibold">No</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}

                {/* Step 4: Final Quote */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* Price Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
                      <p className="text-sm opacity-90 mb-2">Estimated Value</p>
                      {isLoading ? (
                        <p className="text-4xl font-bold mb-4 animate-pulse">
                          Calculating...
                        </p>
                      ) : (
                        <p className="text-6xl font-bold mb-4">
                          ₹
                          {(apiPrice !== null
                            ? apiPrice
                            : calculatePrice()
                          ).toLocaleString()}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm opacity-90">
                        <Check size={16} />
                        <span>Instant payment upon verification</span>
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="bg-white/80 backdrop-blur rounded-3xl p-6 max-h-[40vh] overflow-y-auto custom-scrollbar">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                          AI
                        </span>
                        Price Breakdown
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm pb-3 border-b">
                          <span className="text-gray-600">Base Price</span>
                          <span className="font-semibold">
                            ₹
                            {(apiBasePrice !== null
                              ? apiBasePrice
                              : phone.basePrice
                            ).toLocaleString()}
                          </span>
                        </div>
                        {apiLogs.length > 0
                          ? apiLogs.map((log, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-gray-700 pl-4 border-l-2 border-blue-300 py-1"
                              >
                                {log}
                              </div>
                            ))
                          : generateAIReasoning().map((reason, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-gray-700 pl-4 border-l-2 border-blue-300 py-1"
                              >
                                {reason}
                              </div>
                            ))}
                        <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between font-bold">
                          <span>Final Price</span>
                          <span className="text-blue-600">
                            ₹
                            {(apiPrice !== null
                              ? apiPrice
                              : calculatePrice()
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link to="/checkout">
                      <Button className="w-full h-14 text-lg rounded-2xl">
                        Proceed to Sell <ArrowRight className="ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Next Button for steps 1-3 */}
                {currentStep < 4 && (
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={!canProceed()}
                      className="rounded-2xl px-8 py-6 text-lg"
                      size="lg"
                    >
                      Next
                      <ArrowRight className="ml-2" size={20} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
