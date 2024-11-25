import { progressMap } from "@/trpc/mediaRouter";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

function getTaskId(req: Request, res: Response) {
  const taskId = uuidv4();
  progressMap[taskId] = { status: "Pending", progress: 0 };
  console.log("new task created: ", taskId);
  res.json({ taskId });
}

function getTaskStatus(req: Request, res: Response) {
  const { taskId } = req.params;

  if (!progressMap[taskId]) {
    return res.status(400).json({ message: "Task not found" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`data: ${JSON.stringify(progressMap[taskId])}\n\n`);

  const intervelId = setInterval(() => {
    if (!progressMap[taskId]) {
      res.write("event:end\n");
      res.write("data: Task not found\n\n");
      clearInterval(intervelId);
      res.end();
    } else {
      res.write(`data: ${JSON.stringify(progressMap[taskId])}\n\n`);

      if (progressMap[taskId].status === "Done" || progressMap[taskId].status === "Failed") {
        clearInterval(intervelId);
        res.end();
      }
    }
  }, 1000);

  req.on("close", () => {
    clearInterval(intervelId);
  });
}

export { getTaskId, getTaskStatus };
