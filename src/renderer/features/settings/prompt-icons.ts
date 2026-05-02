import {
  BookOpen,
  Bug,
  FileSearch,
  GitPullRequest,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  TestTube,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { PromptEntry } from '@shared/app-settings';

export const PROMPT_ICON_MAP: Record<PromptEntry['icon'], LucideIcon> = {
  FileSearch,
  Bug,
  ShieldCheck,
  Sparkles,
  GitPullRequest,
  TestTube,
  Wrench,
  BookOpen,
  Lightbulb,
  Zap,
};

export const PROMPT_COLOR_CLASSES: Record<
  PromptEntry['bgColor'],
  { bg: string; text: string; swatch: string }
> = {
  slate: { bg: 'bg-slate-500/15', text: 'text-slate-300', swatch: 'bg-slate-500' },
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-300', swatch: 'bg-blue-500' },
  green: { bg: 'bg-green-500/15', text: 'text-green-300', swatch: 'bg-green-500' },
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-300', swatch: 'bg-amber-500' },
  red: { bg: 'bg-red-500/15', text: 'text-red-300', swatch: 'bg-red-500' },
  violet: { bg: 'bg-violet-500/15', text: 'text-violet-300', swatch: 'bg-violet-500' },
  pink: { bg: 'bg-pink-500/15', text: 'text-pink-300', swatch: 'bg-pink-500' },
  cyan: { bg: 'bg-cyan-500/15', text: 'text-cyan-300', swatch: 'bg-cyan-500' },
};
