/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ITaskLoaderProgressContext,
  TaskLoaderProgressContext,
} from "./context/TaskLoaderProgressContext";

/**
 * @typedef {Object} TaskResponse
 * @template T
 * @property {T} [data] - The data associated with the task response.
 * @property {any} error - Any error that occurred during the task.
 * @property {number} taskId - Identifier for the task.
 */
export type TaskResponse<T> = {
  data?: T;
  error: any;
  taskId: number;
};

/**
 * Defines the type of the request function used by the component.
 *
 * @typedef {function(any): Promise<TaskResponse<T>>} TaskLoaderFunction
 * @template T
 */
export type TaskLoaderFunction<T> = (args: any) => Promise<TaskResponse<T>>;

/**
 * Defines the type of the function used to return the response data from the component to the parent component.
 *
 * @typedef {function(any): any} ReturnDataFunction
 */
export type ReturnDataFunction = (args: any) => any;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
/**
 * @typedef {Object} TaskLoaderProgressProps
 * @template T, R
 * @property {TaskLoaderFunction<T>} taskLoader - Request function defined to retrieve the data.
 * @property {ReturnDataFunction} returnData - Function to return the response data to the parent component.
 * @property {R} [request] - Type used as request args.
 * @property {number} totalTasks - Total of tasks to be executed by the request.
 * @property {number} [fetchInterval=1000] - The interval in milliseconds to execute the request function.
 * @property {ReactNode} [children] - Component children.
 */
interface TaskLoaderProgressProps<T, R> {
  // Request function defined to retrieve the data
  taskLoader: TaskLoaderFunction<T>;
  // Function to return the response data to the parent component
  returnData: ReturnDataFunction;
  // Type used as request args
  request: R | undefined;
  // Total of tasks to be executed by the request
  totalTasks: number;
  // The interval in milliseconds to execute the request function (default 1000ms)
  fetchInterval?: number;
  // Component children
  children?: ReactNode;
}

/**
 * Component that performs recurrent requests to an API endpoint and updates the progress of the execution.
 *
 * @template T, R
 * @param {PropsWithChildren<TaskLoaderProgressProps<T, R>>} props - The properties for TaskLoaderProgress component.
 * @returns {JSX.Element} The rendered TaskLoaderProgress component.
 */
export const TaskLoaderProgress = <T, R>(
  props: PropsWithChildren<TaskLoaderProgressProps<T, R>>
) => {
  const [progress, setProgress] = useState<number>(0);
  const [buffer, setBuffer] = useState<number>(10);
  const [taskId, setTaskId] = useState<number>(0);

  const contextValue: ITaskLoaderProgressContext = {
    progress,
    buffer,
    taskId,
  };

  const progressRef = useRef(() => {});

  const totalTasks = props.totalTasks;
  const progressInc = Math.round(100 / totalTasks);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      progressRef.current();
      // Fetches the data
      fetchData();
    }, props.fetchInterval ?? 1000);

    /**
     * Fetches the data from the taskLoader and updates the state.
     */
    const fetchData = async () => {
      try {
        const taskLoader = props.taskLoader;
        const returnData = props.returnData;
        const request = props.request;

        const response = await taskLoader(request);

        const taskId = response.taskId;

        // LinearProgress buffer
        progressRef.current = () => {
          // Update the taskId, progress and buffer for tasks but last.
          setTaskId(taskId);
          setProgress(taskId * progressInc);
          if (buffer < 100 && progress % 5 === 0) {
            const newBuffer = buffer + 1 + Math.floor(Math.random() * 10);
            setBuffer(newBuffer > 100 ? 100 : newBuffer);
          }
        };

        // Update the taskId and progress for the last task and return the data to parent component
        if (taskId === totalTasks) {
          progressRef.current = () => {
            setTaskId(taskId - 1);
            setProgress(100);
          };
          const responseData = response.data;

          // Set interval to render progress with value 100 and then return the data
          setTimeout(
            () => {
              window.clearInterval(intervalId);

              returnData(responseData);
            },
            props.fetchInterval ? props.fetchInterval + 500 : 1500
          );
        }

        return response;
      } catch (error) {
        console.error(error);
      }
    };

    return () => window.clearInterval(intervalId);
  });

  return (
    // Wraps the children in the TaskLoaderProgressContext Provider
    <TaskLoaderProgressContext.Provider value={contextValue}>
      {props.children};
    </TaskLoaderProgressContext.Provider>
  );
};
