import { ArrowUp, MoreHorizontal } from 'lucide-react';
import { PROMPT_COLOR_CLASSES, PROMPT_ICON_MAP } from '@renderer/features/settings/prompt-icons';
import { Button } from '@renderer/lib/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@renderer/lib/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/lib/ui/tooltip';
import { cn } from '@renderer/utils/utils';
import type { ContextAction } from './context-actions';

const INLINE_LIMIT = 3;
const INLINE_WHEN_OVERFLOW = 2;

interface PromptButtonsProps {
  actions: ContextAction[];
  canApply: boolean;
  isSaving?: boolean;
  tooltipText: (label: string, canApply: boolean) => string;
  onApply: (action: ContextAction) => void;
}

function actionColors(action: ContextAction) {
  const bg = action.bgColor ? PROMPT_COLOR_CLASSES[action.bgColor] : null;
  const text = action.textColor ? PROMPT_COLOR_CLASSES[action.textColor] : null;
  return { bg: bg?.bg ?? '', text: text?.text ?? '' };
}

function InlineButton({
  action,
  canApply,
  isSaving,
  tooltipText,
  onApply,
}: {
  action: ContextAction;
  canApply: boolean;
  isSaving?: boolean;
  tooltipText: (label: string, canApply: boolean) => string;
  onApply: (action: ContextAction) => void;
}) {
  const Icon = PROMPT_ICON_MAP[action.icon ?? 'FileSearch'];
  const { bg, text } = actionColors(action);
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          variant="outline"
          size="sm"
          disabled={!canApply || isSaving}
          onClick={() => onApply(action)}
          className={cn(
            'h-7 max-w-full rounded-md px-2 text-xs font-normal hover:opacity-90',
            bg || 'bg-background-1 hover:bg-background-1/80',
            text
          )}
        >
          <Icon className="size-3.5 shrink-0" />
          <span className="max-w-72 truncate">{action.label}</span>
          <ArrowUp className="size-3 shrink-0" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipText(action.label, canApply)}</TooltipContent>
    </Tooltip>
  );
}

export function PromptButtons({
  actions,
  canApply,
  isSaving,
  tooltipText,
  onApply,
}: PromptButtonsProps) {
  if (actions.length === 0) return null;

  const showOverflow = actions.length > INLINE_LIMIT;
  const inline = showOverflow ? actions.slice(0, INLINE_WHEN_OVERFLOW) : actions;
  const overflow = showOverflow ? actions.slice(INLINE_WHEN_OVERFLOW) : [];

  return (
    <>
      {inline.map((action) => (
        <InlineButton
          key={action.id}
          action={action}
          canApply={canApply}
          isSaving={isSaving}
          tooltipText={tooltipText}
          onApply={onApply}
        />
      ))}
      {overflow.length > 0 ? (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canApply || isSaving}
                    className="h-7 rounded-md bg-background-1 px-2 text-xs font-normal hover:bg-background-1/80"
                  >
                    <MoreHorizontal className="size-3.5" />
                    <span>+{overflow.length}</span>
                  </Button>
                }
              />
            </TooltipTrigger>
            <TooltipContent>More prompts</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            {overflow.map((action) => {
              const Icon = PROMPT_ICON_MAP[action.icon ?? 'FileSearch'];
              const { text } = actionColors(action);
              return (
                <DropdownMenuItem
                  key={action.id}
                  onSelect={() => onApply(action)}
                  className={cn('gap-2 text-xs', text)}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{action.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </>
  );
}
