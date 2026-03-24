"use client";

import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { QuadrantPanel } from "./Quadrant";
import { QUADRANTS, QuadrantId, Task } from "./TaskTypes";
import { AddTaskModal } from "./AddTaskModal";
import { getSupabaseClient } from "@/lib/supabase-client";
import { useSupabaseAuth } from "@/lib/supabase-provider";

export function Matrix() {
  const { user } = useSupabaseAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalQuadrant, setModalQuadrant] = useState<QuadrantId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4
      }
    })
  );

  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setTasks(data as Task[]);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [user]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !user) return;

    const targetQuadrant = over.id as QuadrantId;
    const taskId = active.id;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.quadrant === targetQuadrant) return;

    const importance =
      targetQuadrant === "do_now" || targetQuadrant === "schedule" ? true : false;
    const urgency =
      targetQuadrant === "do_now" || targetQuadrant === "delegate" ? true : false;

    const updatedTask: Task = {
      ...task,
      quadrant: targetQuadrant,
      importance,
      urgency
    };

    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));

    const supabase = getSupabaseClient();
    await supabase
      .from("tasks")
      .update({
        quadrant: targetQuadrant,
        importance,
        urgency
      })
      .eq("id", task.id);
  };

  const updateTaskInState = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleTaskCreated = (task: Task) => {
    setTasks((prev) => [...prev, task]);
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!user) return;
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-secondary">
        Loading your space...
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2">
          {QUADRANTS.map((quadrant) => (
            <QuadrantPanel
              key={quadrant.id}
              id={quadrant.id}
              label={quadrant.label}
              description={quadrant.description}
              tasks={tasks.filter((t) => t.quadrant === quadrant.id)}
              onTaskChange={updateTaskInState}
              onTaskDelete={handleTaskDelete}
              onAddTaskClick={() => setModalQuadrant(quadrant.id)}
            />
          ))}
        </div>
      </DndContext>

      {modalQuadrant && user && (
        <AddTaskModal
          opened={!!modalQuadrant}
          onClose={() => setModalQuadrant(null)}
          initialQuadrant={modalQuadrant}
          userId={user.id}
          onCreated={handleTaskCreated}
        />
      )}

      {loading && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 flex justify-center text-[11px] text-text-secondary/70">
          Syncing your tasks with Supabase...
        </div>
      )}
    </>
  );
}

