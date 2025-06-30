import { motion } from 'framer-motion';

interface GuidanceMeterProps {
  label: string;
  score: number | undefined | null;
  icon: React.ReactNode;
  colorClass: string;
}

function GuidanceMeter({ label, score, icon, colorClass }: GuidanceMeterProps) {
  const numericScore = score ?? 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (numericScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-lg h-full">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-white/10"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          {/* Progress circle */}
          <motion.circle
            className={colorClass}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
            transform="rotate(-90 50 50)"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{numericScore}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
    </div>
  );
}

export default GuidanceMeter; 