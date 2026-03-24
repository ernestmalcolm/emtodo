"use client";

import { Tooltip } from "@mantine/core";

type Props = {
  showHint: boolean;
  hint: string;
};

/**
 * Use next to Time inputs that are disabled until a date is chosen.
 * Disabled fields rarely receive hover; the hint icon stays hoverable/focusable.
 */
export function TimeLabelWithHint({ showHint, hint }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5">
      Time
      {showHint && (
        <Tooltip label={hint} position="top" withArrow multiline maw={260}>
          <span
            tabIndex={0}
            role="button"
            className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-[#384571] text-[9px] font-bold leading-none text-text-secondary transition hover:border-quadrant-schedule hover:text-text-primary"
            aria-label={hint}
          >
            i
          </span>
        </Tooltip>
      )}
    </span>
  );
}
