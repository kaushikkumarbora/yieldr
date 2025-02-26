import { BondCalculator } from '@/components/bond-calculator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-blue-50 to-gray-50 dark:from-gray-900 dark:to-slate-950 transition-colors duration-300">
      <div className="w-full max-w-4xl">
        <BondCalculator />
      </div>
    </main>
  );
}