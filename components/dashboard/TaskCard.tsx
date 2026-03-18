"use client";

import { useState } from "react";
import type { Task, QuadrantId } from "./TaskTypes";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { TaskDetailsModal } from "./TaskDetailsModal";

type Props = {
  task: Task;
  quadrantId: QuadrantId;
  onChange: (task: Task) => void;
  dragAttributes: DraggableAttributes;
  dragListeners: SyntheticListenerMap | undefined;
};

const quadrantBorder: Record<QuadrantId, string> = {
  do_now: "border-quadrant-doNow",
  schedule: "border-quadrant-schedule",
  delegate: "border-quadrant-delegate",
  eliminate: "border-quadrant-eliminate"
};

export function TaskCard({ task, quadrantId, onChange, dragAttributes, dragListeners }: Props) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpened(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpened(true);
        }}
        className={`group flex cursor-pointer items-start gap-2 rounded-xl border-l-4 ${quadrantBorder[quadrantId]} bg-navy-800/80 px-3 py-2 shadow-sm transition-colors hover:bg-navy-700/90`}
      >
        <button
          type="button"
          aria-label="Drag task"
          className="mt-0.5 select-none rounded-md border border-[#2c3656] bg-navy-900/40 px-2 py-1 text-[10px] text-text-secondary transition hover:border-[#384571] hover:text-text-primary"
          onClick={(e) => e.stopPropagation()}
          {...taskDragProps({ dragAttributes, dragListeners })}
        >
          ⠿
        </button>
        <div className="min-w-0 flex-1">
          <p
            className={`text-xs font-medium ${
              task.completed ? "text-text-secondary/70 line-through" : "text-text-primary"
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p
              className={`mt-0.5 text-[11px] ${
                task.completed ? "text-text-secondary/50" : "text-text-secondary"
              }`}
            >
              {task.description}
            </p>
          )}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-text-secondary/80">
            {task.due_date && <span>Due {task.due_date}</span>}
            {task.review_at && <span>Review {formatTiny(task.review_at)}</span>}
            {task.completed && task.completed_at && <span>Done {formatTiny(task.completed_at)}</span>}
          </div>
        </div>
        <div className="mt-0.5 text-[10px] text-text-secondary/70">{task.completed ? "Done" : ""}</div>
      </div>

      <TaskDetailsModal
        opened={opened}
        onClose={() => setOpened(false)}
        task={task}
        onSaved={onChange}
      />
    </>
  );
}

function taskDragProps({
  dragAttributes,
  dragListeners
}: {
  dragAttributes: DraggableAttributes;
  dragListeners: SyntheticListenerMap | undefined;
}) {
  return { ...dragAttributes, ...dragListeners };
}

function formatTiny(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

