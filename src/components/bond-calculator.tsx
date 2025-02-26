"use client"

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Label 
} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Button 
} from '@/components/ui/button';
import {
  Slider
} from '@/components/ui/slider';
import {
  Alert,
  AlertDescription
} from '@/components/ui/alert';
import {
  Switch
} from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  InfoIcon,
  AlertCircle,
  Calculator,
  BarChart,
  ChevronDown,
  ChevronUp,
  Percent,
  DollarSign,
  TrendingUp,
  Sun,
  Moon,
  HelpCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from 'next-themes';
import { ThemeToggle } from './theme-toggle';

type PaymentFrequency = 'annual' | 'semi-annual' | 'quarterly' | 'monthly';

type CouponCalculation = {
  period: number;
  payment: string;
  pv: string;
};

type Calculations = {
  couponPV: string;
  facePV: string;
  coupons: CouponCalculation[];
  periods: number;
  couponPerPeriod: string;
};

type ChartDataPoint = {
  rate: string;
  price: string;
};

// Newton-Raphson method for calculating YTM
const calculateYTM = (
  price: number, 
  faceValue: number, 
  couponRate: number, 
  years: number, 
  frequency: number
): number => {
  // Initial guess - current yield as starting point
  let guess = (couponRate / 100) / (price / faceValue);
  
  // Convert annual rates to per-period rates
  const periodicCouponRate = (couponRate / 100) / frequency;
  const couponPayment = faceValue * periodicCouponRate;
  const totalPeriods = years * frequency;
  
  const EPSILON = 0.0000001; // Convergence threshold
  const MAX_ITERATIONS = 100;
  
  let previousGuess = 0;
  let iteration = 0;
  
  while (Math.abs(guess - previousGuess) > EPSILON && iteration < MAX_ITERATIONS) {
    previousGuess = guess;
    
    // Calculate price with current guess
    let calculatedPrice = 0;
    let derivative = 0;
    
    for (let i = 1; i <= totalPeriods; i++) {
      calculatedPrice += couponPayment / Math.pow(1 + guess, i);
      derivative -= i * couponPayment / Math.pow(1 + guess, i + 1);
    }
    
    calculatedPrice += faceValue / Math.pow(1 + guess, totalPeriods);
    derivative -= totalPeriods * faceValue / Math.pow(1 + guess, totalPeriods + 1);
    
    // Newton-Raphson iteration: x_n+1 = x_n - f(x_n) / f'(x_n)
    guess = guess - (calculatedPrice - price) / derivative;
    
    iteration++;
  }
  
  // Convert back to annual rate
  return guess * frequency * 100;
};

