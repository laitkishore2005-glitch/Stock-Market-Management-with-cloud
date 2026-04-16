import React, { useState, useEffect } from 'react';
import { Stock, OrderSide, OrderType, ProductType, OrderVariety } from '../../types';
import { Info, AlertCircle } from 'lucide-react';
import { db, auth } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface OrderEntryProps {
    stock: Stock;
    onPlaceOrder: (order: any) => void;
    theme: string;
}

const OrderEntry: React.FC<OrderEntryProps> = ({ stock, onPlaceOrder, theme }) => {
    const [side, setSide] = useState<OrderSide>(OrderSide.BUY);
    const [product, setProduct] = useState<ProductType>(ProductType.MIS);
    const [variety, setVariety] = useState<OrderVariety>(OrderVariety.REGULAR);
    const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET);
    
    const [quantity, setQuantity] = useState<number>(1);
    const [price, setPrice] = useState<number>(stock.price);
    const [triggerPrice, setTriggerPrice] = useState<number>(0);
    const [targetPrice, setTargetPrice] = useState<number>(0); // For BO
    const [stopLossPrice, setStopLossPrice] = useState<number>(0); // For BO

    // Trading Limits
    const [maxQuantity, setMaxQuantity] = useState<number>(1000);
    const [maxOrderValue, setMaxOrderValue] = useState<number>(1000000);

    // Validation State
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isLight = theme === 'light';
    const bgMain = isLight ? 'bg-white' : `bg-${theme}-900`;
    const bgInput = isLight ? 'bg-slate-50' : `bg-${theme}-950`;
    const borderCol = isLight ? 'border-slate-200' : `border-${theme}-800`;
    const borderInput = isLight ? 'border-slate-300' : `border-${theme}-700`;
    const textMain = isLight ? 'text-slate-900' : 'text-white';
    const textMuted = isLight ? 'text-slate-500' : `text-${theme}-500`;
    const textLabel = isLight ? 'text-slate-500' : `text-${theme}-500`;
    const activeTabText = isLight ? 'text-slate-500' : `text-${theme}-400`;
    const activeTabHover = isLight ? 'hover:bg-slate-100 hover:text-slate-900' : `hover:text-white hover:bg-${theme}-700`;
    const errorText = isLight ? 'text-red-600' : 'text-red-400';
    const errorBorder = 'border-red-500';

    // Fetch Trading Limits
    useEffect(() => {
        const fetchLimits = async () => {
            // If not authenticated (e.g., demo bypass), skip fetch and use defaults
            if (!auth.currentUser) return;

            try {
                const docRef = doc(db, 'settings', 'trading_limits');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.maxQuantity) setMaxQuantity(data.maxQuantity);
                    if (data.maxOrderValue) setMaxOrderValue(data.maxOrderValue);
                }
            } catch (error) {
                console.error("Failed to fetch trading limits", error);
            }
        };
        fetchLimits();
    }, []);

    // Reset/Sync prices when stock changes
    useEffect(() => {
        if (orderType === OrderType.MARKET) {
            setPrice(stock.price);
        }
        // Set reasonable defaults for BO/CO
        if (stock.price > 0) {
            setTargetPrice(parseFloat((stock.price * 1.02).toFixed(2)));
            setStopLossPrice(parseFloat((stock.price * 0.98).toFixed(2)));
            setTriggerPrice(parseFloat((stock.price * 0.99).toFixed(2)));
        }
    }, [stock.symbol, stock.price, orderType]);

    // Handle variety changes
    useEffect(() => {
        if (variety === OrderVariety.BO || variety === OrderVariety.CO) {
            setProduct(ProductType.MIS); // BO/CO are usually Intraday
        }
    }, [variety]);

    // Validation Logic
    useEffect(() => {
        const newErrors: Record<string, string> = {};

        // Quantity Validation
        if (!quantity || quantity <= 0) {
            newErrors.quantity = 'Qty > 0';
        } else if (!Number.isInteger(quantity)) {
            newErrors.quantity = 'Must be integer';
        } else if (quantity > maxQuantity) {
            newErrors.quantity = `Max Qty: ${maxQuantity}`;
        }

        // Price Validation (Limit & SL)
        if ((orderType === OrderType.LIMIT || orderType === OrderType.SL) && (!price || price <= 0)) {
            newErrors.price = 'Price > 0';
        }

        // Order Value Validation
        const execPrice = (orderType === OrderType.MARKET || orderType === OrderType.SL_M) ? stock.price : price;
        if (quantity > 0 && execPrice > 0) {
            const orderValue = quantity * execPrice;
            if (orderValue > maxOrderValue) {
                newErrors.quantity = `Max Value: ₹${maxOrderValue.toLocaleString()}`;
            }
        }

        // Trigger Price Validation
        if (orderType === OrderType.SL || orderType === OrderType.SL_M || variety === OrderVariety.CO) {
            if (!triggerPrice || triggerPrice <= 0) {
                newErrors.triggerPrice = 'Trigger > 0';
            }
            
            // Logical validation for SL (Buy: Trigger < Price, Sell: Trigger > Price)
            if (orderType === OrderType.SL && price > 0 && triggerPrice > 0) {
                if (side === OrderSide.BUY && triggerPrice >= price) {
                    newErrors.triggerPrice = 'Trig must be < Price';
                } else if (side === OrderSide.SELL && triggerPrice <= price) {
                    newErrors.triggerPrice = 'Trig must be > Price';
                }
            }
        }

        // Bracket Order Validation
        if (variety === OrderVariety.BO) {
             if (!targetPrice || targetPrice <= 0) newErrors.targetPrice = 'Required';
             if (!stopLossPrice || stopLossPrice <= 0) newErrors.stopLossPrice = 'Required';
        }

        setErrors(newErrors);
    }, [quantity, price, triggerPrice, targetPrice, stopLossPrice, orderType, variety, side, maxQuantity, maxOrderValue, stock.price]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (Object.keys(errors).length > 0) return;

        onPlaceOrder({
            side,
            product,
            variety,
            type: orderType,
            quantity,
            // For Market and SL-M (Stop Loss Market), execution is at market price, so we send 0 or stock price for simulation
            price: (orderType === OrderType.MARKET || orderType === OrderType.SL_M) ? 0 : price,
            triggerPrice: (orderType === OrderType.SL || orderType === OrderType.SL_M || variety === OrderVariety.CO) ? triggerPrice : undefined,
            targetPrice: variety === OrderVariety.BO ? targetPrice : undefined,
            stopLossPrice: variety === OrderVariety.BO ? stopLossPrice : undefined
        });
    };

    // Margin Calculation Logic
    const calculateMargin = () => {
        let leverage = 1;
        if (product === ProductType.MIS) leverage = 5;
        if (variety === OrderVariety.CO) leverage = 10; // Higher leverage for CO
        if (variety === OrderVariety.BO) leverage = 10; // Higher leverage for BO
        
        let execPrice = price;
        if (orderType === OrderType.MARKET) {
            execPrice = stock.price;
        } else if (orderType === OrderType.SL_M) {
            // For SL-M, we use trigger price as estimation, or stock price if not set
            execPrice = triggerPrice > 0 ? triggerPrice : stock.price;
        }
        
        return (execPrice * quantity) / leverage;
    };

    const marginRequired = calculateMargin();
    const availableMargin = 150000; // Mocked
    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div className={`${bgMain} border ${borderCol} rounded-lg flex flex-col h-full overflow-hidden`}>
            {/* Header / Tabs */}
            <div className={`flex ${isLight ? 'bg-slate-100' : `bg-${theme}-800`}`}>
                <button
                    onClick={() => setSide(OrderSide.BUY)}
                    className={`flex-1 py-3 text-sm font-bold transition-all ${
                        side === OrderSide.BUY 
                        ? 'bg-blue-600 text-white' 
                        : `${activeTabText} ${activeTabHover}`
                    }`}
                >
                    BUY
                </button>
                <button
                    onClick={() => setSide(OrderSide.SELL)}
                    className={`flex-1 py-3 text-sm font-bold transition-all ${
                        side === OrderSide.SELL 
                        ? 'bg-red-600 text-white' 
                        : `${activeTabText} ${activeTabHover}`
                    }`}
                >
                    SELL
                </button>
            </div>

            <div className="p-4 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                
                {/* Product & Variety Selectors */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label className={`text-[10px] ${textLabel} font-bold uppercase mb-1 block`}>Product</label>
                        <div className={`flex ${bgInput} rounded p-1 border ${borderInput}`}>
                            <button 
                                onClick={() => setProduct(ProductType.MIS)}
                                className={`flex-1 text-xs py-1 rounded transition-colors ${product === ProductType.MIS ? `${isLight ? 'bg-white shadow-sm' : `bg-${theme}-700`} ${textMain}` : `${textMuted}`}`}
                            >
                                Intraday
                            </button>
                            <button 
                                onClick={() => setProduct(ProductType.CNC)}
                                disabled={variety !== OrderVariety.REGULAR}
                                className={`flex-1 text-xs py-1 rounded transition-colors ${product === ProductType.CNC ? `${isLight ? 'bg-white shadow-sm' : `bg-${theme}-700`} ${textMain}` : `${textMuted}`} ${variety !== OrderVariety.REGULAR ? 'opacity-50' : ''}`}
                            >
                                Longterm
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className={`text-[10px] ${textLabel} font-bold uppercase mb-1 block`}>Variety</label>
                        <select 
                            value={variety}
                            onChange={(e) => setVariety(e.target.value as OrderVariety)}
                            className={`w-full ${bgInput} border ${borderInput} rounded py-1.5 px-2 text-xs ${textMain} focus:outline-none focus:border-blue-500`}
                        >
                            <option value={OrderVariety.REGULAR}>Regular</option>
                            <option value={OrderVariety.BO}>Bracket (BO)</option>
                            <option value={OrderVariety.CO}>Cover (CO)</option>
                            <option value={OrderVariety.AMO}>AMO</option>
                        </select>
                    </div>
                </div>

                {/* Order Type Selector */}
                <div className="mb-4">
                     <label className={`text-[10px] ${textLabel} font-bold uppercase mb-1 block`}>Order Type</label>
                     <div className="flex gap-2">
                        {[OrderType.MARKET, OrderType.LIMIT, OrderType.SL, OrderType.SL_M].map(t => (
                            <button
                                key={t}
                                onClick={() => setOrderType(t)}
                                className={`flex-1 py-1.5 text-[10px] font-bold border rounded transition-colors ${
                                    orderType === t 
                                    ? 'border-blue-500 text-blue-500 bg-blue-500/10' 
                                    : `${borderInput} ${textMuted} hover:border-blue-400`
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                     </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Qty & Price Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={`text-[10px] ${textLabel} font-bold uppercase mb-1 block flex justify-between`}>
                                Qty
                                {errors.quantity && <span className={`${errorText} text-[9px]`}>{errors.quantity}</span>}
                            </label>
                            <input 
                                type="number" 
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value === '' ? 0 : parseInt(e.target.value))}
                                className={`w-full ${bgInput} border ${errors.quantity ? errorBorder : borderInput} rounded p-2 ${textMain} text-right font-mono text-sm focus:outline-none focus:border-blue-500`}
                            />
                        </div>
                        <div>
                            <label className={`text-[10px] ${textLabel} font-bold uppercase mb-1 block flex justify-between`}>
                                Price
                                {errors.price && <span className={`${errorText} text-[9px]`}>{errors.price}</span>}
                            </label>
                            <input 
                                type="number" 
                                step="0.05"
                                disabled={orderType === OrderType.MARKET || orderType === OrderType.SL_M}
                                value={orderType === OrderType.MARKET || orderType === OrderType.SL_M ? 0 : price}
                                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                className={`w-full ${bgInput} border ${errors.price ? errorBorder : borderInput} rounded p-2 ${textMain} text-right font-mono text-sm focus:outline-none focus:border-blue-500 ${
                                    orderType === OrderType.MARKET || orderType === OrderType.SL_M ? 'opacity-30 cursor-not-allowed' : ''
                                }`}
                            />
                        </div>
                    </div>

                    {/* Trigger Price (SL/SL-M/CO) */}
                    {(orderType === OrderType.SL || orderType === OrderType.SL_M || variety === OrderVariety.CO) && (
                        <div>
                            <label className={`text-[10px] ${textLabel} font-bold uppercase mb-1 block flex justify-between`}>
                                <span>
                                    {orderType === OrderType.SL_M ? 'Trigger Price (MKT)' : 'Trigger Price'}
                                    {variety === OrderVariety.CO && <span className="text-blue-500 text-[9px] lowercase ml-1">SL trigger</span>}
                                </span>
                                {errors.triggerPrice && <span className={`${errorText} text-[9px]`}>{errors.triggerPrice}</span>}
                            </label>
                            <input 
                                type="number" 
                                step="0.05"
                                value={triggerPrice}
                                onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || 0)}
                                className={`w-full ${bgInput} border ${errors.triggerPrice ? errorBorder : borderInput} rounded p-2 ${textMain} text-right font-mono text-sm focus:outline-none focus:border-blue-500 border-l-4 border-l-yellow-500`}
                            />
                        </div>
                    )}

                    {/* Bracket Order Fields */}
                    {variety === OrderVariety.BO && (
                        <div className={`grid grid-cols-2 gap-3 p-3 ${bgInput} rounded border ${borderCol}`}>
                             <div>
                                <label className="text-[10px] text-green-500 font-bold uppercase mb-1 block flex justify-between">
                                    Target
                                    {errors.targetPrice && <span className={`${errorText} text-[9px]`}>!</span>}
                                </label>
                                <input 
                                    type="number" 
                                    step="0.05"
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                                    className={`w-full ${isLight ? 'bg-white' : `bg-${theme}-900`} border ${errors.targetPrice ? errorBorder : borderInput} rounded p-1.5 ${textMain} text-right font-mono text-xs focus:border-green-500 focus:outline-none`}
                                />
                                <div className="text-[9px] text-right text-green-500 mt-1">
                                    +{(targetPrice - (orderType === OrderType.MARKET ? stock.price : price)).toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-red-500 font-bold uppercase mb-1 block flex justify-between">
                                    Stop Loss
                                    {errors.stopLossPrice && <span className={`${errorText} text-[9px]`}>!</span>}
                                </label>
                                <input 
                                    type="number" 
                                    step="0.05"
                                    value={stopLossPrice}
                                    onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
                                    className={`w-full ${isLight ? 'bg-white' : `bg-${theme}-900`} border ${errors.stopLossPrice ? errorBorder : borderInput} rounded p-1.5 ${textMain} text-right font-mono text-xs focus:border-red-500 focus:outline-none`}
                                />
                                <div className="text-[9px] text-right text-red-500 mt-1">
                                    {(stopLossPrice - (orderType === OrderType.MARKET ? stock.price : price)).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Margin Info */}
                    <div className={`${isLight ? 'bg-slate-100' : `bg-${theme}-800/50`} rounded p-3 space-y-2`}>
                        <div className="flex justify-between items-center">
                            <span className={`text-xs ${textLabel}`}>Required Margin</span>
                            <span className={`text-sm font-mono font-bold ${marginRequired > availableMargin ? 'text-red-500' : textMain}`}>
                                ₹{marginRequired.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={`text-xs ${textLabel}`}>Available</span>
                            <span className={`text-xs font-mono ${textMuted}`}>₹{availableMargin.toLocaleString('en-IN')}</span>
                        </div>
                        {marginRequired > availableMargin && (
                             <div className="flex items-center gap-1 text-[10px] text-red-500">
                                <AlertCircle size={10} /> Insufficient funds
                             </div>
                        )}
                    </div>
                </form>
            </div>

            {/* Submit Button */}
            <div className={`p-4 ${bgMain} border-t ${borderCol}`}>
                <button 
                    onClick={handleSubmit}
                    disabled={hasErrors}
                    className={`w-full py-3.5 rounded-lg font-bold text-white transition-all transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
                        hasErrors
                        ? 'bg-slate-500 cursor-not-allowed opacity-50'
                        : side === OrderSide.BUY 
                            ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' 
                            : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                    }`}
                >
                    {side} {stock.symbol}
                </button>
            </div>
        </div>
    );
};

export default OrderEntry;
