"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { 
  ShoppingBag, 
  MessageCircle, 
  Sparkles, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  Check, 
  Tag, 
  Images, 
  ChevronLeft, 
  ChevronRight,
  User,
  Phone,
  Globe,
  Heart,
  Share2,
  Gift,
  CheckCircle2
} from "lucide-react";

// تحميل مكوّن الـ 3D ديناميكياً
const Logo3D = dynamic(() => import("@/components/Logo3D"), { ssr: false });

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number | null;
  category?: string;
  image_url: string;      
  images_url?: string[];  
}

interface CartItem extends Product {
  quantity: number;
}

export default function HomePage() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addedAnimation, setAddedAnimation] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // حقول بيانات العميل للطلب
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [formError, setFormError] = useState("");

  // إعدادات خيار الإهداء والتغليف
  const [isGiftOptionActive, setIsGiftOptionActive] = useState(false);
  const [giftPackaging, setGiftPackaging] = useState<"gold" | "velvet">("gold");
  const [giftRecipient, setGiftRecipient] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  // حالة معرض الصور المتعددة للمنتج (Modal)
  const [activeGalleryProduct, setActiveGalleryProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const deliveryFee = 25;
  const giftFee = isGiftOptionActive ? (giftPackaging === "velvet" ? 30 : 15) : 0;

  // قاموس الترجمة
  const t = {
    ar: {
      siteTitle: "DIYAFA HOME",
      subTitle: "ضيافة هوم",
      all: "الكل",
      banner: "توصيل سريع لجميع الإمارات (25 AED) 🇦🇪",
      heroTitle: "فخامة الضيافة في كل تفصيلة ☕",
      heroDesc: "تشكيلات راقية مصممة خصيصاً للمناسبات والمجالس، تعكس أصالة الضيافة برؤية معاصرة.",
      loading: "جاري تحميل تشكيلة DIYAFA HOME...",
      noProducts: "لا توجد منتجات متوفرة في هذه الفئة حالياً.",
      specialOffer: "عرض خاص",
      imagesCount: "صور",
      priceLabel: "السعر",
      currency: "AED",
      addToCart: "إضافة للسلة",
      added: "تمت الإضافة",
      cartTitle: "سلة التسوق",
      emptyCart: "السلة فارغة حالياً.",
      deliveryData: "بيانات توصيل الطلب:",
      fullNamePlaceholder: "الاسم بالكامل *",
      phonePlaceholder: "رقم الهاتف (اختياري)",
      giftingTitle: "خدمة الإهداء والتغليف الملكي 🎁",
      giftingDesc: "اجعل هديتك تمثل الذوق الرفيع. قم بتخصيص التغليف وكتابة رسالتك الخاصة.",
      enableGift: "إضافة تغليف ورسالة إهداء للطلب",
      giftPackagingLabel: "اختر نمط التغليف:",
      giftGold: "تغليف ذهبي فاخر (+15 AED)",
      giftVelvet: "صندوق مخملي ملكي (+30 AED)",
      giftRecipientPlaceholder: "اسم المهدى إليه",
      giftMessagePlaceholder: "اكتب رسالة المعايدة الخاصة بك هنا...",
      subtotal: "المجموع الفرعي:",
      deliveryFeeLabel: "رسوم التوصيل (الإمارات 🇦🇪):",
      giftFeeLabel: "رسوم الإهداء والتغليف:",
      totalLabel: "الإجمالي النهائي:",
      checkoutBtn: "تأكيد الطلب عبر واتساب",
      nameRequired: "يرجى كتابة اسمك بالكامل لإتمام الطلب",
      noImage: "صورة غير متوفرة",
      switchLang: "English",
      wishlistTitle: "المفضلة",
      shareCopied: "تم نسخ رابط المنتج بنجاح!",
      dir: "rtl" as const
    },
    en: {
      siteTitle: "DIYAFA HOME",
      subTitle: "LUXURY HOSPITALITY",
      all: "All",
      banner: "Express Delivery Across UAE (25 AED) 🇦🇪",
      heroTitle: "Luxury Hospitality in Every Detail ☕",
      heroDesc: "Exquisite collections crafted for special occasions, blending authentic heritage with modern elegance.",
      loading: "Loading DIYAFA HOME collection...",
      noProducts: "No products available in this category.",
      specialOffer: "Special Offer",
      imagesCount: "Photos",
      priceLabel: "Price",
      currency: "AED",
      addToCart: "Add to Cart",
      added: "Added",
      cartTitle: "Shopping Cart",
      emptyCart: "Your cart is empty.",
      deliveryData: "Delivery Information:",
      fullNamePlaceholder: "Full Name *",
      phonePlaceholder: "Phone Number (Optional)",
      giftingTitle: "Royal Gifting & Packaging Service 🎁",
      giftingDesc: "Elevate your gift with custom luxury packaging and a handwritten card.",
      enableGift: "Add Gift Packaging & Custom Card",
      giftPackagingLabel: "Select Packaging Style:",
      giftGold: "Royal Gold Packaging (+15 AED)",
      giftVelvet: "Royal Velvet Box (+30 AED)",
      giftRecipientPlaceholder: "Recipient Name",
      giftMessagePlaceholder: "Write your custom gift message here...",
      subtotal: "Subtotal:",
      deliveryFeeLabel: "Delivery Fee (UAE 🇦🇪):",
      giftFeeLabel: "Gift Packaging Fee:",
      totalLabel: "Total Amount:",
      checkoutBtn: "Confirm Order via WhatsApp",
      nameRequired: "Please enter your full name to complete the order",
      noImage: "Image unavailable",
      switchLang: "العربية",
      wishlistTitle: "Wishlist",
      shareCopied: "Product link copied to clipboard!",
      dir: "ltr" as const
    }
  };

  const currentT = t[lang];
  
  // دمج خيار "الكل" مع الفئات المجلوبة من قاعدة البيانات
  const categories = [currentT.all, ...dbCategories];

  const toggleLanguage = () => {
    const nextLang = lang === "ar" ? "en" : "ar";
    setLang(nextLang);
    document.documentElement.dir = t[nextLang].dir;
    document.documentElement.lang = nextLang;
    setSelectedCategory(t[nextLang].all);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
      if (!error && data) setProducts(data);
      setLoading(false);
    };

    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("name").order("name");
      if (!error && data) {
        setDbCategories(data.map((c) => c.name));
      }
    };

    const trackVisit = async () => {
      try {
        await supabase.from("analytics").insert([{ page_path: "/", user_agent: navigator.userAgent }]);
      } catch (e) {}
    };

    fetchProducts();
    fetchCategories();
    trackVisit();
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    setAddedAnimation(product.id);
    setTimeout(() => setAddedAnimation(null), 1500);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleShareProduct = (product: Product) => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareNotice(currentT.shareCopied);
      setTimeout(() => setShareNotice(null), 2500);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const openImageGallery = (product: Product) => {
    setActiveGalleryProduct(product);
    setActiveImageIndex(0);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal > 0 ? subtotal + deliveryFee + giftFee : 0;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts =
    selectedCategory === currentT.all
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) return;

    if (!customerName.trim()) {
      setFormError(currentT.nameRequired);
      return;
    }
    setFormError("");

    // جلب رقم الواتساب من متغيرات البيئة وتنظيفه أوتوماتيكياً من الرموز والزائد
    const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971523582885";
    const whatsappNumber = rawNumber.replace(/[^0-9]/g, "");

    let itemsList = cart
      .map(
        (item) =>
          `▫️ *${item.name}*\n   • ${lang === "ar" ? "الكمية" : "Qty"}: ${item.quantity}\n   • ${lang === "ar" ? "السعر" : "Price"}: ${item.price * item.quantity} AED`
      )
      .join("\n\n");

    let giftInfoDetails = "";
    if (isGiftOptionActive) {
      giftInfoDetails = lang === "ar" ?
`\n🎁 *تفاصيل التغليف والإهداء:*
• *نوع التغليف:* ${giftPackaging === "velvet" ? "صندوق مخملي ملكي (+30 AED)" : "تغليف ذهبي فاخر (+15 AED)"}
${giftRecipient ? `• *إلى:* ${giftRecipient}\n` : ""}${giftMessage ? `• *الرسالة:* "${giftMessage}"\n` : ""}` :
`\n🎁 *Gift Packaging Details:*
• *Packaging Style:* ${giftPackaging === "velvet" ? "Royal Velvet Box (+30 AED)" : "Royal Gold Packaging (+15 AED)"}
${giftRecipient ? `• *To:* ${giftRecipient}\n` : ""}${giftMessage ? `• *Message:* "${giftMessage}"\n` : ""}`;
    }

    const message = lang === "ar" ? 
