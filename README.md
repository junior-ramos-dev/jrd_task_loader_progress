# TaskLoaderProgress React Component

The `TaskLoaderProgress` component provides a mechanism to perform recurrent requests to an API endpoint and update the execution progress. It utilizes React's context to share progress information across its children.

## Props

### `TaskLoaderProgressProps<T, R>`
- **`taskLoader: TaskLoaderFunction<T>`**: 
  - A function defined to retrieve the data. It takes arguments as input and returns a promise with a `TaskResponse`.
  
- **`returnData: ReturnDataFunction`**: 
  - A function that returns the response data to the parent component once the task processing is complete.
  
- **`request: R | undefined`**: 
  - The request arguments, which can be any type based on the specific implementation. It may also be `undefined`.

- **`totalTasks: number`**: 
  - The total number of tasks that are expected to be executed by the request.

- **`fetchInterval: number` (default: 1000)**: 
  - The interval in milliseconds to execute the request function. If not specified, defaults to 1000 ms.

- **`children?: ReactNode`**: 
  - The child components that will be wrapped inside the `TaskLoaderProgress` context provider.

## Context
### `TaskLoaderProgressContext`
- Provides the current progress and state of the tasks being executed.

- **`progress: number`**: 
  - The current progress percentage (0 to 100).

- **`buffer: number`**: 
  - The buffer percentage indicating how much data is pending.

- **`taskId: number`**: 
  - The ID of the current task being executed.

## Example Usage

```typescript
import React from 'react';
import { TaskLoaderProgress } from './path/to/TaskLoaderProgress';

const taskLoaderFunction = async (request) => {
  // Implementation of task loading logic
};

const returnDataFunction = (data) => {
  console.log('Data returned:', data);
};

// Usage within a component
const MyComponent = () => (
  <TaskLoaderProgress
    taskLoader={taskLoaderFunction}
    returnData={returnDataFunction}
    request={{ key1: 'value1' }}
    totalTasks={10}
    fetchInterval={2000}
  >
    {/* Child components can access context values */}
    <RingProgressBar />
  </TaskLoaderProgress>
);

{/* Child component*/}
const RingProgressBar = () => {
  const theme = useTheme();
  const { progress, buffer, taskId } = useContext(TaskLoaderProgressContext);

  const message = TASK_MSG_MAP[taskId];

  return (
      <Stack alignItems="center" spacing={2} sx={{ width: "30%" }}>
        <RingLoader color={theme.palette.primary.main} />
        <Typography variant="subtitle2">{`${message}: ${progress}%`}</Typography>
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            variant="buffer"
            value={progress}
            valueBuffer={buffer}
          />
        </Box>
      </Stack>
  );
};
```

## Internal Logic

- **Effect Hook**: 
  - The component uses the `useEffect` hook to set up an interval for fetching data and updating progress.

- **Progress and Buffer Management**: 
  - The component maintains state for `progress`, `buffer`, and `taskId`, updating them based on the response from the `taskLoader` function.

- **Final Task Handling**: 
  - When all tasks are completed, the progress is set to 100, and the `returnData` function is called with the final result after a short delay.

## Notes
- The component is designed to be flexible and reusable across different parts of an application where task loading and progress tracking are needed.

---
<br/>

### TaskLoaderProgress <T,R> Properties

|  |                   |                                                                                     |
|----------------------------------|-------------------|-------------------------------------------------------------------------------------|
| **Property**                     | **Type**          | **Description**                                                                     |
| `taskLoader`                    | `TaskLoaderFunction<T>` | Request function defined to retrieve the data.                                     |
| `returnData`                    | `ReturnDataFunction` | Function to return the response data to the parent component.                     |
| `request`                       | `R or undefined`    | Type used as request arguments; can be of type `R` or `undefined`.                |
| `totalTasks`                    | `number`          | Total number of tasks to be executed by the request.                               |
| `fetchInterval`                 | `number` (optional) | The interval in milliseconds to execute the request function (defaults to 1000 ms). |
| `children`                      | `ReactNode`  | Component children that can be rendered within this component.                      |