export function BondCalculator() {
  const { theme, setTheme } = useTheme();
  
  // Bond Price Calculator States
  const [faceValue, setFaceValue] = useState<number>(1000);
  const [couponRate, setCouponRate] = useState<number>(5);
  const [marketRate, setMarketRate] = useState<number>(4);
  const [years, setYears] = useState<number>(5);
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('semi-annual');
  const [bondPrice, setBondPrice] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [calculations, setCalculations] = useState<Calculations | null>(null);
  
  // Yield Calculator States
  const [yieldFaceValue, setYieldFaceValue] = useState<number>(1000);
  const [yieldCouponRate, setYieldCouponRate] = useState<number>(5);
  const [yieldPrice, setYieldPrice] = useState<number>(950);
  const [yieldYears, setYieldYears] = useState<number>(5);
  const [yieldPaymentFrequency, setYieldPaymentFrequency] = useState<PaymentFrequency>('semi-annual');
  const [yieldResults, setYieldResults] = useState<{
    currentYield: number;
    ytm: number;
    yieldToWorstCall?: number;
  } | null>(null);
  
  // Chart data states
  const [couponChartData, setCouponChartData] = useState<ChartDataPoint[]>([]);
  const [marketChartData, setMarketChartData] = useState<ChartDataPoint[]>([]);

  // Formula display state
  const [formula, setFormula] = useState<string>('');

  // Get frequency multiplier
  const getFrequencyMultiplier = (frequency: PaymentFrequency): number => {
    switch (frequency) {
      case 'annual': return 1;
      case 'semi-annual': return 2;
      case 'quarterly': return 4;
      case 'monthly': return 12;
      default: return 2;
    }
  };

  // Calculate bond price
  const calculateBondPrice = (
    faceVal: number = faceValue, 
    couponRt: number = couponRate, 
    marketRt: number = marketRate, 
    term: number = years, 
    frequency: PaymentFrequency = paymentFrequency
  ): number => {
    const periodsPerYear = getFrequencyMultiplier(frequency);

    const numberOfPeriods = term * periodsPerYear;
    const couponPerPeriod = (couponRt / 100) / periodsPerYear;
    const marketRatePerPeriod = (marketRt / 100) / periodsPerYear;
    const couponPaymentPerPeriod = faceVal * couponPerPeriod;

    // Calculate PV of all coupon payments
    let presentValueOfCoupons = 0;
    const couponCalculations: CouponCalculation[] = [];
    
    for (let i = 1; i <= numberOfPeriods; i++) {
      const presentValue = couponPaymentPerPeriod / Math.pow(1 + marketRatePerPeriod, i);
      presentValueOfCoupons += presentValue;
      
      couponCalculations.push({
        period: i,
        payment: couponPaymentPerPeriod.toFixed(2),
        pv: presentValue.toFixed(2)
      });
    }

    // Calculate PV of face value
    const presentValueOfFaceValue = faceVal / Math.pow(1 + marketRatePerPeriod, numberOfPeriods);

    // Total bond price
    const price = presentValueOfCoupons + presentValueOfFaceValue;
    
    // Generate formula display with actual values
    const formulaText = `
      P = ∑[C / (1 + r)^t] + [F / (1 + r)^n]
      
      Where:
      P = Bond price
      C = ${formatCurrency(couponPaymentPerPeriod)} (periodic coupon payment)
      r = ${(marketRatePerPeriod * 100).toFixed(2)}% (periodic market rate)
      F = ${formatCurrency(faceVal)} (face value)
      n = ${numberOfPeriods} (total number of periods)
      t = period number (1 to ${numberOfPeriods})
    `;
    
    if (faceVal === faceValue && couponRt === couponRate && marketRt === marketRate && 
        term === years && frequency === paymentFrequency) {
      setBondPrice(price);
      setCalculations({
        couponPV: presentValueOfCoupons.toFixed(2),
        facePV: presentValueOfFaceValue.toFixed(2),
        coupons: couponCalculations,
        periods: numberOfPeriods,
        couponPerPeriod: couponPaymentPerPeriod.toFixed(2)
      });
      setFormula(formulaText);
    }
    
    return price;
  };

  // Calculate yields
  const calculateYields = (): void => {
    // Frequency multiplier
    const frequency = getFrequencyMultiplier(yieldPaymentFrequency);
    
    // Calculate current yield
    const annualCouponPayment = yieldFaceValue * (yieldCouponRate / 100);
    const currentYield = (annualCouponPayment / yieldPrice) * 100;
    
    // Calculate yield to maturity (YTM)
    const ytm = calculateYTM(
      yieldPrice,
      yieldFaceValue,
      yieldCouponRate,
      yieldYears,
      frequency
    );
    
    setYieldResults({
      currentYield,
      ytm
    });
  };

  // Generate chart data on parameter change
  useEffect(() => {
    if (bondPrice !== null) {
      // Generate coupon rate sensitivity data
      const couponData: ChartDataPoint[] = [];
      for (let i = Math.max(0.5, couponRate - 3); i <= couponRate + 3; i += 0.5) {
        const price = calculateBondPrice(faceValue, i, marketRate, years, paymentFrequency);
        couponData.push({
          rate: i.toFixed(1),
          price: price.toFixed(2)
        });
      }
      setCouponChartData(couponData);
      
      // Generate market rate sensitivity data
      const marketData: ChartDataPoint[] = [];
      for (let i = Math.max(0.5, marketRate - 3); i <= marketRate + 3; i += 0.5) {
        const price = calculateBondPrice(faceValue, couponRate, i, years, paymentFrequency);
        marketData.push({
          rate: i.toFixed(1),
          price: price.toFixed(2)
        });
      }
      setMarketChartData(marketData);
    }
  }, [bondPrice, faceValue, couponRate, marketRate, years, paymentFrequency]);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  // Reset price calculator
  const resetPriceCalculator = (): void => {
    setFaceValue(1000);
    setCouponRate(5);
    setMarketRate(4);
    setYears(5);
    setPaymentFrequency('semi-annual');
    setBondPrice(null);
    setShowDetails(false);
    setCalculations(null);
    setCouponChartData([]);
    setMarketChartData([]);
  };

  // Reset yield calculator
  const resetYieldCalculator = (): void => {
    setYieldFaceValue(1000);
    setYieldCouponRate(5);
    setYieldPrice(950);
    setYieldYears(5);
    setYieldPaymentFrequency('semi-annual');
    setYieldResults(null);
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center justify-between gap-2 my-6">
        <div className="flex items-center">
          <TrendingUp size={32} className="text-blue-500 dark:text-blue-400" />
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500">Yieldr</h1>
        </div>
        <ThemeToggle />
      </div>
      
      <Tabs defaultValue="bond-calculator" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="bond-calculator" className="flex items-center gap-2">
            <Calculator size={16} />
            Price Calculator
          </TabsTrigger>
          <TabsTrigger value="yield-calculator" className="flex items-center gap-2">
            <Percent size={16} />
            Yield Calculator
          </TabsTrigger>
          <TabsTrigger value="future-tools" className="flex items-center gap-2" disabled>
            <BarChart size={16} />
            More Tools (Soon)
          </TabsTrigger>
        </TabsList>
        
        {/* Bond Price Calculator */}
        <TabsContent value="bond-calculator">
          <Card className="border-t-4 border-t-blue-500 dark:border-t-blue-400 shadow-lg">
            <CardHeader>
              <CardTitle>Bond Price Calculator</CardTitle>
              <CardDescription>
                Calculate the price of a bond based on its face value, coupon rate, market interest rate, and term.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="face-value" className="flex items-center gap-1 mb-1">
                    <DollarSign size={16} /> Face Value
                  </Label>
                  <Input
                    id="face-value"
                    type="number"
                    value={faceValue}
                    onChange={(e) => setFaceValue(parseFloat(e.target.value || "0"))}
                    min="1"
                    className="mb-4"
                  />
                
                  <Label htmlFor="coupon-rate" className="flex items-center gap-1 mb-1">
                    <Percent size={16} /> Coupon Rate: {couponRate}%
                  </Label>
                  <div className="mb-4 pl-1 pr-1">
                    <Slider
                      id="coupon-rate"
                      value={[couponRate]}
                      onValueChange={(value) => setCouponRate(value[0])}
                      min={0}
                      max={15}
                      step={0.1}
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0%</span>
                      <span>5%</span>
                      <span>10%</span>
                      <span>15%</span>
                    </div>
                  </div>
                
                  <Label htmlFor="market-rate" className="flex items-center gap-1 mb-1">
                    <Percent size={16} /> Market Interest Rate: {marketRate}%
                  </Label>
                  <div className="mb-4 pl-1 pr-1">
                    <Slider
                      id="market-rate"
                      value={[marketRate]}
                      onValueChange={(value) => setMarketRate(value[0])}
                      min={0}
                      max={15}
                      step={0.1}
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0%</span>
                      <span>5%</span>
                      <span>10%</span>
                      <span>15%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="years" className="mb-1">Term (Years)</Label>
                  <Input
                    id="years"
                    type="number"
                    value={years}
                    onChange={(e) => setYears(parseInt(e.target.value || "1"))}
                    min="1"
                    className="mb-4"
                  />
                
                  <Label htmlFor="payment-frequency" className="mb-1">Payment Frequency</Label>
                  <Select
                    value={paymentFrequency}
                    onValueChange={(value) => setPaymentFrequency(value as PaymentFrequency)}
                  >
                    <SelectTrigger className="mb-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-center gap-4 mt-4">
                <Button onClick={() => calculateBondPrice()} className="w-32 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">Calculate</Button>
                <Button onClick={resetPriceCalculator} variant="outline" className="w-32">Reset</Button>
              </div>
              
              {bondPrice !== null && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Bond Price</h3>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(bondPrice)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ({(bondPrice / faceValue * 100).toFixed(2)}% of par value)
                    </p>
                  </div>
                </div>
              )}
              
              {bondPrice !== null && (
                <div className="mt-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-1 w-full justify-between"
                  >
                    <span>Show Calculation Details</span>
                    {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                  
                  {showDetails && calculations && (
                    <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded border">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Bond Pricing Formula</h4>
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-geist-mono text-sm whitespace-pre">
                            {formula}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Summary</h4>
                            <p><span className="font-medium">Periods:</span> {calculations.periods}</p>
                            <p><span className="font-medium">Coupon per period:</span> {formatCurrency(parseFloat(calculations.couponPerPeriod))}</p>
                            <p><span className="font-medium">Present value of coupons:</span> {formatCurrency(parseFloat(calculations.couponPV))}</p>
                            <p><span className="font-medium">Present value of face value:</span> {formatCurrency(parseFloat(calculations.facePV))}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Market Conditions</h4>
                            {marketRate < couponRate ? (
                              <Alert className="bg-blue-50 dark:bg-blue-950 mb-2">
                                <AlertCircle size={16} className="text-blue-500 dark:text-blue-400" />
                                <AlertDescription>
                                  Bond is trading at a premium because the coupon rate ({couponRate}%) is higher than the market rate ({marketRate}%).
                                </AlertDescription>
                              </Alert>
                            ) : marketRate > couponRate ? (
                              <Alert className="bg-amber-50 dark:bg-amber-950 mb-2">
                                <AlertCircle size={16} className="text-amber-500 dark:text-amber-400" />
                                <AlertDescription>
                                  Bond is trading at a discount because the coupon rate ({couponRate}%) is lower than the market rate ({marketRate}%).
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <Alert className="bg-green-50 dark:bg-green-950 mb-2">
                                <AlertCircle size={16} className="text-green-500 dark:text-green-400" />
                                <AlertDescription>
                                  Bond is trading at par because the coupon rate ({couponRate}%) equals the market rate ({marketRate}%).
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                        
                        {couponChartData.length > 0 && marketChartData.length > 0 && (
                          <div className="grid grid-cols-1 gap-4 mt-4">
                            <h4 className="font-semibold">Price Sensitivity Analysis</h4>
                            
                            <div>
                              <h5 className="text-sm font-medium mb-2">Price vs Coupon Rate</h5>
                              <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={couponChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                                  <XAxis 
                                    dataKey="rate" 
                                    label={{ value: 'Coupon Rate (%)', position: 'insideBottom', offset: -5 }}
                                    stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                                  />
                                  <YAxis 
                                    label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} 
                                    domain={['dataMin - 50', 'dataMax + 50']}
                                    stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                                  />
                                  <RechartsTooltip 
                                    formatter={(value: any) => ['$' + value, 'Price']} 
                                    labelFormatter={(label: any) => 'Coupon Rate: ' + label + '%'} 
                                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
                                  />
                                  <Line type="monotone" dataKey="price" stroke="#3b82f6" activeDot={{ r: 8 }} strokeWidth={2} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium mb-2">Price vs Market Rate</h5>
                              <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={marketChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                                  <XAxis 
                                    dataKey="rate" 
                                    label={{ value: 'Market Rate (%)', position: 'insideBottom', offset: -5 }}
                                    stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} 
                                  />
                                  <YAxis 
                                    label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} 
                                    domain={['dataMin - 50', 'dataMax + 50']}
                                    stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} 
                                  />
                                  <RechartsTooltip 
                                    formatter={(value: any) => ['$' + value, 'Price']} 
                                    labelFormatter={(label: any) => 'Market Rate: ' + label + '%'} 
                                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
                                  />
                                  <Line type="monotone" dataKey="price" stroke="#8b5cf6" activeDot={{ r: 8 }} strokeWidth={2} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                This calculator uses the standard bond pricing formula to determine the present value of all future cash flows.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Yield Calculator */}
        <TabsContent value="yield-calculator">
          <Card className="border-t-4 border-t-purple-500 dark:border-t-purple-400 shadow-lg">
            <CardHeader>
              <CardTitle>Yield Calculator</CardTitle>
              <CardDescription>
                Calculate current yield and yield-to-maturity (YTM) for a bond with known price.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yield-face-value" className="flex items-center gap-1 mb-1">
                    <DollarSign size={16} /> Face Value
                  </Label>
                  <Input
                    id="yield-face-value"
                    type="number"
                    value={yieldFaceValue}
                    onChange={(e) => setYieldFaceValue(parseFloat(e.target.value || "0"))}
                    min="1"
                    className="mb-4"
                  />
                
                  <Label htmlFor="yield-coupon-rate" className="flex items-center gap-1 mb-1">
                    <Percent size={16} /> Coupon Rate: {yieldCouponRate}%
                  </Label>
                  <div className="mb-4 pl-1 pr-1">
                    <Slider
                      id="yield-coupon-rate"
                      value={[yieldCouponRate]}
                      onValueChange={(value) => setYieldCouponRate(value[0])}
                      min={0}
                      max={15}
                      step={0.1}
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0%</span>
                      <span>5%</span>
                      <span>10%</span>
                      <span>15%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="yield-price" className="flex items-center gap-1 mb-1">
                    <DollarSign size={16} /> Bond Price
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle size={14} className="text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">The current market price of the bond.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="yield-price"
                    type="number"
                    value={yieldPrice}
                    onChange={(e) => setYieldPrice(parseFloat(e.target.value || "0"))}
                    min="1"
                    className="mb-4"
                  />
                  
                  <Label htmlFor="yield-years" className="mb-1">Term to Maturity (Years)</Label>
                  <Input
                    id="yield-years"
                    type="number"
                    value={yieldYears}
                    onChange={(e) => setYieldYears(parseInt(e.target.value || "1"))}
                    min="1"
                    className="mb-4"
                  />
                  
                  <Label htmlFor="yield-payment-frequency" className="mb-1">Payment Frequency</Label>
                  <Select
                    value={yieldPaymentFrequency}
                    onValueChange={(value) => setYieldPaymentFrequency(value as PaymentFrequency)}
                  >
                    <SelectTrigger className="mb-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-center gap-4 mt-4">
                <Button onClick={calculateYields} className="w-32 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">Calculate</Button>
                <Button onClick={resetYieldCalculator} variant="outline" className="w-32">Reset</Button>
              </div>
              
              {yieldResults && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-lg border border-purple-100 dark:border-purple-900 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">
                        Current Yield
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoIcon size={14} className="ml-1 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Current Yield = Annual Coupon Payment / Current Bond Price</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </h3>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatPercent(yieldResults.currentYield)}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">
                        Yield to Maturity (YTM)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoIcon size={14} className="ml-1 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">The internal rate of return if the bond is held until maturity.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </h3>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatPercent(yieldResults.ytm)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Additional yield information */}
                  <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-900">
                    <h4 className="font-medium mb-2">Bond Status:</h4>
                    {yieldPrice < yieldFaceValue ? (
                      <Alert className="bg-green-50 dark:bg-green-950 mb-2">
                        <AlertCircle size={16} className="text-green-500 dark:text-green-400" />
                        <AlertDescription>
                          Bond is trading at a discount ({(yieldPrice / yieldFaceValue * 100).toFixed(1)}% of par). 
                          YTM ({formatPercent(yieldResults.ytm)}) is higher than the coupon rate ({formatPercent(yieldCouponRate)}).
                        </AlertDescription>
                      </Alert>
                    ) : yieldPrice > yieldFaceValue ? (
                      <Alert className="bg-amber-50 dark:bg-amber-950 mb-2">
                        <AlertCircle size={16} className="text-amber-500 dark:text-amber-400" />
                        <AlertDescription>
                          Bond is trading at a premium ({(yieldPrice / yieldFaceValue * 100).toFixed(1)}% of par). 
                          YTM ({formatPercent(yieldResults.ytm)}) is lower than the coupon rate ({formatPercent(yieldCouponRate)}).
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-blue-50 dark:bg-blue-950 mb-2">
                        <AlertCircle size={16} className="text-blue-500 dark:text-blue-400" />
                        <AlertDescription>
                          Bond is trading at par. YTM ({formatPercent(yieldResults.ytm)}) equals the coupon rate ({formatPercent(yieldCouponRate)}).
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Yield to Maturity (YTM) is calculated using the Newton-Raphson method to solve for the internal rate of return.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="future-tools">
          <Card>
            <CardHeader>
              <CardTitle>More Tools Coming Soon</CardTitle>
              <CardDescription>
                Additional financial calculators will be added in future updates.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
      
      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Created for GitHub Pages hosting. Bond pricing tools for traders and investors.</p>
        <p className="mt-2">&copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}