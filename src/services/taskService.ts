import { progressMap } from "@/trpc/mediaRouter";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

function getTaskId(req: Request, res: Response) {
  const taskId = uuidv4();
  progressMap[taskId] = { status: "Pending", progress: 0 };
  res.json({ taskId });
}

function getTaskStatus(req: Request, res: Response) {
  const { taskId } = req.params;
  const progress = progressMap[taskId];

  if (!progress) {
    return res.status(400).json({ message: "Task not found" });
  }
  return res.json(progress);
}

export { getTaskId, getTaskStatus };
