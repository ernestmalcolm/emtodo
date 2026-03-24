"use client";

import { useState, useMemo } from "react";
import { Modal, TextInput, Textarea, Radio, Button } from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import type { QuadrantId, Task } from "./TaskTypes";
import { TimeLabelWithHint } from "./TimeLabelWithHint";
import { getSupabaseClient } from "@/lib/supabase-client";

type Props = {
  opened: boolean;
  onClose: () => void;
  initialQuadrant: QuadrantId;
  userId: string;
  onCreated: (task: Task) => void;
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

export function AddTaskModal({ opened, onClose, initialQuadrant, userId, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dueTime, setDueTime] = useState<string>("09:00");
  const [reviewDate, setReviewDate] = useState<string | null>(null);
  const [reviewTime, setReviewTime] = useState<string>("09:00");
  const [importance, setImportance] = useState(
    initialQuadrant === "do_now" || initialQuadrant === "schedule"
  );
  const [urgency, setUrgency] = useState(
    initialQuadrant === "do_now" || initialQuadrant === "delegate"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveQuadrant = useMemo(
    () => quadrantFromBooleans(importance, urgency),
    [importance, urgency]
  );

  const handleClose = () => {
    if (submitting) return;
    setTitle("");
    setDescription("");
    setDueDate(null);
    setDueTime("09:00");
    setReviewDate(null);
    setReviewTime("09:00");
    setImportance(initialQuadrant === "do_now" || initialQuadrant === "schedule");
    setUrgency(initialQuadrant === "do_now" || initialQuadrant === "delegate");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please give this task a name.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const reviewAt = buildReviewAt(reviewDate, reviewTime);
      const { data, error: insertError } = await supabase
        .from("tasks")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          importance,
          urgency,
          quadrant: effectiveQuadrant,
          completed: false,
          due_date: dueDate,
          due_time: dueDate && dueTime.trim() ? dueTime.trim() : null,
          review_at: reviewAt,
          completed_at: null,
          user_id: userId
        })
        .select("*")
        .single();

      if (insertError || !data) {
        setError(insertError?.message ?? "Unable to save task.");
        setSubmitting(false);
        return;
      }

      onCreated(data as Task);
      setSubmitting(false);
      handleClose();
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Add a task"
      centered
      overlayProps={{ blur: 8, opacity: 0.7 }}
      styles={{
        header: { borderBottom: "1px solid #222b46", marginBottom: 12, paddingBottom: 8 },
        title: { fontSize: 14 },
        body: { backgroundColor: "#10172f" },
        content: { backgroundColor: "#10172f", borderRadius: 16, border: "1px solid #222b46" }
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Title"
          placeholder="Name of the task"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          size="sm"
          required
          styles={{
            label: { color: "#AAB6CF", fontSize: 12 },
            input: { backgroundColor: "#0B132B", borderColor: "#222b46", color: "#EAEFF7" }
          }}
        />
        <Textarea
          label="Description"
          placeholder="Add a short note or intention (optional)"
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
            styles={{
              label: { color: "#AAB6CF", fontSize: 12 },
              description: { color: "#AAB6CF" }
            }}
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
            styles={{
              label: { color: "#AAB6CF", fontSize: 12 },
              description: { color: "#AAB6CF" }
            }}
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
            {quadrantLabel[effectiveQuadrant]}
          </span>
        </div>

        {error && <p className="text-xs text-quadrant-doNow/90">{error}</p>}

        <Button
          type="submit"
          fullWidth
          loading={submitting}
          size="sm"
          styles={{
            root: {
              backgroundColor: "#5BC0BE",
              color: "#0B132B",
              marginTop: 4
            }
          }}
        >
          Save task
        </Button>
      </form>
    </Modal>
  );
}

function buildReviewAt(reviewDate: string | null, reviewTime: string) {
  if (!reviewDate) return null;
  const time = reviewTime?.trim() ? reviewTime.trim() : "09:00";
  const isoLike = `${reviewDate}T${time.length === 5 ? `${time}:00` : time}`;
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

