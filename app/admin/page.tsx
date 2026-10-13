"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Package,
  PlusCircle,
  Trash2,
  Eye,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle,
  X,
  Edit3,
  Settings,
  Sparkles,
  ShoppingBag,
  List,
  Upload,
  Lock,
  LogOut,
  KeyRound
} from "lucide-react";

// 🔑 حدد كلمة المرور الخاصة بك هنا (أو استبدلها بمتغير بيئة process.env.NEXT_PUBLIC_ADMIN_PASSWORD)
const ADMIN_PASSWORD = "Admin@Diyafa2026"; 

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

interface Category {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  // حالة التحقق من كلمة المرور
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<"products" | "add" | "analytics" | "settings">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitCount, setVisitCount] = useState(0);

  // حالات إدارة الفئات (Modal)
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  // حالة نموذج إضافة/تعديل منتج
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([""]);

  // حالات التحميل عند رفع الصور من الجهاز
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // التحقق من الجلسة عند فتح الصفحة وجلب البيانات
  useEffect(() => {
    const authStatus = sessionStorage.getItem("diyafa_admin_auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      fetchProducts();
      fetchAnalytics();
      fetchCategories();
    }
  }, []);

  // جلب الفئات من Supabase
  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (!error && data) {
      setCategoriesList(data);
      if (data.length > 0 && (!category || !data.some(c => c.name === category))) {
        setCategory(data[0].name);
      }
    }
  };

  // دالة تسجيل الدخول
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("diyafa_admin_auth", "true");
      setAuthError(false);
      fetchProducts();
      fetchAnalytics();
      fetchCategories();
    } else {
      setAuthError(true);
    }
  };

  // دالة تسجيل الخروج
  const handleLogout = () => {
    sessionStorage.removeItem("diyafa_admin_auth");
    setIsAuthenticated(false);
    setEnteredPassword("");
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    const { count, error } = await supabase.from("analytics").select("*", { count: "exact", head: true });
    if (!error && count !== null) {
      setVisitCount(count);
    }
  };

  // دالة إضافة فئة جديدة
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const { error } = await supabase.from("categories").insert([{ name: newCatName.trim() }]);
    if (error) {
      alert("خطأ أثناء إضافة الفئة: " + error.message);
    } else {
      setNewCatName("");
      fetchCategories();
    }
  };

  // دالة تعديل اسم فئة
  const handleUpdateCategory = async (id: string) => {
    if (!editingCatName.trim()) return;
    const { error } = await supabase.from("categories").update({ name: editingCatName.trim() }).eq("id", id);
    if (error) {
      alert("خطأ أثناء تحديث الفئة: " + error.message);
    } else {
      setEditingCatId(null);
      fetchCategories();
      fetchProducts();
    }
  };

  // دالة حذف فئة
  const handleDeleteCategory = async (id: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذه الفئة؟")) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) {
        alert("خطأ أثناء الحذف: " + error.message);
      } else {
        fetchCategories();
      }
    }
  };

  // دالة رفع الصورة الرئيسية من الجهاز
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingMain(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `main_${Date.now()}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      setMainImage(data.publicUrl);
    } catch (err: any) {
      alert("خطأ أثناء رفع الصورة الرئيسية: " + err.message);
    } finally {
      setUploadingMain(false);
    }
  };

  // دالة رفع صورة إضافية من الجهاز
  const handleAdditionalImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingIndex(index);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `extra_${Date.now()}_${index}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      const updated = [...additionalImages];
      updated[index] = data.publicUrl;
      setAdditionalImages(updated);
    } catch (err: any) {
      alert("خطأ أثناء رفع الصورة الإضافية: " + err.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleAddImageField = () => {
    setAdditionalImages([...additionalImages, ""]);
  };

  const handleImageChange = (index: number, value: string) => {
    const updated = [...additionalImages];
    updated[index] = value;
    setAdditionalImages(updated);
  };

  const handleRemoveImageField = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setOriginalPrice("");
    setCategory(categoriesList.length > 0 ? categoriesList[0].name : "");
    setMainImage("");
    setAdditionalImages([""]);
  };

  const handleEditInit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(product.price.toString());
    setOriginalPrice(product.original_price ? product.original_price.toString() : "");
    setCategory(product.category || (categoriesList.length > 0 ? categoriesList[0].name : ""));
    setMainImage(product.image_url || "");
    setAdditionalImages(product.images_url && product.images_url.length > 0 ? product.images_url : [""]);
    setActiveTab("add");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainImage) return alert("يرجى اختيار أو إضافة صورة رئيسية للمنتج أولاً");

    setSaving(true);
    setMessage(null);

    const filteredAdditionalImages = additionalImages.map((img) => img.trim()).filter((img) => img !== "");

    const productPayload = {
      name,
      description,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      category,
      image_url: mainImage,
      images_url: filteredAdditionalImages,
    };

    let error;
    if (editingId) {
      const res = await supabase.from("products").update(productPayload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("products").insert([productPayload]);
      error = res.error;
    }

    if (error) {
      setMessage({ type: "error", text: "حدث خطأ أثناء حفظ المنتج: " + error.message });
    } else {
      setMessage({ type: "success", text: editingId ? "تم تحديث المنتج بنجاح ✨" : "تمت إضافة المنتج بنجاح ✨" });
      resetForm();
      fetchProducts();
      setTimeout(() => {
        setActiveTab("products");
        setMessage(null);
      }, 1500);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت تأكد من رغبتك في حذف هذا المنتج نهائياً؟")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert("حدث خطأ أثناء الحذف");
      }
    }
  };

  const totalProducts = products.length;
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price || 0), 0);

  // 🔒 إذا لم يتم تسجيل الدخول، اعرض واجهة حماية كلمة المرور
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f0d0b] text-[#f5ebd9] flex items-center justify-center p-4 font-sans dir-rtl">
        <div className="w-full max-w-md bg-[#161310] border border-[#e2c99a]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#e2c99a] via-[#f3dfb7] to-[#e2c99a]" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1c1814] border border-[#e2c99a]/30 flex items-center justify-center text-[#f3dfb7]">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#e2c99a] via-[#f3dfb7] to-[#d1be9b] font-serif">
              DIYAFA HOME
            </h1>
            <p className="text-xs text-[#a39281] mt-1 font-medium">لوحة التحكم المحمية</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#f3dfb7] mb-2 flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                كلمة المرور الإدارية
              </label>
              <input
                type="password"
                required
                value={enteredPassword}
                onChange={(e) => {
                  setEnteredPassword(e.target.value);
                  setAuthError(false);
                }}
                placeholder="أدخل رمز الدخول الخاص بالمشرف..."
                className="w-full bg-[#1c1814] border border-[#e2c99a]/20 rounded-2xl px-4 py-3 text-sm text-[#f5ebd9] focus:outline-none focus:border-[#e2c99a] transition-all text-center tracking-widest"
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 font-bold text-center bg-rose-950/40 border border-rose-500/20 py-2 rounded-xl">
                ⚠️ كلمة المرور غير صحيحة، يرجى المحاولة مجدداً.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#e2c99a] via-[#f3dfb7] to-[#e2c99a] text-[#0f0d0b] font-black py-3.5 rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-95"
            >
              دخول إلى اللوحة
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-[#e2c99a]/10 text-center">
            <span className="text-[10px] text-[#827160]">جميع الحقوق محفوظة © DIYAFA HOME</span>
          </div>
        </div>
      </div>
    );
  }

  // 🔓 عند نجاح الدخول: عرض لوحة التحكم الكاملة
  return (
    <div className="min-h-screen bg-[#0f0d0b] text-[#f5ebd9] flex font-sans selection:bg-[#f3dfb7] selection:text-[#0f0d0b]">
      {/* القائمة الجانبية (Sidebar) */}
      <aside className="w-64 bg-[#161310] border-l border-[#e2c99a]/20 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          {/* الشعار */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#e2c99a] via-[#f3dfb7] to-[#d1be9b] p-[1px]">
              <div className="w-full h-full bg-[#161310] rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#f3dfb7]" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#e2c99a] via-[#f3dfb7] to-[#d1be9b]">
                DIYAFA HOME
              </h1>
              <span className="text-[9px] text-[#a39281] font-semibold tracking-widest block -mt-1">
                لوحة التحكم الإدارية
              </span>
            </div>
          </div>

          {/* روابط التصفح */}
          <nav className="space-y-2">
            <button
              onClick={() => { resetForm(); setActiveTab("products"); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "products"
                  ? "bg-gradient-to-r from-[#e2c99a] to-[#f3dfb7] text-[#0f0d0b] shadow-lg"
                  : "text-[#a39281] hover:text-[#f5ebd9] hover:bg-[#1c1814]"
              }`}
            >
              <Package className="w-4 h-4" />
              إدارة المنتجات ({totalProducts})
            </button>

            <button
              onClick={() => { resetForm(); setActiveTab("add"); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "add"
                  ? "bg-gradient-to-r from-[#e2c99a] to-[#f3dfb7] text-[#0f0d0b] shadow-lg"
                  : "text-[#a39281] hover:text-[#f5ebd9] hover:bg-[#1c1814]"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              {editingId ? "تعديل منتج" : "إضافة منتج جديد"}
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "analytics"
                  ? "bg-gradient-to-r from-[#e2c99a] to-[#f3dfb7] text-[#0f0d0b] shadow-lg"
                  : "text-[#a39281] hover:text-[#f5ebd9] hover:bg-[#1c1814]"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              التحليلات والزيارات
            </button>

            <button
              onClick={() => setIsCatModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-[#f3dfb7] bg-[#1c1814] hover:bg-[#26201b] border border-[#e2c99a]/30 transition-all shadow-md mt-4"
            >
              ⚙️ إدارة الفئات
            </button>
          </nav>
        </div>

        {/* أسفل القائمة: زر تسجيل الخروج والمعلومات */}
        <div className="pt-6 border-t border-[#e2c99a]/15 space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/20 hover:bg-rose-950/50 border border-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
          <div className="text-[11px] text-[#827160]">
            DIYAFA HOME Admin v2.0
          </div>
        </div>
      </aside>

      {/* المحتوى الرئيسي (Main Content) */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {/* شريط الموبايل */}
        <div className="flex md:hidden justify-between items-center mb-8 bg-[#161310] p-4 rounded-2xl border border-[#e2c99a]/20">
          <span className="font-bold text-sm text-[#f3dfb7]">DIYAFA Admin</span>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("products")}
              className={`p-2 rounded-xl text-xs font-bold ${activeTab === "products" ? "bg-[#e2c99a] text-[#0f0d0b]" : "bg-[#1c1814]"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`p-2 rounded-xl text-xs font-bold ${activeTab === "add" ? "bg-[#e2c99a] text-[#0f0d0b]" : "bg-[#1c1814]"}`}
            >
              <PlusCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="p-2 rounded-xl text-xs font-bold bg-[#1c1814] text-[#f3dfb7] border border-[#e2c99a]/30"
              title="إدارة الفئات"
            >
              ⚙️
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-xs font-bold bg-rose-950/30 text-rose-400 border border-rose-500/20"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* الترويسة الرئيسية والإحصائيات السريعة */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#161310] p-6 rounded-3xl border border-[#e2c99a]/20 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs text-[#a39281] font-semibold block mb-1">إجمالي المنتجات</span>
              <span className="text-3xl font-black text-[#f3dfb7]">{totalProducts}</span>
            </div>
            <div className="p-3 bg-[#e2c99a]/10 rounded-2xl border border-[#e2c99a]/20">
              <ShoppingBag className="w-6 h-6 text-[#e2c99a]" />
            </div>
          </div>

          <div className="bg-[#161310] p-6 rounded-3xl border border-[#e2c99a]/20 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs text-[#a39281] font-semibold block mb-1">قيمة المنتجات المسجلة</span>
              <span className="text-3xl font-black text-[#f3dfb7]">{totalInventoryValue} <span className="text-xs">AED</span></span>
            </div>
            <div className="p-3 bg-[#e2c99a]/10 rounded-2xl border border-[#e2c99a]/20">
              <DollarSign className="w-6 h-6 text-[#e2c99a]" />
            </div>
          </div>

          <div className="bg-[#161310] p-6 rounded-3xl border border-[#e2c99a]/20 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs text-[#a39281] font-semibold block mb-1">إجمالي الزيارات</span>
              <span className="text-3xl font-black text-[#f3dfb7]">{visitCount}</span>
            </div>
            <div className="p-3 bg-[#e2c99a]/10 rounded-2xl border border-[#e2c99a]/20">
              <Eye className="w-6 h-6 text-[#e2c99a]" />
            </div>
          </div>
        </div>

        {/* قسم إضافة / تعديل منتج (Add / Edit Product) */}
        {activeTab === "add" && (
          <div className="bg-[#161310] p-8 rounded-3xl border border-[#e2c99a]/20 shadow-2xl max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-[#f8f3eb] mb-6 flex items-center gap-3">
              <PlusCircle className="w-6 h-6 text-[#f3dfb7]" />
              {editingId ? "تعديل بيانات المنتج" : "إضافة منتج جديد وتجهيز الصور"}
            </h2>

            {message && (
              <div
                className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-2 ${
                  message.type === "success" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30" : "bg-rose-950/80 text-rose-300 border border-rose-500/30"
                }`}
              >
                {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#a39281] mb-2">اسم المنتج *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: طقم ترامس الشامبانيا الملكي"
                    className="w-full bg-[#1c1814] border border-[#e2c99a]/20 rounded-2xl px-4 py-3 text-sm text-[#f5ebd9] focus:outline-none focus:border-[#e2c99a]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-[#a39281]">الفئة *</label>
                    <button
                      type="button"
                      onClick={() => setIsCatModalOpen(true)}
                      className="text-[11px] text-[#e2c99a] hover:underline font-bold flex items-center gap-1"
                    >
                      ⚙️ إدارة الفئات
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#1c1814] border border-[#e2c99a]/20 rounded-2xl px-4 py-3 text-sm text-[#f5ebd9] focus:outline-none focus:border-[#e2c99a]"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#a39281] mb-2">السعر الحالي (AED) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="مثال: 299"
                    className="w-full bg-[#1c1814] border border-[#e2c99a]/20 rounded-2xl px-4 py-3 text-sm text-[#f5ebd9] focus:outline-none focus:border-[#e2c99a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#a39281] mb-2">السعر قبل الخصم (اختياري)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="مثال: 380"
                    className="w-full bg-[#1c1814] border border-[#e2c99a]/20 rounded-2xl px-4 py-3 text-sm text-[#f5ebd9] focus:outline-none focus:border-[#e2c99a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a39281] mb-2">وصف المنتج</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب وصفاً جذاباً للمنتج ومواصفاته..."
                  className="w-full bg-[#1c1814] border border-[#e2c99a]/20 rounded-2xl p-4 text-sm text-[#f5ebd9] focus:outline-none focus:border-[#e2c99a]"
                />
              </div>

              {/* قسم الصورة الرئيسية */}
              <div className="p-5 bg-[#1c1814] rounded-2xl border border-[#e2c99a]/15 space-y-3">
                <label className="block text-xs font-bold text-[#f3dfb7] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#e2c99a]" />
                  الصورة الرئيسية للمنتج *
                </label>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#e2c99a] text-[#0f0d0b] hover:bg-[#f3dfb7] text-xs font-bold rounded-xl cursor-pointer transition-all shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingMain ? "جاري الرفع..." : "رفع من الجهاز"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingMain}
                      onChange={handleMainImageUpload}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="url"
                    required
                    value={mainImage}
                    onChange={(e) => setMainImage(e.target.value)}
                    placeholder="أو الصق رابط الصورة مباشر..."
                    className="flex-1 bg-[#161310] border border-[#e2c99a]/20 rounded-xl px-4 py-2.5 text-xs text-[#f5ebd9] focus:outline-none focus:border-[#e2c99a]"
                  />
                </div>

                {mainImage && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#e2c99a]/30">
                      <img src={mainImage} alt="Main Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-emerald-400 font-bold">✓ تم تجهيز الصورة الرئيسية</span>
                  </div>
                )}
              </div>

              {/* قسم الصور الإضافية */}
              <div className="p-5 bg-[#1c1814] rounded-2xl border border-[#e2c99a]/15 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#f3dfb7] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#e2c99a]" />
                    صور إضافية للمنتج (معرض الصور)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddImageField}
                    className="text-xs bg-[#e2c99a]/10 text-[#f3dfb7] hover:bg-[#e2c99a]/20 px-3 py-1.5 rounded-xl font-bold transition-all border border-[#e2c99a]/20"
                  >
                    + إضافة صورة أخرى
                  </button>
                </div>

                {additionalImages.map((url, idx) => (
                  <div key={idx} className="space-y-2 border-b border-[#e2c99a]/10 pb-3 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 px-3 py-2 bg-[#e2c99a]/20 text-[#f3dfb7] hover:bg-[#e2c99a]/30 text-xs font-bold rounded-xl cursor-pointer transition-all shrink-0 border border-[#e2c99a]/30">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingIndex === idx ? "جاري الرفع..." : "من الجهاز"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingIndex === idx}
                          onChange={(e) => handleAdditionalImageUpload(idx, e)}
                          className="hidden"
                        />
                      </label>

                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        placeholder={`رابط الصورة الإضافية (${idx + 1})`}
                        className="flex-1 bg-[#161310] border border-[#e2c99a]/20 rounded-xl px-4 py-2 text-xs text-[#f5ebd9] focus:outline-none focus:border-[#e2c99a]"
                      />

                      {additionalImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImageField(idx)}
                          className="p-2 text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all"
                          title="حذف الحقل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {url && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#e2c99a]/30">
                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving || uploadingMain || uploadingIndex !== null}
                  className="flex-1 bg-gradient-to-r from-[#e2c99a] via-[#f3dfb7] to-[#e2c99a] text-[#0f0d0b] font-black py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl disabled:opacity-50"
                >
                  {saving ? "جاري الحفظ..." : editingId ? "تحديث المنتج" : "نشر المنتج في المتجر"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 bg-[#1c1814] text-[#a39281] hover:text-[#f5ebd9] font-bold rounded-2xl border border-[#e2c99a]/20"
                  >
                    إلغاء التعديل
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* قسم عرض المنتجات وإدارتها (Products List & Actions) */}
        {activeTab === "products" && (
          <div className="bg-[#161310] p-6 rounded-3xl border border-[#e2c99a]/20 shadow-2xl">
            <h2 className="text-xl font-black text-[#f8f3eb] mb-6 flex items-center justify-between flex-wrap gap-4">
              <span>قائمة منتجات المتجر الحالية</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsCatModalOpen(true)}
                  className="text-xs bg-[#1c1814] border border-[#e2c99a]/40 text-[#f3dfb7] px-4 py-2 rounded-xl font-bold hover:bg-[#26201b] transition-all"
                >
                  ⚙️ إدارة الفئات
                </button>
                <button
                  onClick={() => { resetForm(); setActiveTab("add"); }}
                  className="text-xs bg-gradient-to-r from-[#e2c99a] to-[#f3dfb7] text-[#0f0d0b] px-4 py-2 rounded-xl font-bold"
                >
                  + إضافة منتج
                </button>
              </div>
            </h2>

            {loading ? (
              <div className="text-center py-12 text-[#a39281]">جاري تحميل البيانات...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-[#a39281]">لا توجد منتجات حالياً.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-[#e2c99a]/15 text-[#a39281] text-xs">
                      <th className="pb-4 pr-4">المنتج</th>
                      <th className="pb-4">الفئة</th>
                      <th className="pb-4">السعر</th>
                      <th className="pb-4">الصور الإضافية</th>
                      <th className="pb-4 pl-4 text-left">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2c99a]/10">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-[#1c1814]/50 transition-colors">
                        <td className="py-4 pr-4 flex items-center gap-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#e2c99a]/20"
                          />
                          <div>
                            <div className="font-bold text-[#f8f3eb]">{product.name}</div>
                            <div className="text-xs text-[#827160] line-clamp-1">{product.description}</div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-xs bg-[#e2c99a]/10 text-[#f3dfb7] px-2.5 py-1 rounded-full border border-[#e2c99a]/20">
                            {product.category || "عام"}
                          </span>
                        </td>
                        <td className="py-4 font-black text-[#f3dfb7]">{product.price} AED</td>
                        <td className="py-4 text-xs text-[#a39281]">
                          {product.images_url && product.images_url.length > 0 ? (
                            <span className="text-emerald-400 font-bold">{product.images_url.length} صور إضافية</span>
                          ) : (
                            "صورة واحدة"
                          )}
                        </td>
                        <td className="py-4 pl-4 text-left">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditInit(product)}
                              className="p-2 bg-[#1c1814] text-[#f3dfb7] hover:bg-[#e2c99a] hover:text-[#0f0d0b] rounded-xl transition-all border border-[#e2c99a]/20"
                              title="تعديل"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 bg-[#1c1814] text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all border border-rose-500/20"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* قسم التحليلات والزيارات (Analytics) */}
        {activeTab === "analytics" && (
          <div className="bg-[#161310] p-8 rounded-3xl border border-[#e2c99a]/20 shadow-2xl">
            <h2 className="text-xl font-black text-[#f8f3eb] mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-[#f3dfb7]" />
              نشاط المتجر والزيارات
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-[#1c1814] rounded-2xl border border-[#e2c99a]/15">
                <span className="text-xs text-[#a39281] block mb-2 font-bold">حالة التتبع والزيارات</span>
                <p className="text-sm text-[#f8f3eb] leading-relaxed">
                  يتم تسجيل زيارات المتجر بشكل تلقائي ومباشر في جدول التحليلات لتزويدك بقراءات موثوقة حول اهتمام عملاء الإمارات بالتشكيلات.
                </p>
                <div className="mt-4 pt-4 border-t border-[#e2c99a]/10 flex justify-between items-center">
                  <span className="text-xs text-[#a39281]">عدد زيارات الواجهة الرئيسية:</span>
                  <span className="text-lg font-black text-[#f3dfb7]">{visitCount} زيارة</span>
                </div>
              </div>

              <div className="p-6 bg-[#1c1814] rounded-2xl border border-[#e2c99a]/15">
                <span className="text-xs text-[#a39281] block mb-2 font-bold">توزيع الفئات المتاحة</span>
                <div className="space-y-2 mt-3">
                  {categoriesList.map((cat) => {
                    const count = products.filter((p) => p.category === cat.name).length;
                    return (
                      <div key={cat.id} className="flex justify-between items-center text-xs">
                        <span className="text-[#f5ebd9]">{cat.name}</span>
                        <span className="font-bold text-[#f3dfb7] bg-[#161310] px-2.5 py-1 rounded-lg border border-[#e2c99a]/20">
                          {count} منتجات
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* نافذة (Modal) إدارة الفئات */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#161310] border border-[#e2c99a]/30 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#e2c99a]/20">
              <h3 className="text-base font-bold text-[#f8f3eb]">إدارة فئات المنتجات</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-[#a39281] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* حقل إضافة فئة جديدة */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="اسم الفئة الجديدة..."
                className="bg-[#1c1814] border border-[#e2c99a]/25 rounded-xl px-4 py-2 text-xs text-[#f5ebd9] flex-1 focus:outline-none focus:border-[#e2c99a]"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="bg-[#e2c99a] text-[#0f0d0b] px-4 py-2 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity"
              >
                إضافة
              </button>
            </div>

            {/* قائمة الفئات مع خيارات التعديل والحذف */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {categoriesList.map((cat) => (
                <div key={cat.id} className="flex justify-between items-center bg-[#1c1814] p-3 rounded-xl border border-[#e2c99a]/15">
                  {editingCatId === cat.id ? (
                    <input
                      type="text"
                      value={editingCatName}
                      onChange={(e) => setEditingCatName(e.target.value)}
                      className="bg-[#161310] border border-[#e2c99a] text-xs text-[#f5ebd9] px-2 py-1 rounded focus:outline-none flex-1 ml-2"
                      autoFocus
                    />
                  ) : (
                    <span className="text-xs font-semibold text-[#f5ebd9]">{cat.name}</span>
                  )}

                  <div className="flex items-center gap-2 shrink-0">
                    {editingCatId === cat.id ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateCategory(cat.id)}
                        className="text-xs text-emerald-400 font-bold px-2 py-1 bg-emerald-950/40 rounded border border-emerald-500/25"
                      >
                        حفظ
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(cat.id);
                          setEditingCatName(cat.name);
                        }}
                        className="text-xs text-[#e2c99a] px-2 py-1 bg-[#e2c99a]/10 rounded border border-[#e2c99a]/25"
                      >
                        تعديل
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-xs text-rose-400 px-2 py-1 bg-rose-950/40 rounded border border-rose-500/25"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}