import React from "react";

export interface ITaskLoaderProgressContext {
  progress: number;
  buffer: number;
  taskId: number;
}

// Create a context
export const TaskLoaderProgressContext = React.createContext({
  progress: 0,
  buffer: 0,
  taskId: 0,
});
