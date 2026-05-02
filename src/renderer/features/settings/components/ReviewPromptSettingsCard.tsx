import { Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PromptEntry } from '@shared/app-settings';
import { PROMPT_COLORS, PROMPT_ICONS } from '@shared/prompts';
import { PROMPT_COLOR_CLASSES, PROMPT_ICON_MAP } from '@renderer/features/settings/prompt-icons';
import { useAppSettingsKey } from '@renderer/features/settings/use-app-settings-key';
import { Button } from '@renderer/lib/ui/button';
import { Input } from '@renderer/lib/ui/input';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '@renderer/lib/ui/popover';
import { Textarea } from '@renderer/lib/ui/textarea';
import { cn } from '@renderer/utils/utils';

const DEFAULT_REVIEW_PROMPT_ID = 'default-review';

function newId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function blankEntry(): PromptEntry {
  return {
    id: newId(),
    label: 'New prompt',
    prompt: '',
    icon: 'FileSearch',
    bgColor: 'slate',
    textColor: 'slate',
  };
}

function IconPicker({
  value,
  onChange,
}: {
  value: PromptEntry['icon'];
  onChange: (icon: PromptEntry['icon']) => void;
}) {
  const Active = PROMPT_ICON_MAP[value];
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Active className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid grid-cols-5 gap-1">
          {PROMPT_ICONS.map((name) => {
            const Icon = PROMPT_ICON_MAP[name];
            const active = name === value;
            return (
              <button
                key={name}
                type="button"
                onClick={() => onChange(name)}
                className={cn(
                  'flex size-9 items-center justify-center rounded-md hover:bg-background-1',
                  active && 'bg-background-1 ring-1 ring-foreground/30'
                )}
                title={name}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ColorPicker({
  value,
  onChange,
  ariaLabel,
}: {
  value: PromptEntry['bgColor'];
  onChange: (color: PromptEntry['bgColor']) => void;
  ariaLabel: string;
}) {
  const swatch = PROMPT_COLOR_CLASSES[value].swatch;
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label={ariaLabel}>
          <span className={cn('block size-4 rounded-full', swatch)} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid grid-cols-4 gap-2">
          {PROMPT_COLORS.map((color) => {
            const active = color === value;
            return (
              <button
                key={color}
                type="button"
                onClick={() => onChange(color)}
                className={cn(
                  'flex size-9 items-center justify-center rounded-md hover:bg-background-1',
                  active && 'ring-1 ring-foreground/30'
                )}
                title={color}
              >
                <span
                  className={cn('size-5 rounded-full', PROMPT_COLOR_CLASSES[color].swatch)}
                />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DeletePromptButton({
  label,
  onConfirm,
}: {
  label: string;
  onConfirm: () => void;
}) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost" size="sm" aria-label="Delete">
          <Trash2 className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            Delete <span className="font-medium">&ldquo;{label || 'Untitled'}&rdquo;</span>?
          </p>
          <div className="flex justify-end gap-2">
            <PopoverClose>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </PopoverClose>
            <PopoverClose>
              <Button variant="destructive" size="sm" onClick={onConfirm}>
                Delete
              </Button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ResetReviewPromptButton({ onConfirm, disabled }: { onConfirm: () => void; disabled: boolean }) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          aria-label="Reset review prompt to default"
          title="Reset review prompt to default"
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex flex-col gap-3">
          <p className="text-sm">Reset review prompt to its original default?</p>
          <div className="flex justify-end gap-2">
            <PopoverClose>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </PopoverClose>
            <PopoverClose>
              <Button variant="destructive" size="sm" onClick={onConfirm}>
                Reset
              </Button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function EntryRow({
  entry,
  isEditing,
  isProtected,
  canReset,
  onEditToggle,
  onChange,
  onDelete,
  onResetDefault,
}: {
  entry: PromptEntry;
  isEditing: boolean;
  isProtected: boolean;
  canReset: boolean;
  onEditToggle: () => void;
  onChange: (next: PromptEntry) => void;
  onDelete: () => void;
  onResetDefault: () => void;
}) {
  const Icon = PROMPT_ICON_MAP[entry.icon];
  const colors = PROMPT_COLOR_CLASSES[entry.bgColor];
  const textColors = PROMPT_COLOR_CLASSES[entry.textColor];

  return (
    <div className="rounded-md border border-border bg-background-1 p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs',
            colors.bg,
            textColors.text
          )}
        >
          <Icon className="size-3.5" />
          <span className="max-w-48 truncate">{entry.label}</span>
        </span>
        <span className="ml-auto flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditToggle}
            aria-label={isEditing ? 'Collapse' : 'Edit'}
          >
            <Pencil className="size-3.5" />
          </Button>
          {isProtected ? (
            <ResetReviewPromptButton onConfirm={onResetDefault} disabled={!canReset} />
          ) : (
            <DeletePromptButton label={entry.label} onConfirm={onDelete} />
          )}
        </span>
      </div>
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <IconPicker value={entry.icon} onChange={(icon) => onChange({ ...entry, icon })} />
            <ColorPicker
              value={entry.bgColor}
              ariaLabel="Background color"
              onChange={(bgColor) => onChange({ ...entry, bgColor })}
            />
            <ColorPicker
              value={entry.textColor}
              ariaLabel="Text color"
              onChange={(textColor) => onChange({ ...entry, textColor })}
            />
            <Input
              value={entry.label}
              onChange={(e) => onChange({ ...entry, label: e.target.value })}
              placeholder="Label"
              maxLength={48}
              className="h-8"
            />
          </div>
          <Textarea
            value={entry.prompt}
            onChange={(e) => onChange({ ...entry, prompt: e.target.value })}
            placeholder="Prompt text"
            className="min-h-24 px-3 py-2 text-[13px] leading-relaxed"
          />
        </div>
      ) : null}
    </div>
  );
}

export function ReviewPromptSettingsCard() {
  const { value, defaults, update, isLoading, isSaving } = useAppSettingsKey('reviewPrompt');
  const items = useMemo(() => value?.items ?? [], [value]);
  const defaultItems = defaults?.items ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);

  const commit = (nextItems: PromptEntry[]) => {
    update({ items: nextItems });
  };

  const onChange = (next: PromptEntry) => {
    commit(items.map((it) => (it.id === next.id ? next : it)));
  };

  const onDelete = (id: string) => {
    if (id === DEFAULT_REVIEW_PROMPT_ID) return;
    commit(items.filter((it) => it.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const onAdd = () => {
    const entry = blankEntry();
    commit([...items, entry]);
    setEditingId(entry.id);
  };

  const onResetDefault = () => {
    const defaultEntry = defaultItems.find((it) => it.id === DEFAULT_REVIEW_PROMPT_ID);
    if (!defaultEntry) return;
    commit(items.map((it) => (it.id === DEFAULT_REVIEW_PROMPT_ID ? defaultEntry : it)));
  };

  const reviewPromptEntry = items.find((it) => it.id === DEFAULT_REVIEW_PROMPT_ID);
  const defaultReviewPrompt = defaultItems.find((it) => it.id === DEFAULT_REVIEW_PROMPT_ID);
  const reviewPromptDirty =
    reviewPromptEntry && defaultReviewPrompt
      ? reviewPromptEntry.label !== defaultReviewPrompt.label ||
        reviewPromptEntry.prompt !== defaultReviewPrompt.prompt ||
        reviewPromptEntry.icon !== defaultReviewPrompt.icon ||
        reviewPromptEntry.bgColor !== defaultReviewPrompt.bgColor ||
        reviewPromptEntry.textColor !== defaultReviewPrompt.textColor
      : false;

  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No prompts. Add one to get started.</p>
      ) : null}
      {items.map((entry) => {
        const isProtected = entry.id === DEFAULT_REVIEW_PROMPT_ID;
        return (
          <EntryRow
            key={entry.id}
            entry={entry}
            isEditing={editingId === entry.id}
            isProtected={isProtected}
            canReset={isProtected && reviewPromptDirty && !isLoading && !isSaving}
            onEditToggle={() => setEditingId(editingId === entry.id ? null : entry.id)}
            onChange={onChange}
            onDelete={() => onDelete(entry.id)}
            onResetDefault={onResetDefault}
          />
        );
      })}
      <Button
        variant="outline"
        size="sm"
        onClick={onAdd}
        disabled={isLoading || isSaving}
        className="self-start"
      >
        <Plus className="size-3.5" />
        Add prompt
      </Button>
    </div>
  );
}
