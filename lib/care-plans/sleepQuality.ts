import type {
  CarePlanLogEvidence,
  SleepQuality,
} from '@/domains/care-plans/types/care-plan-report';

export const SLEEP_QUALITY_VALUES = [
  'very_good',
  'good',
  'poor',
  'very_poor',
] as const satisfies readonly SleepQuality[];

type SleepQualityCopy = {
  /** Short badge label for admin UI. */
  shortLabel: string;
  /** Full EN description from product copy. */
  descriptionEn: string;
  /** Full MY description (available for locale-aware surfaces). */
  descriptionMy: string;
};

/**
 * Admin-owned sleep quality labels. Backend returns the enum only.
 */
export const SLEEP_QUALITY_COPY: Record<SleepQuality, SleepQualityCopy> = {
  very_good: {
    shortLabel: 'Very good',
    descriptionEn:
      'Slept well through the night and woke up feeling refreshed',
    descriptionMy:
      'ကောင်းကောင်းအိပ်ပျော်ခဲ့ပြီး မနက်နိုးလာချိန်မှာ လန်းဆန်းတယ်',
  },
  good: {
    shortLabel: 'Good',
    descriptionEn:
      'Slept fairly well, with only minor sleep problems, and felt mostly rested',
    descriptionMy:
      'အနည်းငယ် အိပ်ရေးပျက်တာရှိပေမယ့် အတော်အသင့် ကောင်းကောင်းအိပ်ပျော်ပြီး အနားရတယ်။',
  },
  poor: {
    shortLabel: 'Poor',
    descriptionEn:
      'Had trouble sleeping or woke up several times and did not feel well-rested',
    descriptionMy:
      'အိပ်ပျော်ဖို့ခက်တာ၊ ညဘက် မကြာခဏနိုးတာတွေရှိပြီး အိပ်ရေးမဝဘူး။',
  },
  very_poor: {
    shortLabel: 'Very poor',
    descriptionEn:
      'Had major difficulty sleeping and woke up feeling very tired.',
    descriptionMy:
      'အိပ်ပျော်ဖို့ အရမ်းခက်ခဲခဲ့ပြီး အိပ်ရေးမဝသလို မနက်နိုးလာချိန်မှာ အရမ်းပင်ပန်းတယ်။',
  },
};

/**
 * Narrows an unknown value to a known sleep-quality enum member.
 */
export function isSleepQuality(value: unknown): value is SleepQuality {
  return (
    typeof value === 'string' &&
    (SLEEP_QUALITY_VALUES as readonly string[]).includes(value)
  );
}

/**
 * Resolves sleep quality from a log, preferring `log.sleep_quality` over
 * `log.meta.sleep_quality`. Returns null when absent or unrecognized — never
 * invents a default.
 */
export function resolveSleepQualityFromLog(
  log: CarePlanLogEvidence | null | undefined,
): SleepQuality | null {
  if (!log) return null;
  if (isSleepQuality(log.sleep_quality)) return log.sleep_quality;
  const fromMeta = log.meta?.sleep_quality;
  if (isSleepQuality(fromMeta)) return fromMeta;
  return null;
}

/**
 * Whether an evidence item is a sleep task (section or morph).
 */
export function isSleepEvidenceItem(item: {
  section?: string | null;
  morph?: string | null;
}): boolean {
  return item.section === 'sleep' || item.morph === 'sleep';
}

/**
 * Admin display strings for a sleep-quality value (English admin UI).
 */
export function getSleepQualityDisplay(quality: SleepQuality): {
  shortLabel: string;
  description: string;
} {
  const copy = SLEEP_QUALITY_COPY[quality];
  return {
    shortLabel: copy.shortLabel,
    description: copy.descriptionEn,
  };
}
