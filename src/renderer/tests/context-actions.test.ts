import { describe, expect, it } from 'vitest';
import type { PromptEntry } from '@shared/app-settings';
import type { Issue } from '@shared/tasks';
import {
  buildDraftCommentsContextAction,
  buildLinkedIssueContextAction,
  buildPromptContextActions,
  buildTaskContextActions,
} from '@renderer/features/tasks/conversations/context-actions';

function makePromptEntry(overrides: Partial<PromptEntry> = {}): PromptEntry {
  return {
    id: 'r1',
    label: 'Review',
    prompt: 'Review this worktree for issues.',
    icon: 'FileSearch',
    bgColor: 'slate',
    textColor: 'slate',
    ...overrides,
  };
}

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    provider: 'github',
    identifier: 'EMD-123',
    title: 'Fix task context injection behavior',
    url: 'https://example.com/issues/EMD-123',
    description: 'Ensure issue context can be injected from the context bar.',
    status: 'In Progress',
    assignees: ['alice', 'bob'],
    project: 'Infra',
    updatedAt: '2026-04-15T11:27:38.662Z',
    fetchedAt: '2026-04-15T15:49:46.788Z',
    ...overrides,
  };
}

describe('buildLinkedIssueContextAction', () => {
  it('returns null when no issue is linked', () => {
    expect(buildLinkedIssueContextAction(undefined)).toBeNull();
  });

  it('builds an inject action with provider metadata and compact label', () => {
    const action = buildLinkedIssueContextAction(makeIssue());

    expect(action).not.toBeNull();
    expect(action?.id).toBe('linked-issue:github:EMD-123');
    expect(action?.provider).toBe('github');
    expect(action?.label).toContain('EMD-123');
    expect(action?.label).toContain('Fix task context');
  });

  it('formats injected text as one line so it does not auto-submit', () => {
    const action = buildLinkedIssueContextAction(
      makeIssue({ description: 'Line one.\nLine two.\n\nLine three.' })
    );

    expect(action).not.toBeNull();
    expect(action?.text).toContain('Provider: GitHub');
    expect(action?.text).toContain('Identifier: EMD-123');
    expect(action?.text).toContain('Title: Fix task context injection behavior');
    expect(action?.text).toContain('URL: https://example.com/issues/EMD-123');
    expect(action?.text).toContain('Description: Line one. Line two. Line three.');
    expect(action?.text).toContain('Status: In Progress');
    expect(action?.text).toContain('Assignees: alice, bob');
    expect(action?.text).toContain('Project: Infra');
    expect(action?.text).not.toMatch(/\r|\n/);
  });

  it('does not truncate long descriptions when building injected text', () => {
    const longDescription = 'A'.repeat(500);
    const action = buildLinkedIssueContextAction(makeIssue({ description: longDescription }));

    expect(action).not.toBeNull();
    expect(action?.text).toContain(`Description: ${longDescription}`);
  });
});

describe('buildPromptContextActions', () => {
  it('returns empty array when no entries provided', () => {
    expect(buildPromptContextActions(undefined)).toEqual([]);
    expect(buildPromptContextActions([])).toEqual([]);
  });

  it('skips entries with whitespace-only prompts', () => {
    expect(buildPromptContextActions([makePromptEntry({ prompt: '   ' })])).toEqual([]);
  });

  it('preserves entry order and forwards icon/color metadata', () => {
    const actions = buildPromptContextActions([
      makePromptEntry({ id: 'a', label: 'A', prompt: 'first', bgColor: 'blue' }),
      makePromptEntry({ id: 'b', label: 'B', prompt: 'second', icon: 'Bug' }),
    ]);
    expect(actions).toHaveLength(2);
    expect(actions[0]).toMatchObject({
      id: 'prompt:a',
      kind: 'prompt',
      label: 'A',
      text: 'first',
      bgColor: 'blue',
    });
    expect(actions[1]).toMatchObject({
      id: 'prompt:b',
      label: 'B',
      text: 'second',
      icon: 'Bug',
    });
  });
});

describe('buildDraftCommentsContextAction', () => {
  it('returns null when there are no comments', () => {
    expect(
      buildDraftCommentsContextAction({
        count: 0,
        formattedComments: '<user_comments>...</user_comments>',
      })
    ).toBeNull();
  });

  it('returns null when formatted comments are empty', () => {
    expect(
      buildDraftCommentsContextAction({
        count: 2,
        formattedComments: '   ',
      })
    ).toBeNull();
  });

  it('builds an action with count label', () => {
    const action = buildDraftCommentsContextAction({
      count: 2,
      formattedComments: '<user_comments>test</user_comments>',
    });

    expect(action).toEqual({
      id: 'draft-comments',
      kind: 'draft-comments',
      label: 'Comments (2)',
      text: '<user_comments>test</user_comments>',
    });
  });
});

describe('buildTaskContextActions', () => {
  it('includes linked issue context, then draft comments, then review prompts in order', () => {
    const actions = buildTaskContextActions(
      makeIssue(),
      [
        makePromptEntry({ id: 'a', label: 'A' }),
        makePromptEntry({ id: 'b', label: 'B', prompt: 'second' }),
      ],
      {
        count: 1,
        formattedComments: '<user_comments>test</user_comments>',
      }
    );
    expect(actions).toHaveLength(4);
    expect(actions[0]?.id).toBe('linked-issue:github:EMD-123');
    expect(actions[1]?.id).toBe('draft-comments');
    expect(actions[2]?.id).toBe('prompt:a');
    expect(actions[3]?.id).toBe('prompt:b');
  });
});
