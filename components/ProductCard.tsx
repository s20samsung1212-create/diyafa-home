'use client';

import React, { useState } from 'react';
import { useWishlist, Product } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const isFavorite = isInWishlist(product.id);

  // رابط المنتج للمشاركة
  const productUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/products/${product.id}` 
    : '';

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`شاهد هذا الطقم الفاخر من ضيافة هوم: ${product.name}\n${productUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="product-card group relative bg-[#14120e] border border-[#26201b] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#e2c99a]/50">
      
      {/* Container الصورة مع تأثير التكبير */}
      <div className="product-image-container relative h-72 w-full bg-[#0f0d0b]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />

        {/* أزرار المفضلة والمشاركة العائمة */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {/* زر المفضلة */}
          <button
            onClick={() => toggleWishlist(product)}
            className="p-2.5 rounded-full bg-[#0f0d0b]/80 backdrop-blur-md border border-[#e2c99a]/30 text-[#e2c99a] hover:scale-110 transition-all duration-200"
            title="إضافة للمفضلة"
          >
            <svg
              className={`w-5 h-5 ${isFavorite ? 'fill-[#e2c99a]' : 'fill-none stroke-current'}`}
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* زر المشاركة */}
          <button
            onClick={() => setShowShareModal(true)}
            className="p-2.5 rounded-full bg-[#0f0d0b]/80 backdrop-blur-md border border-[#e2c99a]/30 text-[#e2c99a] hover:scale-110 transition-all duration-200"
            title="مشاركة الطقم"
          >
            <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>
      </div>

      {/* تفاصيل المنتج */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-[#f5ebd9] mb-1">{product.name}</h3>
        <p className="text-[#e2c99a] font-semibold text-base mb-4">{product.price} ر.س</p>

        {/* زر الإضافة للسلة مع التوهج الذهبي */}
        <button className="w-full py-3 bg-[#1e1914] text-[#e2c99a] font-medium text-sm rounded-lg btn-gold-glow flex items-center justify-center gap-2">
          <span>إضافة إلى السلة</span>
        </button>
      </div>

      {/* نافذة خيارات المشاركة Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#14120e] border border-[#e2c99a]/40 rounded-xl p-6 w-full max-w-sm text-right">
            <h4 className="text-lg font-bold text-[#f5ebd9] mb-2">مشاركة الطقم الفاخر</h4>
            <p className="text-xs text-[#f5ebd9]/70 mb-5">شاركي الفخامة مع الأصدقاء والعائلة عبر الرابط المباشر أو الواتساب.</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={shareToWhatsApp}
                className="w-full py-3 bg-[#25D366] text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                المشاركة عبر الواتساب
              </button>

              <button
                onClick={copyLink}
                className="w-full py-3 bg-[#26201b] border border-[#e2c99a]/30 text-[#e2c99a] font-medium text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-[#332a24] transition-colors"
              >
                {copied ? 'تم نسخ الرابط!' : 'نسخ الرابط المباشر'}
              </button>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2 text-xs text-[#f5ebd9]/50 hover:text-[#f5ebd9] mt-2"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};