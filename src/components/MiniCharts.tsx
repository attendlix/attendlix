import React from "react";

export function SparklineGreenWave({ className = "w-24 h-9" }: { className?: string }) {
  return (
    <svg className={`${className} overflow-visible`} viewBox="0 0 100 36" fill="none">
      <defs>
        <linearGradient id="greenWaveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M0 28 C20 28, 25 14, 45 18 C65 22, 75 6, 100 4 L100 36 L0 36 Z"
        fill="url(#greenWaveGrad)"
      />
      <path
        d="M0 28 C20 28, 25 14, 45 18 C65 22, 75 6, 100 4"
        stroke="#10B981"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="4" r="3" fill="#10B981" />
    </svg>
  );
}

export function SparklineBluePulse({ className = "w-24 h-9" }: { className?: string }) {
  return (
    <svg className={`${className} overflow-visible`} viewBox="0 0 100 36" fill="none">
      <defs>
        <linearGradient id="bluePulseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M0 26 C15 26, 25 26, 35 24 C45 22, 50 10, 60 20 C70 30, 80 8, 90 22 C95 24, 98 25, 100 25 L100 36 L0 36 Z"
        fill="url(#bluePulseGrad)"
      />
      <path
        d="M0 26 C15 26, 25 26, 35 24 C45 22, 50 10, 60 20 C70 30, 80 8, 90 22 C95 24, 98 25, 100 25"
        stroke="#3B82F6"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="25" r="3" fill="#3B82F6" />
    </svg>
  );
}

export function MiniBarChart({ className = "w-20 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 36" fill="none">
      <rect x="5" y="22" width="6" height="14" rx="3" fill="#94A3B8" opacity="0.6" />
      <rect x="20" y="14" width="6" height="22" rx="3" fill="#0D9488" opacity="0.8" />
      <rect x="35" y="6" width="6" height="30" rx="3" fill="#0F766E" />
      <rect x="50" y="18" width="6" height="18" rx="3" fill="#14B8A6" opacity="0.7" />
      <rect x="65" y="10" width="6" height="26" rx="3" fill="#0D9488" opacity="0.9" />
    </svg>
  );
}

export function SparklineAmberWave({ className = "w-24 h-9" }: { className?: string }) {
  return (
    <svg className={`${className} overflow-visible`} viewBox="0 0 100 36" fill="none">
      <defs>
        <linearGradient id="amberWaveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M0 25 C25 25, 35 12, 55 18 C75 24, 85 8, 100 6 L100 36 L0 36 Z"
        fill="url(#amberWaveGrad)"
      />
      <path
        d="M0 25 C25 25, 35 12, 55 18 C75 24, 85 8, 100 6"
        stroke="#F59E0B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="6" r="3" fill="#F59E0B" />
    </svg>
  );
}
