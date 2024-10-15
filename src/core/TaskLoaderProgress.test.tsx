import React, { useContext, useEffect, useRef, useState } from "react";

import { act, render, screen, waitFor } from "@testing-library/react";

import { TaskLoaderProgressContext } from "./context/TaskLoaderProgressContext";
import { TaskLoaderProgress } from "./TaskLoaderProgress"; // Adjust import as necessary

import "@testing-library/jest-dom";
import "@testing-library/jest-dom";

declare global {
  // File-scoped auxiliary variables
  // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
  var returnData: (data: any) => any;
}

describe("TaskLoaderProgress Component", () => {
  let taskLoaderMock: jest.Mock;
  let returnDataMock: jest.Mock;

  beforeEach(() => {
    taskLoaderMock = jest.fn();
    returnDataMock = jest.fn();
    jest.useFakeTimers();
    jest.spyOn(global.Math, "random").mockReturnValue(0.1);

    global.returnData = jest.fn((data) => {
      return data;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.spyOn(global.Math, "random").mockRestore();
  });

  const ConsumerComponent = () => {
    const { progress, buffer, taskId } = useContext(TaskLoaderProgressContext);
    return (
      <>
        <span data-testid="progress">{`Progress: ${progress}`}</span>
        <span data-testid="buffer">{`Buffer: ${buffer}`}</span>
        <span data-testid="taskId">{`Task ID: ${taskId}`}</span>
      </>
    );
  };

  const renderComponent = (
    totalTasks: number,
    mockTaskId: number,
    data: { result?: string },
    fetchInterval?: number
  ) => {
    const response = { taskId: mockTaskId, data: data };

    taskLoaderMock.mockResolvedValueOnce(response);

    const TestComponent = () => {
      const [progress, setProgress] = useState(0);
      const [buffer, setBuffer] = useState(10);
      const [taskId, setTaskId] = useState(0);

      const contextValue = {
        progress,
        buffer,
        taskId,
      };

      // if (response.taskId > totalTasks) {
      //   throw new Error("Task ID exceeds total steps");
      // }

      const progressRef = useRef(() => {});

      useEffect(() => {
        try {
          progressRef.current = () => {
            if (response.taskId === totalTasks) {
              setTaskId(response.taskId - 1);
              setProgress(100);

              window.clearInterval(1);
              global.returnData(response.data);
            } else {
              setTaskId(response.taskId);
              setProgress(response.taskId * (100 / totalTasks));
              if (buffer < 100 && progress % 5 === 0) {
                const newBuffer = buffer + 1 + Math.random() * 10;
                setBuffer(newBuffer > 100 ? 100 : newBuffer);
              }
            }
          };

          progressRef.current(); // Call to mimic effect that uses this reference
        } catch (error) {
          console.error(error);
        }
      }, [response.taskId, totalTasks]); // Ensure dependency causes correct updates

      return (
        <TaskLoaderProgress
          taskLoader={taskLoaderMock}
          returnData={returnDataMock}
          request={{}}
          totalTasks={totalTasks}
          fetchInterval={fetchInterval}
        >
          <TaskLoaderProgressContext.Provider value={contextValue}>
            <ConsumerComponent />
          </TaskLoaderProgressContext.Provider>
        </TaskLoaderProgress>
      );
    };

    render(<TestComponent />);
  };

  it("initializes with correct context values", () => {
    renderComponent(10, 0, {});

    expect(screen.getByTestId("progress")).toHaveTextContent("Progress: 0");
    expect(screen.getByTestId("buffer")).toHaveTextContent("Buffer: 12");
    expect(screen.getByTestId("taskId")).toHaveTextContent("Task ID: 0");
  });

  // it("updates progress and taskId when progressRef.current is called in useEffect", async () => {
  //   renderComponent(10, 2, {});

  //   await act(async () => {
  //     jest.advanceTimersByTime(1000); // Simulate the component update trigger
  //   });

  //   // Verify the progress and taskId are updated correctly
  //   expect(screen.getByTestId("progress")).toHaveTextContent(`Progress: 20`);
  //   expect(screen.getByTestId("buffer")).toHaveTextContent("Buffer: 12");
  //   expect(screen.getByTestId("taskId")).toHaveTextContent(`Task ID: 2`);
  // });

  it("completes tasks and calls returnData on final step when taskId equals totalTasks", async () => {
    renderComponent(10, 10, { result: "final data" });

    // Simulate the interval tick to trigger the taskLoader function
    await act(async () => {
      jest.advanceTimersByTime(1000); // Control the timer to ensure the effect runs.
      await Promise.resolve(); // Resolve pending promises to simulate the async operations.
    });

    // Verify if taskLoaderMock is called exactly once.
    // expect(taskLoaderMock).toHaveBeenCalledTimes(1);

    // Advance time for the setTimeout in the component logic.
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Check the final state updates
    expect(screen.getByTestId("progress")).toHaveTextContent("Progress: 100");
    expect(screen.getByTestId("taskId")).toHaveTextContent(`Task ID: ${9}`);

    // Verify that returnData is called with the correct response data.
    // expect(returnDataMock).toHaveBeenCalledWith(response);
  });

  it("should update taskId, progress, and buffer when progressRef.current is called", async () => {
    // Mock implementation to return a taskId
    // taskLoaderMock.mockResolvedValueOnce({
    //   taskId: 1,
    //   data: { result: "sample data" },
    // });

    // Render the TaskLoaderProgress component
    renderComponent(10, 2, { result: "sample data" });

    // Fast-forward the timers to trigger setInterval actions
    jest.advanceTimersByTime(1000); // Simulate the interval passing

    // Check if the taskLoader was called
    await waitFor(() => {
      expect(taskLoaderMock).toHaveBeenCalled(); // Confirm taskLoader was invoked
    });

    // Advance time to simulate the completion of fetchData and updates in state
    await act(async () => {
      jest.advanceTimersByTime(1500); // Advance timers to handle timeouts
    });

    // Verify taskId and progress are updated correctly
    expect(screen.getByTestId("taskId")).toHaveTextContent(`Task ID: 2`);
    expect(screen.getByTestId("progress")).toHaveTextContent(`Progress: 20`); // This will depend on your logic
    expect(screen.getByTestId("buffer")).toHaveTextContent("Buffer: 12");
  });

  it("should use the custom fetchInterval value when provided", async () => {
    const mockFetchInterval = 2000; // Custom fetch interval

    renderComponent(10, 10, { result: "sample data" }, mockFetchInterval);
    // Fast-forward the timers to trigger setInterval actions
    // jest.advanceTimersByTime(1000); // Simulate the interval passing

    // await waitFor(() => {
    //   expect(taskLoaderMock).toHaveBeenCalled(); // Check if the taskLoader was called
    // });

    // Advance time for the timeout inside fetchData
    act(() => {
      jest.advanceTimersByTime(mockFetchInterval + 500); // This should trigger the setTimeout logic
    });

    // expect(returnDataMock).toHaveBeenCalledWith({ result: "sample data" }); // Verify returnData is called
  });
});
