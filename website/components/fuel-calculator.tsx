"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatVND, formatNumber } from "@/lib/format";
import type { Vehicle, FuelPriceItem } from "@/lib/types";
import Image from "next/image";

interface FuelCalculatorProps {
  selectedVehicle: Vehicle | null;
  fuelPrices: FuelPriceItem[];
}

function SegmentedControl({ 
  active, 
  onChange 
}: { 
  active: "full" | "custom"; 
  onChange: (v: "full" | "custom") => void 
}) {
  return (
    <div className="flex w-full rounded-full bg-[#f4f2ea] p-1.5 mb-8">
      <button
        type="button"
        onClick={() => onChange("full")}
        className={`flex-1 rounded-full py-3 text-[15px] font-bold transition-all ${
          active === "full" ? "bg-[#1a1a1a] text-white shadow-sm" : "text-[#737373] hover:text-[#1a1a1a]"
        }`}
      >
        Đổ đầy bình
      </button>
      <button
        type="button"
        onClick={() => onChange("custom")}
        className={`flex-1 rounded-full py-3 text-[15px] font-bold transition-all ${
          active === "custom" ? "bg-[#1a1a1a] text-white shadow-sm" : "text-[#737373] hover:text-[#1a1a1a]"
        }`}
      >
        Nhập số tiền
      </button>
    </div>
  );
}

function FuelSelector({ 
  prices, 
  selected, 
  onSelect 
}: { 
  prices: FuelPriceItem[]; 
  selected: FuelPriceItem | null; 
  onSelect: (p: FuelPriceItem) => void 
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {prices.map((p) => {
        const shortName = p.name.replace("Xăng ", "").replace("Dầu ", "").trim();
        const isActive = selected?.name === p.name;
        
        return (
          <button
            key={p.name}
            type="button"
            onClick={() => onSelect(p)}
            className={`rounded-full px-5 py-2.5 text-[15px] font-bold transition-all border ${
              isActive 
                ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" 
                : "bg-white text-[#737373] border-[#e5e5e5] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
            }`}
          >
            {shortName}
          </button>
        );
      })}
    </div>
  );
}

