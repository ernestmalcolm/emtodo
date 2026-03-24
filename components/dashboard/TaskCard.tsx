"use client";

import { useState } from "react";
import type { Task, QuadrantId } from "./TaskTypes";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { TaskDetailsModal } from "./TaskDetailsModal";
import { DeleteTaskConfirmModal } from "./DeleteTaskConfirmModal";

type Props = {
  task: Task;
  quadrantId: QuadrantId;
  onChange: (task: Task) => void;
  onTaskDelete: (taskId: string) => Promise<void>;
  dragAttributes: DraggableAttributes;
  dragListeners: SyntheticListenerMap | undefined;
};

const quadrantBorder: Record<QuadrantId, string> = {
  do_now: "border-quadrant-doNow",
  schedule: "border-quadrant-schedule",
  delegate: "border-quadrant-delegate",
  eliminate: "border-quadrant-eliminate"
};

const controlBtnClass =
  "mt-0.5 select-none rounded-md border border-[#2c3656] bg-navy-900/40 px-2 py-1 text-text-secondary transition hover:border-[#384571] hover:text-text-primary";

export function TaskCard({
  task,
  quadrantId,
  onChange,
  onTaskDelete,
  dragAttributes,
  dragListeners
}: Props) {
  const [opened, setOpened] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);

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
          className={`${controlBtnClass} text-[10px]`}
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
            {task.due_date && (
              <span>
                Due {task.due_date}
                {task.due_time ? ` · ${task.due_time}` : ""}
              </span>
            )}
            {task.review_at && <span>Review {formatTiny(task.review_at)}</span>}
            {task.completed && task.completed_at && <span>Done {formatTiny(task.completed_at)}</span>}
          </div>
        </div>
        <div className="mt-0.5 flex shrink-0 items-start gap-4">
          {task.completed ? (
            <span className="mt-0.5 whitespace-nowrap text-[10px] text-text-secondary/70">Done</span>
          ) : null}
          <button
            type="button"
            aria-label="Delete task"
            className={`${controlBtnClass} flex shrink-0 items-center justify-center hover:border-red-900/40 hover:text-red-300/90`}
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpened(true);
            }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <TaskDetailsModal
        opened={opened}
        onClose={() => setOpened(false)}
        task={task}
        onSaved={onChange}
      />

      <DeleteTaskConfirmModal
        opened={deleteOpened}
        onClose={() => setDeleteOpened(false)}
        task={deleteOpened ? task : null}
        onConfirm={() => onTaskDelete(task.id)}
      />
    </>
  );
}

function TrashIcon() {
  return (
    <svg
      className="h-3 w-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
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

