import jsPDF from "jspdf";

export type OrderPdfData = {
  id: string | number;
  order_number?: string;
  status?: string;
  created_at?: string;
  phone_model?: string;
  phone_variant?: string;
  phone_condition?: string;
  price?: number;
  pickup_date?: string;
  time_slot?: string;
  full_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  payment_method?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  agent_name?: string;
  agent_phone?: string;
};

// --- Utils ---

function safeText(value: unknown) {
  return String(value ?? "").trim();
}

function formatCurrencyINR(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "";
  // Changed to "Rs." to prevent the weird '1' symbol glitch in standard fonts
  return `Rs. ${n.toLocaleString("en-IN")}`; 
}

function formatDate(value: unknown, options?: Intl.DateTimeFormatOptions) {
  const raw = safeText(value);
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-IN", options);
}

// --- PDF Generator ---

export async function createOrderPdfBlob(order: OrderPdfData): Promise<Blob> {
  // Initialize Doc
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  
  // -- Design Constants --
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2;
  
  // Colors (RGB)
  const COLOR_PRIMARY = [0, 0, 0];       // Black
  const COLOR_ACCENT = [30, 144, 255];   // Dodger Blue (Professional look)
  const COLOR_SUBTEXT = [100, 100, 100]; // Grey for labels
  const COLOR_BG_SECTION = [248, 249, 250]; // Very light grey for sections

  let y = 0;

  // 1. TOP ACCENT BAR
  doc.setFillColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
  doc.rect(0, 0, pageWidth, 6, "F");
  y = 50;

  // 2. HEADER SECTION
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text("Order Details", marginX, y);
  
  // Status Badge (Right aligned)
  const statusText = safeText(order.status).toUpperCase();
  if (statusText) {
    doc.setFontSize(10);
    const badgeWidth = doc.getTextWidth(statusText) + 20;
    const badgeHeight = 18;
    const badgeX = pageWidth - marginX - badgeWidth;
    const badgeY = y - 14;

    // Badge Background
    doc.setFillColor(COLOR_BG_SECTION[0], COLOR_BG_SECTION[1], COLOR_BG_SECTION[2]);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 4, 4, "FD");
    
    // Badge Text
    doc.setTextColor(50, 50, 50);
    doc.text(statusText, badgeX + 10, badgeY + 12);
  }

  y += 30; // Spacing after title

  // 3. ORDER INFO SUB-HEADER
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_SUBTEXT[0], COLOR_SUBTEXT[1], COLOR_SUBTEXT[2]);

  const orderNo = safeText(order.order_number) || `ORD-${safeText(order.id)}`;
  const placedOn = formatDate(order.created_at, { day: "numeric", month: "long", year: "numeric" });
  
  // Draw Order ID and Date on one line separated by a dot
  doc.text(`Order #${orderNo}   |   ${placedOn}`, marginX, y);
  
  y += 20;
  doc.setDrawColor(230, 230, 230); // Light divider
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 25;

  // --- HELPER FOR SECTIONS ---
  
  const renderSectionTitle = (title: string) => {
    // Background strip for title
    doc.setFillColor(COLOR_BG_SECTION[0], COLOR_BG_SECTION[1], COLOR_BG_SECTION[2]);
    doc.rect(marginX, y - 14, contentWidth, 24, "F");

    // Left Accent Border
    doc.setFillColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
    doc.rect(marginX, y - 14, 4, 24, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text(title.toUpperCase(), marginX + 15, y + 2);
    y += 25; // Space below header
  };

  const renderRow = (label: string, value: string, isCurrency = false) => {
    if (!value) return;

    const labelWidth = 120; // FIXED WIDTH for labels (The solution to misalignment)
    const valueX = marginX + labelWidth;
    const valueMaxWidth = contentWidth - labelWidth;

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(COLOR_SUBTEXT[0], COLOR_SUBTEXT[1], COLOR_SUBTEXT[2]);
    doc.text(label, marginX, y);

    // Value (Handle Wrapping)
    doc.setFont("helvetica", isCurrency ? "bold" : "medium"); // Bold for money
    doc.setTextColor(isCurrency ? 0 : 40); // Black for money, dark grey for text
    
    // Special check for currency to make it pop
    if(isCurrency) {
        doc.setFontSize(12);
        doc.setTextColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
    } else {
        doc.setFontSize(10);
    }

    const splitTitle = doc.splitTextToSize(value, valueMaxWidth);
    doc.text(splitTitle, valueX, y);

    // Dynamic height adjustment based on how many lines the value took
    const lines = splitTitle.length;
    y += (16 * lines) + 4; // Add a little extra padding
  };

  // ===== DEVICE DETAILS =====
  renderSectionTitle("Device Information");
  y += 10;
  renderRow("Model", safeText(order.phone_model));
  renderRow("Variant", safeText(order.phone_variant));
  renderRow("Condition", safeText(order.phone_condition));
  y += 5; // Extra breathing room
  renderRow("Estimated Price", formatCurrencyINR(order.price), true); // Pass true for currency
  y += 15;

  // ===== PICKUP DETAILS =====
  renderSectionTitle("Pickup Logistics");
  y += 10;
  renderRow(
    "Scheduled Date",
    formatDate(order.pickup_date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  );
  renderRow("Time Slot", safeText(order.time_slot));
  
  const addr = [safeText(order.full_address), safeText(order.city), safeText(order.state), safeText(order.pincode)]
    .filter(Boolean)
    .join(", ");
  renderRow("Address", addr);
  y += 15;

  // ===== CUSTOMER DETAILS =====
  renderSectionTitle("Customer Details");
  y += 10;
  renderRow("Name", safeText(order.customer_name));
  renderRow("Contact", safeText(order.customer_phone));
  renderRow("Email", safeText(order.customer_email));
  y += 15;

  // ===== AGENT =====
  if (safeText(order.agent_name) || safeText(order.agent_phone)) {
    renderSectionTitle("Pickup Agent");
    y += 10;
    renderRow("Name", safeText(order.agent_name));
    renderRow("Phone", safeText(order.agent_phone));
    y += 15;
  }

  // ===== PAYMENT =====
  renderSectionTitle("Payment Information");
  y += 10;
  renderRow("Method", safeText(order.payment_method).toUpperCase());
  renderRow("Final Amount", formatCurrencyINR(order.price), true);
  
  // ===== FOOTER =====
  const pageHeightReal = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150);
  const footerText = `Generated on ${new Date().toLocaleString("en-IN")}`;
  doc.text(footerText, marginX, pageHeightReal - 20);

  return doc.output("blob");
}

export async function downloadOrderPdf(order: OrderPdfData) {
  const blob = await createOrderPdfBlob(order);
  const orderNo = safeText(order.order_number) || `ORD-${safeText(order.id)}`;
  const filename = `${orderNo}.pdf`;
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function shareOrderPdf(order: OrderPdfData) {
  const blob = await createOrderPdfBlob(order);
  const orderNo = safeText(order.order_number) || `ORD-${safeText(order.id)}`;
  const file = new File([blob], `${orderNo}.pdf`, { type: "application/pdf" });
  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
  };
  if (typeof nav.share === "function" && (!nav.canShare || nav.canShare({ files: [file] }))) {
    await nav.share({
      title: "Order Details",
      text: `Order ${orderNo}`,
      files: [file],
    });
    return;
  }
  await downloadOrderPdf(order);
}