export function FuelCalculator({ selectedVehicle, fuelPrices }: FuelCalculatorProps) {
  const [mainTab, setMainTab] = useState<"estimate" | "pump">("estimate");
  
  // Estimate state
  const [estimateMode, setEstimateMode] = useState<"full" | "custom">("full");
  const [selectedFuel, setSelectedFuel] = useState<FuelPriceItem | null>(null);
  const [moneyInput, setMoneyInput] = useState<string>("");

  // Pump state
  const [isFilling, setIsFilling] = useState(false);
  const [fillProgress, setFillProgress] = useState(0);

  // Default fuel logic
  useEffect(() => {
    if (!selectedVehicle || fuelPrices.length === 0) return;
    const recommended = selectedVehicle.recommended_fuel.toLowerCase();
    
    const match = fuelPrices.find(
      (p) =>
        p.name.toLowerCase().includes(recommended) ||
        (recommended.includes("ron 95") && p.name.toLowerCase().includes("ron 95")) ||
        (recommended.includes("ron 92") && p.name.toLowerCase().includes("e5"))
    ) || fuelPrices[0];

    setSelectedFuel(match);
  }, [selectedVehicle, fuelPrices]);

  const fullTankCost = useMemo(() => {
    if (!selectedVehicle || !selectedFuel) return 0;
    return selectedVehicle.tank_capacity * selectedFuel.price;
  }, [selectedVehicle, selectedFuel]);

  const costPer100km = useMemo(() => {
    if (!selectedVehicle || !selectedFuel) return 0;
    return selectedVehicle.fuel_consumption * selectedFuel.price;
  }, [selectedVehicle, selectedFuel]);

  const rangeFullTank = useMemo(() => {
    if (!selectedVehicle || selectedVehicle.fuel_consumption === 0) return 0;
    return (selectedVehicle.tank_capacity / selectedVehicle.fuel_consumption) * 100;
  }, [selectedVehicle]);

  const customMoneyNum = parseFloat(moneyInput) || 0;
  const customLiters = useMemo(() => {
    if (!selectedFuel || selectedFuel.price === 0) return 0;
    return customMoneyNum / selectedFuel.price;
  }, [customMoneyNum, selectedFuel]);

  const customRange = useMemo(() => {
    if (!selectedVehicle || selectedVehicle.fuel_consumption === 0) return 0;
    return (customLiters / selectedVehicle.fuel_consumption) * 100;
  }, [customLiters, selectedVehicle]);

  const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setMoneyInput(raw);
  };

  const presetAmounts = [20000, 50000, 100000, 200000];

  const handleStartPump = () => {
    if (!selectedVehicle || !selectedFuel) return;
    const targetMoney = estimateMode === "custom" && customMoneyNum > 0 ? customMoneyNum : fullTankCost;
    if (targetMoney <= 0) return;
    setIsFilling(true);
    setFillProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += (100 / 30);
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setIsFilling(false), 300);
      }
      setFillProgress(progress);
    }, 50);
  };

  const currentPumpMoney = estimateMode === "custom" && customMoneyNum > 0 
    ? (customMoneyNum * fillProgress) / 100 
    : (fullTankCost * fillProgress) / 100;
    
  const currentPumpLiters = estimateMode === "custom" && customMoneyNum > 0
    ? (customLiters * fillProgress) / 100
    : (selectedVehicle?.tank_capacity * fillProgress) / 100;

  if (!selectedVehicle) {
    return (
      <div className="h-full min-h-[500px] rounded-3xl border-2 border-dashed border-[#e5e5e5] bg-[#fafafa] p-8 flex flex-col items-center justify-center text-center">
        <p className="text-xl font-bold tracking-tight text-[#1a1a1a]">Chưa có thông tin</p>
        <p className="text-[#8a8a8a] mt-2 max-w-xs font-medium">
          Vui lòng chọn một phương tiện từ danh sách bên cạnh để bắt đầu tính toán.
        </p>
      </div>
    );
  }

  if (selectedVehicle.fuel_consumption === 0) {
    return (
      <div className="h-full min-h-[500px] rounded-3xl bg-[#f0f9ff] border border-[#bae6fd] p-8 flex flex-col items-center justify-center text-center">
        <p className="text-3xl font-extrabold tracking-tight text-[#0369a1]">Xe Điện</p>
        <p className="text-[#0284c7] mt-3 max-w-sm font-medium">
          Phương tiện này sử dụng động cơ thuần điện, không cần tính toán chi phí đổ xăng.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-[#e5e5e5]">
      {/* Top Navbar */}
      <div className="flex border-b border-[#e5e5e5]">
        <button
          className={`flex-1 py-4 text-[15px] font-bold transition-all relative ${mainTab === "estimate" ? "text-[#1a1a1a]" : "text-[#8a8a8a] hover:text-[#1a1a1a]"}`}
          onClick={() => { setMainTab("estimate"); setFillProgress(0); setIsFilling(false); }}
        >
          Dự toán chi phí
          {mainTab === "estimate" && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#1a1a1a] rounded-t-full" />}
        </button>
        <button
          className={`flex-1 py-4 text-[15px] font-bold transition-all relative ${mainTab === "pump" ? "text-[#1a1a1a]" : "text-[#8a8a8a] hover:text-[#1a1a1a]"}`}
          onClick={() => setMainTab("pump")}
        >
          Trạm bơm ảo
          {mainTab === "pump" && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#1a1a1a] rounded-t-full" />}
        </button>
      </div>

      <div className="p-6 md:p-8">
        
        {/* ======================= TAB: ESTIMATE (LIGHT THEME) ======================= */}
        {mainTab === "estimate" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <SegmentedControl active={estimateMode} onChange={setEstimateMode} />

            <div className="mb-6">
              <p className="text-[13px] font-bold uppercase tracking-widest text-[#8a8a8a] mb-2">Kết quả ước tính</p>
              <div className="flex items-center gap-2">
                <h2 className="text-[40px] leading-none font-extrabold tracking-tight text-[#1a1a1a]">{selectedVehicle.name}</h2>
                <span className="text-2xl text-[#8a8a8a]">⌄</span>
              </div>
              <p className="text-[15px] font-medium text-[#737373] mt-2">
                Bình xăng {selectedVehicle.tank_capacity.toString().replace('.', ',')} lít • {selectedVehicle.brand}
              </p>
              
              <div className="mt-4">
                <span className="inline-flex items-center rounded-full bg-[#eef3e6] px-3.5 py-1 text-[13px] font-bold text-[#3f6212]">
                  Khuyến nghị: {selectedVehicle.recommended_fuel}
                </span>
              </div>

              {fuelPrices.length > 0 && (
                <FuelSelector prices={fuelPrices} selected={selectedFuel} onSelect={setSelectedFuel} />
              )}
            </div>

            <div className="relative min-h-[280px]">
              <AnimatePresence mode="popLayout">
                {estimateMode === "full" ? (
                  <motion.div 
                    key="full-tank"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 absolute top-0 left-0 w-full"
                  >
                    <div className="bg-[#f4f2ea] rounded-3xl p-6 md:p-8">
                      <p className="text-[13px] font-bold uppercase tracking-widest text-[#8a8a8a] mb-2">Đổ đầy bình</p>
                      <p className="text-[42px] md:text-[56px] leading-[1.1] font-bold tracking-tight tabular-nums text-[#1a1a1a]">
                        {formatVND(fullTankCost).replace(" ₫", " đ")}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#f4f2ea] rounded-3xl p-5 md:p-6">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#8a8a8a] mb-2">Chi phí /100km</p>
                        <p className="text-xl md:text-[26px] font-bold tabular-nums text-[#1a1a1a]">{formatVND(costPer100km).replace(" ₫", " đ")}</p>
                      </div>
                      <div className="bg-[#f4f2ea] rounded-3xl p-5 md:p-6">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#8a8a8a] mb-2">Phạm vi 1 bình</p>
                        <p className="text-xl md:text-[26px] font-bold tabular-nums text-[#1a1a1a]">~{formatNumber(Math.round(rangeFullTank))} km</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="custom-amount"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6 absolute top-0 left-0 w-full"
                  >
                    <div className="space-y-4">
                      <p className="text-[13px] font-bold uppercase tracking-widest text-[#8a8a8a]">Số tiền</p>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={moneyInput ? formatNumber(Number(moneyInput)) : ""}
                          onChange={handleMoneyChange}
                          placeholder="0"
                          className="w-full bg-transparent text-[46px] md:text-[64px] leading-none font-bold outline-none border-b-[3px] border-[#1a1a1a] pb-3 text-[#1a1a1a] placeholder:text-[#d4d4d4] transition-colors tabular-nums pr-16"
                        />
                        <span className="absolute right-0 bottom-4 text-[32px] md:text-[40px] font-bold text-[#1a1a1a]">đ</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2.5 pt-3">
                        {presetAmounts.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setMoneyInput(amount.toString())}
                            className="bg-[#f4f2ea] hover:bg-[#e8e6dd] text-[#1a1a1a] font-bold text-[15px] py-3 px-5 rounded-full transition-colors"
                          >
                            {formatNumber(amount)}đ
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#f4f2ea] rounded-3xl p-5 md:p-6">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#8a8a8a] mb-2">Đổ được</p>
                        <p className="text-xl md:text-[26px] font-bold tabular-nums text-[#1a1a1a]">
                          {customLiters > 0 ? `${formatNumber(Number(customLiters.toFixed(2)))} L` : "—"}
                        </p>
                      </div>
                      <div className="bg-[#f4f2ea] rounded-3xl p-5 md:p-6">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#8a8a8a] mb-2">Đi được khoảng</p>
                        <p className="text-xl md:text-[26px] font-bold tabular-nums text-[#1a1a1a]">
                          {customRange > 0 ? `~${formatNumber(Math.round(customRange))} km` : "—"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ======================= TAB: VIRTUAL PUMP (DARK THEME) ======================= */}
        {mainTab === "pump" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1b2230] -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start rounded-b-3xl"
          >
            {/* Left side: Pump Options & Data */}
            <div className="bg-[#1b2230] rounded-2xl flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#3b82f6] text-xl">💧</span>
                <span className="text-white font-bold text-lg">Chọn loại xăng</span>
              </div>
              
              <div className="space-y-2.5">
                {fuelPrices.map((p) => {
                  const isActive = selectedFuel?.name === p.name;
                  return (
                    <button
                      key={p.name}
                      onClick={() => setSelectedFuel(p)}
                      className={`w-full flex justify-between items-center px-5 py-4 rounded-2xl font-bold transition-all ${
                        isActive ? "bg-[#2563eb] text-white shadow-lg shadow-blue-900/40" : "bg-[#222a3a] text-white hover:bg-[#2c364a]"
                      }`}
                    >
                      <span>{p.name.replace("Xăng ", "")}</span>
                      <span className="tabular-nums">{formatVND(p.price).replace(" ₫", "đ")}/L</span>
                    </button>
                  );
                })}
              </div>

              <div className="bg-[#131722] rounded-2xl p-6 mt-2 flex flex-col gap-3 border border-[#2c364a]">
                <div className="flex justify-between items-center">
                  <span className="text-[#9ca3af] text-[15px] font-medium">Xe đang chọn:</span>
                  <span className="text-white font-bold text-lg">{selectedVehicle.name} 🏍️</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#9ca3af] text-[15px] font-medium">Dung tích bình:</span>
                  <span className="text-[#60a5fa] font-bold text-[17px]">{selectedVehicle.tank_capacity.toString().replace(".", ",")} lít</span>
                </div>
                <div className="h-px w-full bg-[#2c364a] my-2" />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[#9ca3af] text-[15px] font-medium">Số lít đã đổ:</span>
                  <span className="font-bold text-3xl text-white tabular-nums tracking-tight">{currentPumpLiters.toFixed(2)} L</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[#9ca3af] text-[15px] font-medium flex items-center gap-1">
                    <span>$</span> Tổng tiền:
                  </span>
                  <span className="font-bold text-[34px] text-[#4ade80] tabular-nums tracking-tight">
                    {formatVND(Math.round(currentPumpMoney)).replace(" ₫", "đ")}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 mt-2">
                <button 
                  onClick={handleStartPump}
                  disabled={isFilling || fillProgress === 100 || (estimateMode === "custom" && customMoneyNum <= 0)}
                  className="flex-1 bg-[#15803d] hover:bg-[#166534] disabled:bg-[#15803d]/50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-[17px] transition-all"
                >
                  Bắt đầu đổ
                </button>
                <button 
                  onClick={() => { setIsFilling(false); setFillProgress(0); }}
                  className="bg-[#374151] hover:bg-[#4b5563] text-white font-bold px-8 py-4 rounded-xl text-[17px] transition-all"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Right side: Pump Animation Viewer */}
            <div className="bg-[#1b2230] h-full flex flex-col pb-4">
              <div className="flex items-center gap-2 mb-8">
                <span className="text-[#60a5fa] text-xl">⛽</span>
                <span className="text-white font-bold text-lg">Trạm xăng</span>
              </div>

              <div className="flex flex-col items-center justify-center flex-1 mt-4">
                <div className="relative w-40 h-72 rounded-[32px] border-[5px] border-[#374151] bg-[#1f2937] overflow-hidden flex items-end shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                  <div className="absolute inset-0 flex items-center justify-center z-20 mix-blend-difference text-white">
                    <span className="font-extrabold text-[42px] tabular-nums drop-shadow-lg tracking-tighter">
                      {Math.round(fillProgress)}%
                    </span>
                  </div>
                  
                  <motion.div
                    className="w-full bg-[#d06b24]"
                    initial={{ height: "0%" }}
                    animate={{ height: `${fillProgress}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                  />
                </div>

                <div className="flex flex-col items-center gap-1 mt-10">
                  <div className="relative h-20 w-40 filter drop-shadow-2xl">
                    <Image 
                      src={selectedVehicle.image || "/placeholder.svg"} 
                      alt="Vehicle" 
                      fill 
                      className="object-contain" 
                      unoptimized 
                    />
                  </div>
                  <div className="text-center mt-2">
                    <p className="font-extrabold text-[22px] text-white">{selectedVehicle.name}</p>
                    <p className="text-[#9ca3af] font-medium text-sm mt-0.5">Xe {selectedVehicle.type === "motorbike" ? "máy" : "ô tô"}</p>
                  </div>
                  <AnimatePresence>
                    {fillProgress === 100 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[#4ade80] mt-3 font-bold text-[17px] flex items-center gap-2"
                      >
                        <span className="bg-[#4ade80] text-[#1b2230] rounded-sm w-5 h-5 flex items-center justify-center text-xs">✓</span>
                        Đổ đầy rồi!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
