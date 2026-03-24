"use client";

import { useState } from "react";
import { Modal, Button, Text } from "@mantine/core";
import type { Task } from "./TaskTypes";

type Props = {
  opened: boolean;
  onClose: () => void;
  task: Task | null;
  onConfirm: () => Promise<void>;
};

export function DeleteTaskConfirmModal({ opened, onClose, task, onConfirm }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (deleting) return;
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete this task.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      opened={opened && !!task}
      onClose={handleClose}
      title="Delete this task?"
      centered
      overlayProps={{ blur: 8, opacity: 0.7 }}
      styles={{
        header: { borderBottom: "1px solid #222b46", marginBottom: 12, paddingBottom: 8 },
        title: { fontSize: 14 },
        body: { backgroundColor: "#10172f" },
        content: { backgroundColor: "#10172f", borderRadius: 16, border: "1px solid #222b46" }
      }}
    >
      {task && (
        <>
          <Text size="sm" c="#AAB6CF" className="leading-relaxed">
            This removes{" "}
            <span className="font-medium text-[#EAEFF7]">&ldquo;{task.title}&rdquo;</span> from your
            matrix. You cannot undo this.
          </Text>
          {error && (
            <p className="mt-3 text-xs text-quadrant-doNow/90 rounded-lg bg-quadrant-doNow/10 px-3 py-2">
              {error}
            </p>
          )}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="default"
              disabled={deleting}
              styles={{
                root: {
                  backgroundColor: "transparent",
                  borderColor: "#2c3656",
                  color: "#EAEFF7"
                }
              }}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              loading={deleting}
              styles={{
                root: {
                  backgroundColor: "rgba(200, 72, 72, 0.2)",
                  color: "#f0b4b4",
                  border: "1px solid rgba(220, 100, 100, 0.45)"
                }
              }}
              onClick={handleConfirm}
            >
              Delete task
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
