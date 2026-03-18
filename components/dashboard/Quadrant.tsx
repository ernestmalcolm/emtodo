"use client";

import type { CSSProperties, ReactNode } from "react";
import type { QuadrantId, Task } from "./TaskTypes";
import { TaskCard } from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";

type Props = {
  id: QuadrantId;
  label: string;
  description: string;
  tasks: Task[];
  onTaskChange: (task: Task) => void;
  onAddTaskClick: () => void;
};

const quadrantAccentBg: Record<QuadrantId, string> = {
  do_now: "text-quadrant-doNow",
  schedule: "text-quadrant-schedule",
  delegate: "text-quadrant-delegate",
  eliminate: "text-quadrant-eliminate"
};

export function QuadrantPanel({
  id,
  label,
  description,
  tasks,
  onTaskChange,
  onAddTaskClick
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const emptyMessage =
    id === "do_now"
      ? "Nothing urgent and important right now."
      : id === "schedule"
      ? "A calm space to plan what matters."
      : id === "delegate"
      ? "Nothing to hand off at the moment."
      : "Nothing here. Notice what can be gently removed.";

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-[220px] flex-col rounded-2xl border border-[#222b46] bg-[#10172f]/80 p-4 shadow-soft transition-colors ${
        isOver ? "border-quadrant-schedule/80 bg-navy-800/80" : ""
      }`}
    >
      <header className="mb-3 space-y-1">
        <p className={`text-[11px] font-semibold tracking-[0.25em] ${quadrantAccentBg[id]}`}>
          {label}
        </p>
        <p className="text-[11px] text-text-secondary">{description}</p>
      </header>

      <SortableContext items={tasks.map((t) => t.id)}>
        <div className="flex flex-1 flex-col gap-2">
          {tasks.length === 0 ? (
            <p className="text-[11px] italic text-text-secondary/80">{emptyMessage}</p>
          ) : (
            tasks.map((task) => (
              <DraggableTask key={task.id} task={task} quadrantId={id} onChange={onTaskChange} />
            ))
          )}
        </div>
      </SortableContext>

      <button
        type="button"
        onClick={onAddTaskClick}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#384571] px-3 py-1.5 text-[11px] text-text-secondary transition hover:border-quadrant-schedule hover:text-text-primary"
      >
        <span className="text-base leading-none text-quadrant-schedule">＋</span>
        <span>Add task</span>
      </button>
    </section>
  );
}

type DraggableTaskProps = {
  task: Task;
  quadrantId: QuadrantId;
  onChange: (task: Task) => void;
};

function DraggableTask({ task, quadrantId, onChange }: DraggableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id
  });

  const style: CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${isDragging ? 1.02 : 1})`
      : undefined,
    transition
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        quadrantId={quadrantId}
        onChange={onChange}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

