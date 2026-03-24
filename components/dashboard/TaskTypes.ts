export type QuadrantId = "do_now" | "schedule" | "delegate" | "eliminate";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  importance: boolean;
  urgency: boolean;
  quadrant: QuadrantId;
  completed: boolean;
  due_date: string | null;
  /** Optional local time for due (HH:mm), only meaningful when `due_date` is set */
  due_time?: string | null;
  review_at: string | null;
  completed_at: string | null;
  created_at: string;
  user_id: string;
};

/** Incomplete tasks first; completed tasks below, oldest completion first (newest at bottom). */
export function sortTasksForDisplay(tasks: Task[]): Task[] {
  const incomplete = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const complete = tasks
    .filter((t) => t.completed)
    .sort((a, b) => {
      const at = a.completed_at ? new Date(a.completed_at).getTime() : 0;
      const bt = b.completed_at ? new Date(b.completed_at).getTime() : 0;
      if (at !== bt) return at - bt;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  return [...incomplete, ...complete];
}

export const QUADRANTS: { id: QuadrantId; label: string; description: string }[] = [
  {
    id: "do_now",
    label: "DO NOW",
    description: "Urgent and important tasks that require immediate action."
  },
  {
    id: "schedule",
    label: "SCHEDULE",
    description: "Important work that builds long-term progress."
  },
  {
    id: "delegate",
    label: "DELEGATE",
    description: "Tasks that can be handed off to someone else."
  },
  {
    id: "eliminate",
    label: "ELIMINATE",
    description: "Tasks with little value that can be minimized."
  }
];