`✨ *طلب جديد من متجر DIYAFA HOME* ✨
━━━━━━━━━━━━━━━━━━

👤 *بيانات العميل:*
• *الاسم الكامل:* ${customerName.trim()}
${customerPhone ? `• *رقم التواصل:* ${customerPhone.trim()}\n` : ""}
🛍️ *تفاصيل الطلب:*
${itemsList}${giftInfoDetails}
━━━━━━━━━━━━━━━━━━
📊 *الملخص المالي:*
▫️ *مجموع المنتجات:* ${subtotal} AED
▫️ *رسوم التوصيل (جميع الإمارات 🇦🇪):* ${deliveryFee} AED
${isGiftOptionActive ? `▫️ *رسوم التغليف والإهداء:* ${giftFee} AED\n` : ""}💳 *الإجمالي النهائي:* *${total} AED*
━━━━━━━━━━━━━━━━━━

📍 *يرجى تأكيد الاستلام ومشاركتنا موقع التوصيل (Location).*
🤝 *الدفع عند الاستلام.*`
:
`✨ *New Order from DIYAFA HOME* ✨
━━━━━━━━━━━━━━━━━━

👤 *Customer Details:*
• *Full Name:* ${customerName.trim()}
${customerPhone ? `• *Contact Number:* ${customerPhone.trim()}\n` : ""}
🛍️ *Order Items:*
${itemsList}${giftInfoDetails}
━━━━━━━━━━━━━━━━━━
📊 *Financial Summary:*
▫️ *Subtotal:* ${subtotal} AED
▫️ *Delivery Fee (UAE 🇦🇪):* ${deliveryFee} AED
${isGiftOptionActive ? `▫️ *Gift Packaging Fee:* ${giftFee} AED\n` : ""}💳 *Grand Total:* *${total} AED*
━━━━━━━━━━━━━━━━━━

📍 *Please confirm order receipt and share delivery Location.*
🤝 *Cash on Delivery.*`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#0f0d0b] text-[#f5ebd9] flex flex-col font-sans selection:bg-[#f3dfb7] selection:text-[#0f0d0b] relative overflow-x-hidden">
      {/* خلفية التدرج الداكن */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3a2e1e]/25 via-[#0f0d0b] to-[#0f0d0b] pointer-events-none -z-20" />

      {/* الشعار 3D في الخلفية */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] sm:w-[750px] sm:h-[750px] pointer-events-none -z-10 opacity-35">
        <Logo3D />
      </div>

      {/* تنبيه نسخ الرابط */}
      {shareNotice && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#e2c99a] text-[#0f0d0b] text-xs font-black px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{shareNotice}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[#e2c99a]/20 bg-[#161310]/85 backdrop-blur-xl sticky top-0 z-40 transition-all shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex justify-between items-center">
          
          <div className="flex items-center gap-3.5 group cursor-pointer">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full p-[1.5px] bg-gradient-to-tr from-[#e2c99a] via-[#f3dfb7] to-[#827160] shadow-md shadow-[#e2c99a]/10 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#161310] rounded-full overflow-hidden flex items-center justify-center p-0.5">
                <img 
                  src="/logo.png" 
                  alt="DIYAFA HOME Logo" 
                  className="w-full h-full object-cover rounded-full"
                  loading="eager"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#e2c99a] via-[#f3dfb7] to-[#d1be9b] font-serif">
                {currentT.siteTitle}
              </h1>
              <span className="text-[9px] sm:text-[10px] text-[#a39281] font-medium tracking-[0.2em] -mt-0.5 uppercase">
                {currentT.subTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="px-3.5 py-1.5 bg-[#1c1814] hover:bg-[#26201b] border border-[#e2c99a]/30 rounded-full transition-all text-xs font-bold text-[#f3dfb7] flex items-center gap-1.5 shadow-md"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentT.switchLang}</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-4 py-2 bg-[#1c1814] hover:bg-[#26201b] border border-[#e2c99a]/30 rounded-full transition-all duration-200 flex items-center gap-2 group shadow-md"
            >
              <ShoppingBag className="w-4 h-4 text-[#f3dfb7] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#f5ebd9] hidden sm:inline">{currentT.cartTitle}</span>
              {totalCartCount > 0 && (
                <span className="bg-gradient-to-r from-[#e2c99a] to-[#f3dfb7] text-[#0f0d0b] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-12 px-4 max-w-4xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e2c99a]/10 border border-[#e2c99a]/20 text-[#f3dfb7] text-xs font-semibold mb-6 backdrop-blur-md">
          <span>{currentT.banner}</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-[#f8f3eb] mb-5 leading-tight tracking-tight font-serif">
          {currentT.heroTitle}
        </h2>
        <p className="text-[#a39281] text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {currentT.heroDesc}
        </p>
      </section>

      {/* شريط فلترة الفئات الديناميكي */}
      <div className="max-w-6xl mx-auto px-6 mb-10 w-full flex justify-center relative z-10">
        <div className="inline-flex p-1.5 bg-[#161310]/90 backdrop-blur-md border border-[#e2c99a]/20 rounded-full gap-1.5 sm:gap-2 flex-wrap justify-center shadow-lg">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-[#e2c99a] via-[#f3dfb7] to-[#e2c99a] text-[#0f0d0b] shadow-md scale-105"
                  : "text-[#a39281] hover:text-[#f5ebd9] hover:bg-[#1c1814]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* قائمة المنتجات */}
      <main className="max-w-6xl mx-auto px-6 pb-16 flex-1 w-full relative z-10">
        {loading ? (
          <div className="text-center py-20 text-[#a39281]">{currentT.loading}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-[#a39281]">{currentT.noProducts}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const hasDiscount = product.original_price && product.original_price > product.price;
              const allImages = [product.image_url, ...(product.images_url || [])].filter(Boolean);
              const hasMultipleImages = allImages.length > 1;
              const isWishlisted = wishlist.includes(product.id);

              return (
                <div
                  key={product.id}
                  className="bg-[#f8f3eb] border border-[#e2c99a]/60 hover:border-[#e2c99a] rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 flex flex-col shadow-[0_10px_30px_-5px_rgba(226,201,154,0.15)] hover:shadow-[0_20px_40px_-5px_rgba(226,201,154,0.25)] group relative"
                >
                  {/* علامة العرض الخاص */}
                  {hasDiscount && (
                    <div className="absolute top-4 rtl:right-4 ltr:left-4 z-10 bg-[#1c1814] text-[#f3dfb7] font-black text-[11px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-[#e2c99a]/40 tracking-wide">
                      <Tag className="w-3.5 h-3.5 text-[#e2c99a]" />
                      {currentT.specialOffer}
                    </div>
                  )}

                  {/* أزرار المفضلة والمشاركة */}
                  <div className="absolute top-4 rtl:left-4 ltr:right-4 z-10 flex items-center gap-2">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2.5 rounded-full bg-[#f8f3eb]/85 backdrop-blur-md border border-[#e2c99a] text-[#1c1814] hover:scale-110 hover:bg-[#e2c99a] transition-all shadow-md"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? "fill-[#827160] text-[#827160]" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleShareProduct(product)}
                      className="p-2.5 rounded-full bg-[#f8f3eb]/85 backdrop-blur-md border border-[#e2c99a] text-[#1c1814] hover:scale-110 hover:bg-[#e2c99a] transition-all shadow-md"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* صور متعددة */}
                  {hasMultipleImages && (
                    <button
                      onClick={() => openImageGallery(product)}
                      className="absolute bottom-4 rtl:left-4 ltr:right-4 z-10 bg-[#1c1814]/90 backdrop-blur-md text-[#f3dfb7] border border-[#e2c99a]/40 hover:bg-[#e2c99a] hover:text-[#0f0d0b] transition-all text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg"
                    >
                      <Images className="w-3.5 h-3.5 text-[#e2c99a]" />
                      <span>{allImages.length} {currentT.imagesCount}</span>
                    </button>
                  )}

                  {/* حاوية الصورة */}
                  <div 
                    className="h-72 bg-[#eae4d9] relative overflow-hidden cursor-pointer flex items-center justify-center p-4"
                    onClick={() => hasMultipleImages && openImageGallery(product)}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[#827160] text-sm">
                        {currentT.noImage}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#f8f3eb]/60 via-transparent to-transparent pointer-events-none" />
                  </div>

                  <div className="p-7 flex flex-col flex-1 justify-between gap-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-wider bg-[#e2c99a]/35 text-[#3a2e1e] px-3 py-1 rounded-full border border-[#e2c99a]/60 font-extrabold">
                          {product.category || "General"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[#1c1814] mb-2.5 group-hover:text-[#827160] transition-colors font-serif tracking-wide">
                        {product.name}
                      </h3>
                      <p className="text-[#5a4e42] text-xs sm:text-sm leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#e2c99a]/40 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[11px] text-[#827160] block mb-0.5 font-medium">{currentT.priceLabel}</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-[#1c1814] tracking-tight">
                            {product.price}{" "}
                            <span className="text-xs text-[#5a4e42] font-semibold">{currentT.currency}</span>
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-[#9a8a7a] line-through font-semibold">
                              {product.original_price} {currentT.currency}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        className={`px-4.5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all duration-300 shadow-md ${
                          addedAnimation === product.id
                            ? "bg-emerald-600 text-white scale-95"
                            : "bg-[#1c1814] hover:bg-[#26201b] text-[#f3dfb7] border border-[#e2c99a]/40 active:scale-95 hover:shadow-lg hover:shadow-[#1c1814]/20"
                        }`}
                      >
                        {addedAnimation === product.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            {currentT.added}
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 text-[#e2c99a]" />
                            {currentT.addToCart}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* قسم خدمة الإهداء والتغليف الفاخر */}
      <section className="max-w-4xl mx-auto px-6 mb-20 relative z-10 w-full">
        <div className="bg-gradient-to-b from-[#1a1612] to-[#120f0d] border border-[#e2c99a]/35 rounded-[2rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#e2c99a]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3.5 mb-3">
            <div className="p-2.5 rounded-2xl bg-[#e2c99a]/10 border border-[#e2c99a]/30 text-[#e2c99a]">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#f8f3eb] font-serif">{currentT.giftingTitle}</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#a39281] mb-6 leading-relaxed">
            {currentT.giftingDesc}
          </p>

          <label className="flex items-center gap-3 cursor-pointer mb-6 p-3.5 bg-[#1c1814] rounded-2xl border border-[#e2c99a]/30 hover:border-[#e2c99a]/60 transition-all w-fit shadow-md">
            <input
              type="checkbox"
              checked={isGiftOptionActive}
              onChange={(e) => setIsGiftOptionActive(e.target.checked)}
              className="w-4 h-4 accent-[#e2c99a] rounded cursor-pointer"
            />
            <span className="text-xs font-bold text-[#f3dfb7]">{currentT.enableGift}</span>
          </label>

          {isGiftOptionActive && (
            <div className="space-y-4 pt-6 border-t border-[#e2c99a]/20 animate-fadeIn">
              <div>
                <label className="text-xs font-semibold text-[#a39281] block mb-2.5">
                  {currentT.giftPackagingLabel}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    onClick={() => setGiftPackaging("gold")}
                    className={`p-4 rounded-2xl border text-xs font-bold transition-all rtl:text-right ltr:text-left ${
                      giftPackaging === "gold"
                        ? "border-[#e2c99a] bg-[#e2c99a]/15 text-[#f3dfb7] shadow-lg shadow-[#e2c99a]/5"
                        : "border-[#e2c99a]/20 bg-[#1c1814] text-[#a39281] hover:border-[#e2c99a]/40"
                    }`}
                  >
                    ✨ {currentT.giftGold}
                  </button>
                  <button
                    onClick={() => setGiftPackaging("velvet")}
                    className={`p-4 rounded-2xl border text-xs font-bold transition-all rtl:text-right ltr:text-left ${
                      giftPackaging === "velvet"
                        ? "border-[#e2c99a] bg-[#e2c99a]/15 text-[#f3dfb7] shadow-lg shadow-[#e2c99a]/5"
                        : "border-[#e2c99a]/20 bg-[#1c1814] text-[#a39281] hover:border-[#e2c99a]/40"
                    }`}
                  >
                    👑 {currentT.giftVelvet}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <input
                  type="text"
                  value={giftRecipient}
                  onChange={(e) => setGiftRecipient(e.target.value)}
                  placeholder={currentT.giftRecipientPlaceholder}
                  className="bg-[#1c1814] border border-[#e2c99a]/25 rounded-xl px-4 py-3 text-xs text-[#f5ebd9] focus:outline-none focus:border-[#e2c99a] transition-colors"
                />
                <input
                  type="text"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder={currentT.giftMessagePlaceholder}
                  className="bg-[#1c1814] border border-[#e2c99a]/25 rounded-xl px-4 py-3 text-xs text-[#f5ebd9] focus:outline-none focus:border-[#e2c99a] transition-colors"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* النافذة المنبثقة للصور */}
      {activeGalleryProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#161310] border border-[#e2c99a]/30 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-[#e2c99a]/20">
              <h3 className="text-base font-bold text-[#f8f3eb] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f3dfb7]" />
                {activeGalleryProduct.name}
              </h3>
              <button
                onClick={() => setActiveGalleryProduct(null)}
                className="p-1 text-[#a39281] hover:text-white rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {(() => {
              const galleryImages = [
                activeGalleryProduct.image_url,
                ...(activeGalleryProduct.images_url || []),
              ].filter(Boolean);

              return (
                <div className="p-6 flex flex-col items-center">
                  <div className="relative w-full h-[320px] sm:h-[400px] bg-[#1c1814] rounded-2xl overflow-hidden flex items-center justify-center border border-[#e2c99a]/15">
                    <img
                      src={galleryImages[activeImageIndex]}
                      alt={activeGalleryProduct.name}
                      className="w-full h-full object-contain"
                    />

                    {galleryImages.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#161310]/80 border border-[#e2c99a]/30 text-[#f3dfb7] p-2 rounded-full hover:bg-[#e2c99a] hover:text-[#0f0d0b] transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#161310]/80 border border-[#e2c99a]/30 text-[#f3dfb7] p-2 rounded-full hover:bg-[#e2c99a] hover:text-[#0f0d0b] transition-all"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {galleryImages.length > 1 && (
                    <div className="flex gap-3 mt-4 overflow-x-auto max-w-full pb-2">
                      {galleryImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                            activeImageIndex === idx
                              ? "border-[#f3dfb7] scale-105 shadow-md"
                              : "border-transparent opacity-50 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* السلة الجانبية */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#161310] border-r border-[#e2c99a]/20 h-full flex flex-col shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-[#e2c99a]/20">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#f3dfb7]" />
                <h3 className="text-lg font-bold text-[#f8f3eb]">{currentT.cartTitle}</h3>
                <span className="text-xs bg-[#e2c99a]/20 text-[#f3dfb7] px-2 py-0.5 rounded-full font-bold">
                  {totalCartCount}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 text-[#a39281] hover:text-[#f8f3eb] rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 py-4 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-[#827160]">{currentT.emptyCart}</div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-[#1c1814] p-4 rounded-2xl border border-[#e2c99a]/15"
                  >
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-bold text-[#f8f3eb] text-sm">{item.name}</h4>
                        <span className="text-xs text-[#f3dfb7] font-semibold">
                          {item.price * item.quantity} {currentT.currency}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-[#161310] rounded-xl border border-[#e2c99a]/20">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 hover:text-[#f3dfb7] text-[#a39281]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 hover:text-[#f3dfb7] text-[#a39281]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#6e5f51] hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-[#e2c99a]/20 space-y-4">
                {/* بيانات العميل */}
                <div className="bg-[#1c1814] p-4 rounded-2xl border border-[#e2c99a]/20 space-y-3">
                  <span className="text-xs font-bold text-[#f3dfb7] block mb-1">{currentT.deliveryData}</span>
                  
                  <div>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#a39281] absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={currentT.fullNamePlaceholder}
                        className="w-full bg-[#161310] border border-[#e2c99a]/20 rounded-xl rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 py-2 text-xs text-[#f5ebd9] focus:outline-none focus:border-[#e2c99a]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#a39281] absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder={currentT.phonePlaceholder}
                        className="w-full bg-[#161310] border border-[#e2c99a]/20 rounded-xl rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 py-2 text-xs text-[#f5ebd9] focus:outline-none focus:border-[#e2c99a]"
                      />
                    </div>
                  </div>

                  {formError && (
                    <p className="text-[11px] font-bold text-rose-400 mt-1">{formError}</p>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-[#a39281]">
                  <div className="flex justify-between">
                    <span>{currentT.subtotal}</span>
                    <span>{subtotal} {currentT.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{currentT.deliveryFeeLabel}</span>
                    <span>{deliveryFee} {currentT.currency}</span>
                  </div>
                  {isGiftOptionActive && (
                    <div className="flex justify-between text-[#e2c99a]">
                      <span>{currentT.giftFeeLabel}</span>
                      <span>{giftFee} {currentT.currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-[#f8f3eb] pt-2 border-t border-[#e2c99a]/15">
                    <span>{currentT.totalLabel}</span>
                    <span className="text-[#f3dfb7] text-xl font-black">{total} {currentT.currency}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutWhatsApp}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <MessageCircle className="w-5 h-5" />
                  {currentT.checkoutBtn}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}