"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, TextInput, Textarea, Radio, Button, Switch } from "@mantine/core";
import { DateInput, TimeInput, DateTimePicker } from "@mantine/dates";
import type { QuadrantId, Task } from "./TaskTypes";
import { TimeLabelWithHint } from "./TimeLabelWithHint";
import { getSupabaseClient } from "@/lib/supabase-client";

type Props = {
  opened: boolean;
  onClose: () => void;
  task: Task;
  onSaved: (task: Task) => void;
};

const quadrantFromBooleans = (importance: boolean, urgency: boolean): QuadrantId => {
  if (importance && urgency) return "do_now";
  if (importance && !urgency) return "schedule";
  if (!importance && urgency) return "delegate";
  return "eliminate";
};

const quadrantLabel: Record<QuadrantId, string> = {
  do_now: "DO NOW",
  schedule: "SCHEDULE",
  delegate: "DELEGATE",
  eliminate: "ELIMINATE"
};

export function TaskDetailsModal({ opened, onClose, task, onSaved }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [importance, setImportance] = useState(task.importance);
  const [urgency, setUrgency] = useState(task.urgency);
  const [dueDate, setDueDate] = useState<string | null>(task.due_date ?? null);
  const [dueTime, setDueTime] = useState<string>(task.due_time?.trim() || "09:00");
  const initialReview = splitReviewAt(task.review_at ?? null);
  const [reviewDate, setReviewDate] = useState<string | null>(initialReview.date);
  const [reviewTime, setReviewTime] = useState<string>(initialReview.time);
  const [completed, setCompleted] = useState(task.completed);
  const [completedAt, setCompletedAt] = useState<string | null>(
    task.completed_at ?? new Date().toISOString()
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!opened) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setImportance(task.importance);
    setUrgency(task.urgency);
    setDueDate(task.due_date ?? null);
    setDueTime(task.due_time?.trim() || "09:00");
    const nextReview = splitReviewAt(task.review_at ?? null);
    setReviewDate(nextReview.date);
    setReviewTime(nextReview.time);
    setCompleted(task.completed);
    setCompletedAt(task.completed_at ?? new Date().toISOString());
    setError(null);
  }, [opened, task]);

  const quadrantPreview = useMemo(
    () => quadrantFromBooleans(importance, urgency),
    [importance, urgency]
  );

  const save = async () => {
    if (!title.trim()) {
      setError("Please give this task a title.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const nextCompletedAt = completed ? completedAt ?? new Date().toISOString() : null;
      const reviewAt = buildReviewAt(reviewDate, reviewTime);

      const update = {
        title: title.trim(),
        description: description.trim() || null,
        importance,
        urgency,
        quadrant: quadrantPreview,
        due_date: dueDate,
        due_time: dueDate && dueTime.trim() ? dueTime.trim() : null,
        review_at: reviewAt,
        completed,
        completed_at: nextCompletedAt
      };

      const { data, error: updateError } = await supabase
        .from("tasks")
        .update(update)
        .eq("id", task.id)
        .select("*")
        .single();

      if (updateError || !data) {
        setError(updateError?.message ?? "Unable to save changes.");
        setSubmitting(false);
        return;
      }

      onSaved(data as Task);
      setSubmitting(false);
      onClose();
    } catch (e) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => (submitting ? null : onClose())}
      title="Task"
      centered
      overlayProps={{ blur: 8, opacity: 0.7 }}
      styles={{
        header: { borderBottom: "1px solid #222b46", marginBottom: 12, paddingBottom: 8 },
        title: { fontSize: 14 },
        body: { backgroundColor: "#10172f" },
        content: { backgroundColor: "#10172f", borderRadius: 16, border: "1px solid #222b46" }
      }}
    >
      <div className="space-y-4">
        <TextInput
          label="Title"
          placeholder="What is this, in a few words?"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          size="sm"
          styles={{
            label: { color: "#AAB6CF", fontSize: 12 },
            input: { backgroundColor: "#0B132B", borderColor: "#222b46", color: "#EAEFF7" }
          }}
        />

        <Textarea
          label="Context"
          placeholder="A short note, intention, or constraint (optional)"
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          size="sm"
          styles={{
            label: { color: "#AAB6CF", fontSize: 12 },
            input: { backgroundColor: "#0B132B", borderColor: "#222b46", color: "#EAEFF7" }
          }}
        />

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Due
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DateInput
                label="Date"
                placeholder="Pick a day"
                value={dueDate}
                onChange={(value) => {
                  setDueDate(value);
                  if (!value) setDueTime("09:00");
                }}
                clearable
                size="sm"
                valueFormat="YYYY-MM-DD"
                styles={{
                  label: { color: "#AAB6CF", fontSize: 12 },
                  input: { backgroundColor: "#0B132B", borderColor: "#222b46", color: "#EAEFF7" }
                }}
              />
              <TimeInput
                label={
                  <TimeLabelWithHint
                    showHint={!dueDate}
                    hint="Choose a due date first. Then you can set a time."
                  />
                }
                value={dueTime}
                onChange={(e) => setDueTime(e.currentTarget.value)}
                disabled={!dueDate}
                size="sm"
                styles={{
                  label: { color: "#AAB6CF", fontSize: 12 },
                  input: {
                    backgroundColor: "#0B132B",
                    borderColor: "#222b46",
                    color: "#EAEFF7",
                    opacity: dueDate ? 1 : 0.55
                  }
                }}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Review
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DateInput
                label="Date"
                placeholder="Pick a day"
                value={reviewDate}
                onChange={(value) => {
                  setReviewDate(value);
                  if (!value) setReviewTime("09:00");
                }}
                clearable
                size="sm"
                valueFormat="YYYY-MM-DD"
                styles={{
                  label: { color: "#AAB6CF", fontSize: 12 },
                  input: {
                    backgroundColor: "#0B132B",
                    borderColor: "#222b46",
                    color: "#EAEFF7"
                  }
                }}
              />
              <TimeInput
                label={
                  <TimeLabelWithHint
                    showHint={!reviewDate}
                    hint="Choose a review day first. Then you can set a time."
                  />
                }
                value={reviewTime}
                onChange={(e) => setReviewTime(e.currentTarget.value)}
                disabled={!reviewDate}
                size="sm"
                styles={{
                  label: { color: "#AAB6CF", fontSize: 12 },
                  input: {
                    backgroundColor: "#0B132B",
                    borderColor: "#222b46",
                    color: "#EAEFF7",
                    opacity: reviewDate ? 1 : 0.55
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Radio.Group
            value={importance ? "important" : "not_important"}
            onChange={(value) => setImportance(value === "important")}
            label="Importance"
            styles={{ label: { color: "#AAB6CF", fontSize: 12 } }}
          >
            <div className="mt-1 flex gap-3 text-xs">
              <Radio value="important" label="Important" />
              <Radio value="not_important" label="Not important" />
            </div>
          </Radio.Group>

          <Radio.Group
            value={urgency ? "urgent" : "not_urgent"}
            onChange={(value) => setUrgency(value === "urgent")}
            label="Urgency"
            styles={{ label: { color: "#AAB6CF", fontSize: 12 } }}
          >
            <div className="mt-1 flex gap-3 text-xs">
              <Radio value="urgent" label="Urgent" />
              <Radio value="not_urgent" label="Not urgent" />
            </div>
          </Radio.Group>
        </div>

        <div className="rounded-xl bg-navy-800/70 px-3 py-2 text-xs text-text-secondary">
          This task will appear in:{" "}
          <span className="font-semibold text-text-primary">
            {quadrantLabel[quadrantPreview]}
          </span>
        </div>

        <div className="rounded-xl border border-[#222b46] bg-navy-900/40 px-3 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-primary">Completed</p>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                Marking complete asks for when you finished.
              </p>
            </div>
            <Switch
              checked={completed}
              onChange={(e) => {
                const next = e.currentTarget.checked;
                setCompleted(next);
                if (next) setCompletedAt(new Date().toISOString());
              }}
              size="sm"
            />
          </div>
          {completed && (
            <div className="mt-3">
              <DateTimePicker
                label="Completed at"
                value={completedAt}
                onChange={setCompletedAt}
                size="sm"
                styles={{
                  label: { color: "#AAB6CF", fontSize: 12 },
                  input: {
                    backgroundColor: "#0B132B",
                    borderColor: "#222b46",
                    color: "#EAEFF7"
                  }
                }}
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-quadrant-doNow/90 rounded-lg bg-quadrant-doNow/10 px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            variant="default"
            fullWidth
            disabled={submitting}
            styles={{
              root: {
                width: "100%",
                backgroundColor: "transparent",
                borderColor: "#2c3656",
                color: "#EAEFF7"
              }
            }}
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            fullWidth
            loading={submitting}
            styles={{
              root: {
                width: "100%",
                backgroundColor: "#5BC0BE",
                color: "#0B132B",
                border: "none"
              }
            }}
            onClick={save}
          >
            Save changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function splitReviewAt(reviewAt: string | null): { date: string | null; time: string } {
  if (!reviewAt) return { date: null, time: "09:00" };
  const d = new Date(reviewAt);
  if (Number.isNaN(d.getTime())) return { date: null, time: "09:00" };
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
}

function buildReviewAt(reviewDate: string | null, reviewTime: string) {
  if (!reviewDate) return null;
  const time = reviewTime?.trim() ? reviewTime.trim() : "09:00";
  const isoLike = `${reviewDate}T${time.length === 5 ? `${time}:00` : time}`;
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

