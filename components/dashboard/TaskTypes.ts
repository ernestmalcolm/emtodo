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
  review_at: string | null;
  completed_at: string | null;
  created_at: string;
  user_id: string;
};

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

