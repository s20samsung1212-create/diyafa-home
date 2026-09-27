'use client';

import React, { useState } from 'react';

export interface GiftOptions {
  isGift: boolean;
  packageType: 'royal' | 'classic' | 'none';
  senderName: string;
  recipientName: string;
  cardMessage: string;
}

interface GiftCustomizationProps {
  onChange?: (options: GiftOptions) => void;
}

export const GiftCustomization: React.FC<GiftCustomizationProps> = ({ onChange }) => {
  const [options, setOptions] = useState<GiftOptions>({
    isGift: false,
    packageType: 'royal',
    senderName: '',
    recipientName: '',
    cardMessage: '',
  });

  const updateOptions = (updated: Partial<GiftOptions>) => {
    const newOptions = { ...options, ...updated };
    setOptions(newOptions);
    if (onChange) onChange(newOptions);
  };

  return (
    <div className="bg-[#14120e] border border-[#e2c99a]/30 rounded-xl p-6 my-6 text-right">
      {/* التفعيل */}
      <div className="flex items-center justify-between cursor-pointer" onClick={() => updateOptions({ isGift: !options.isGift })}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1e1914] rounded-lg border border-[#e2c99a]/20 text-[#e2c99a]">
            🎁
          </div>
          <div>
            <h4 className="text-base font-bold text-[#f5ebd9]">خدمة الإهداء والتغليف الملكي</h4>
            <p className="text-xs text-[#f5ebd9]/60">إرسال الطلب كهدية فاخرة مع بطاقة إهداء مخصصة</p>
          </div>
        </div>

        <input
          type="checkbox"
          checked={options.isGift}
          onChange={(e) => updateOptions({ isGift: e.target.checked })}
          className="w-5 h-5 accent-[#e2c99a] cursor-pointer"
        />
      </div>

      {/* خيارات الإهداء التفصيلية */}
      {options.isGift && (
        <div className="mt-6 pt-6 border-t border-[#26201b] space-y-5 animate-fadeIn">
          {/* نوع التغليف */}
          <div>
            <label className="block text-xs font-semibold text-[#e2c99a] mb-3">اختر نوع التغليف الفاخر:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                onClick={() => updateOptions({ packageType: 'royal' })}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  options.packageType === 'royal'
                    ? 'border-[#e2c99a] bg-[#1e1914]'
                    : 'border-[#26201b] bg-[#0f0d0b] hover:border-[#e2c99a]/40'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-[#f5ebd9]">التغليف الملكي المخملي</span>
                  <span className="text-xs text-[#e2c99a] font-semibold">+ 50 ر.س</span>
                </div>
                <p className="text-xs text-[#f5ebd9]/60">صندوق ملكي فاخر، شريط ستان ذهبي، وشمع ختم رسمي.</p>
              </div>

              <div
                onClick={() => updateOptions({ packageType: 'classic' })}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  options.packageType === 'classic'
                    ? 'border-[#e2c99a] bg-[#1e1914]'
                    : 'border-[#26201b] bg-[#0f0d0b] hover:border-[#e2c99a]/40'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-[#f5ebd9]">التغليف الذهبي الكلاسيكي</span>
                  <span className="text-xs text-[#e2c99a] font-semibold">+ 30 ر.س</span>
                </div>
                <p className="text-xs text-[#f5ebd9]/60">غلاف مصمم بشعار ضيافة هوم المذهب مع كرت أنيق.</p>
              </div>
            </div>
          </div>

          {/* بيانات بطاقة المعايدة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#f5ebd9]/80 mb-1">اسم المرسل إليه:</label>
              <input
                type="text"
                placeholder="مثال: سمو الأمير / الأخت العزيزة"
                value={options.recipientName}
                onChange={(e) => updateOptions({ recipientName: e.target.value })}
                className="w-full bg-[#0f0d0b] border border-[#26201b] focus:border-[#e2c99a] rounded-lg p-2.5 text-sm text-[#f5ebd9] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-[#f5ebd9]/80 mb-1">اسم إهداء من:</label>
              <input
                type="text"
                placeholder="اسمك أو لقبك"
                value={options.senderName}
                onChange={(e) => updateOptions({ senderName: e.target.value })}
                className="w-full bg-[#0f0d0b] border border-[#26201b] focus:border-[#e2c99a] rounded-lg p-2.5 text-sm text-[#f5ebd9] outline-none transition-colors"
              />
            </div>
          </div>

          {/* نص الرسالة */}
          <div>
            <label className="block text-xs text-[#f5ebd9]/80 mb-1">رسالة المعايدة المخصصة (تُطبع داخل كرت فاخر):</label>
            <textarea
              rows={3}
              placeholder="اكتب أرق الكلمات والتبريكات ليتم طباعتها بفرشاة خط عربي فاخرة..."
              value={options.cardMessage}
              onChange={(e) => updateOptions({ cardMessage: e.target.value })}
              className="w-full bg-[#0f0d0b] border border-[#26201b] focus:border-[#e2c99a] rounded-lg p-3 text-sm text-[#f5ebd9] outline-none transition-colors resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};