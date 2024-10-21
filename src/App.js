import "./App.css";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function App() {
  const [data, setData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState({});
  const [showGantt, setShowGantt] = useState(false);
  const [showProcessTable, setShowProcessTable] = useState(false);
  const [showProcessTableSRJN, setShowProcessTableSRJN] = useState(false);
  const [stratergy, setStratergy] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  function handleData(date) {
    setData((data) => [...data, date]);
  }
  function handleOpen(oen) {
    setIsOpen(oen);
  }

  const calculateFCFS = (data) => {
    const n = data.process.length;
    let waitingTime = Array(n).fill(0);
    let turnaroundTime = Array(n).fill(0);
    let startTime = Array(n).fill(0);
    let completionTime = Array(n).fill(0);

    for (let i = 1; i < n; i++) {
      waitingTime[i] = waitingTime[i - 1] + data.burst[i - 1];
    }

    for (let i = 0; i < n; i++) {
      turnaroundTime[i] = waitingTime[i] + data.burst[i];
      startTime[i] = i === 0 ? 0 : completionTime[i - 1];
      completionTime[i] = startTime[i] + data.burst[i];
    }

    const ganttChart = data.process.map((process, index) => ({
      process,
      start: startTime[index],
      end: completionTime[index],
    }));

    const newResult = {
      burst: data.burst,
      waitingTime,
      turnaroundTime,
      ganttChart,
    };

    setResults(newResult);
    setShowGantt(false);
    setShowProcessTable(false);
  };

  const calculateSJF = (data) => {
    const n = data.process.length;
    let waitingTime = Array(n).fill(0);
    let turnaroundTime = Array(n).fill(0);
    let startTime = Array(n).fill(0);
    let completionTime = Array(n).fill(0);

    // Create a copy of the processes array to sort based on burst time
    const processes = data.process.map((process, index) => ({
      process,
      burst: data.burst[index],
    }));

    // Sort the processes based on burst time
    processes.sort((a, b) => a.burst - b.burst);

    // Calculate waiting time and completion time
    for (let i = 1; i < n; i++) {
      waitingTime[i] = waitingTime[i - 1] + processes[i - 1].burst;
    }

    for (let i = 0; i < n; i++) {
      turnaroundTime[i] = waitingTime[i] + processes[i].burst;
      startTime[i] = i === 0 ? 0 : completionTime[i - 1];
      completionTime[i] = startTime[i] + processes[i].burst;
    }

    const ganttChart = processes.map((proc, index) => ({
      process: proc.process,
      start: startTime[index],
      end: completionTime[index],
    }));

    const newResult = {
      burst: processes.map((proc) => proc.burst),
      waitingTime,
      turnaroundTime,
      ganttChart,
    };

    setResults(newResult);
    setShowGantt(false);
    setShowProcessTable(false);
  };

  const calculatePriority = (data) => {
    const n = data.process.length;
    let waitingTime = Array(n).fill(0);
    let turnaroundTime = Array(n).fill(0);
    let startTime = Array(n).fill(0);
    let completionTime = Array(n).fill(0);

    // Create a combined array of processes and their priorities
    const processes = data.process.map((process, index) => ({
      process,
      burst: data.burst[index],
      priority: data.priority[index],
    }));

    // Sort the processes based on priority (lower number = higher priority)
    processes.sort((a, b) => a.priority - b.priority);

    // Calculate waiting time and completion time
    for (let i = 1; i < n; i++) {
      waitingTime[i] = waitingTime[i - 1] + processes[i - 1].burst;
    }

    for (let i = 0; i < n; i++) {
      turnaroundTime[i] = waitingTime[i] + processes[i].burst;
      startTime[i] = i === 0 ? 0 : completionTime[i - 1];
      completionTime[i] = startTime[i] + processes[i].burst;
    }

    const ganttChart = processes.map((proc, index) => ({
      process: proc.process,
      start: startTime[index],
      end: completionTime[index],
    }));

    const newResult = {
      burst: processes.map((proc) => proc.burst),
      waitingTime,
      turnaroundTime,
      ganttChart,
    };

    setResults(newResult);
    setShowGantt(false);
    setShowProcessTable(false);
  };
  const calculateRoundRobin = (data, quantum) => {
    const n = data.process.length;
    let waitingTime = Array(n).fill(0);
    let turnaroundTime = Array(n).fill(0);
    let remainingBurst = [...data.burst];
    let time = 0;
    let ganttChart = [];

    let completed = 0; // Track completed processes
    let currentIndex = 0; // Track which process is currently executing

    while (completed < n) {
      const burstLeft = remainingBurst[currentIndex];

      if (burstLeft > 0) {
        let startTime = time; // The process starts now
        if (burstLeft > quantum) {
          time += quantum;
          remainingBurst[currentIndex] -= quantum;
        } else {
          time += burstLeft;
          remainingBurst[currentIndex] = 0;
          completed++;
        }

        ganttChart.push({
          process: data.process[currentIndex],
          start: startTime,
          end: time,
        });
      }

      currentIndex = (currentIndex + 1) % n; // Round robin: move to the next process
    }

    // Calculate waiting time and turnaround time
    for (let i = 0; i < n; i++) {
      let processBursts = ganttChart.filter(
        (g) => g.process === data.process[i]
      );

      // Completion time of the process is the last end time in the Gantt chart
      let completionTime = processBursts[processBursts.length - 1].end;
      turnaroundTime[i] = completionTime - 0; // Assuming arrival time is 0
      waitingTime[i] = turnaroundTime[i] - data.burst[i];
    }

    const newResult = {
      burst: data.burst,
      waitingTime,
      turnaroundTime,
      ganttChart,
    };

    setResults(newResult);
    setShowGantt(false);
    setShowProcessTable(false);
  };

  const calculatePreemptiveSRJN = (data) => {
    const n = data.process.length;
    const arrivalTime = data.arrival;
    const burstTime = data.burst;
    let remainingBurst = [...burstTime];

    let waitingTime = Array(n).fill(0); // Waiting time for each process
    let turnaroundTime = Array(n).fill(0); // Turnaround time for each process
    let completionTime = Array(n).fill(0); // Completion time for each process
    let ganttChart = []; // Gantt chart to track process execution
    let currentTime = 0; // Current time of the system
    let completed = 0; // Number of completed processes
    let shortest = -1; // Index of the process with the shortest remaining burst time
    let minBurst = Infinity; // Minimum burst time found
    let isProcessRunning = false; // Indicates if any process is running

    while (completed !== n) {
      // Find the process with the shortest remaining burst time that has arrived
      for (let i = 0; i < n; i++) {
        if (
          arrivalTime[i] <= currentTime &&
          remainingBurst[i] < minBurst &&
          remainingBurst[i] > 0
        ) {
          minBurst = remainingBurst[i];
          shortest = i;
          isProcessRunning = true;
        }
      }

      // If no process is running, increment the current time
      if (!isProcessRunning) {
        currentTime++;
        continue;
      }

      // Decrease the remaining burst time of the selected process
      remainingBurst[shortest]--;
      minBurst = remainingBurst[shortest]; // Update the minimum burst
      if (minBurst === 0) minBurst = Infinity; // Reset the minBurst when the current process completes

      // Track the process execution in Gantt chart
      ganttChart.push({
        process: shortest + 1, // P1, P2, etc.
        start: currentTime,
        end: currentTime + 1,
      });

      // Update current time
      currentTime++;

      // If the process has completed
      if (remainingBurst[shortest] === 0) {
        completed++;
        isProcessRunning = false;
        completionTime[shortest] = currentTime;
        turnaroundTime[shortest] =
          completionTime[shortest] - arrivalTime[shortest];
        waitingTime[shortest] = turnaroundTime[shortest] - burstTime[shortest];
      }
    }

    // Final result for Gantt chart, waiting time, and turnaround time
    const newResult = {
      burst: burstTime,
      waitingTime,
      turnaroundTime,
      ganttChart,
      completionTime, // Add this to the result
      arrival: arrivalTime,
    };

    setResults(newResult);
    setShowGantt(false);
    setShowProcessTableSRJN(false);
  };
  function refresh() {
    setData([]);
    setIsOpen(false);
    setResults({});
    setShowGantt(false);
    setShowProcessTable(false);
    setShowProcessTableSRJN(false);
  }
  useEffect(() => {
    // Simulate a loading process (e.g., fetching data)
    const timer = setTimeout(() => {
      setLoading(false); // Change loading state after 3 seconds
     
    }, 4000);
    const fadeInTimer = setTimeout(() => {
      setFadeOut(true); // Start fade out effect after loading completes
    }, 3100); // Adjust timing based on your loading duration
    

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeInTimer);
    }; // Cleanup timers
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      setShowGantt(true);
    }
  }, [results]);

  useEffect(() => {
    if (showGantt && results.ganttChart && results.ganttChart.length > 0) {
      setTimeout(() => {
        setShowProcessTable(true);
        setShowProcessTableSRJN(true);
      }, results.ganttChart.length * 500);
    }
  }, [showGantt, results.ganttChart]);
  return (
    <>
      {loading ? (
        <Loader fadeOut={fadeOut} />
      ) : (
        <div >
          <section className="my-4">
            <center>
              <h1 className="display-4 header">
                SA Calculator
              </h1>
            </center>
          </section>

          <div className="container py-3">
            <Form
              onData={handleData}
              data={data}
              onOpen={handleOpen}
              onCalculateFCFS={calculateFCFS}
              onCalculateSJF={calculateSJF}
              onCalculatePriority={calculatePriority}
              onCalculateRoundRobin={calculateRoundRobin}
              onCalculatePreemptiveSRJN={calculatePreemptiveSRJN}
              stratergy={stratergy}
              setStratergy={setStratergy}
              onRefresh={refresh}
            />
          </div>

          {/* Table Section with container and margin */}
          <div className="container-lg my-4">
            <Table
              data={data}
              stratergy={stratergy}
              isOpen={isOpen}
              onComplete={() => setShowGantt(true)}
            />
          </div>

          {/* Gantt Chart Section with conditional rendering */}
          {showGantt && (
            <div className="container-lg my-7">
              <GanttChart
                results={results}
                onComplete={() => setShowProcessTable(true)}
              />
            </div>
          )}

          {/* Conditional rendering for Process Table and Average Time */}
          {stratergy === 5
            ? showProcessTableSRJN && (
                <div className="container-lg my-7 ">
                  <SRJNProcessTable
                    results={results}
                    isOpen={showProcessTableSRJN}
                  />
                  <AverageTime results={results} />
                </div>
              )
            : showProcessTable && (
                <div className="container-lg my-7">
                  <ProcessTable results={results} isOpen={showProcessTable} />
                  <AverageTime results={results} />
                </div>
              )}
        </div>
      )}
    </>
  );
}

function Form({
  onData,
  onOpen,
  onCalculateFCFS,
  onCalculateSJF,
  onCalculatePriority,
  onCalculateRoundRobin,
  onCalculatePreemptiveSRJN,
  stratergy,
  setStratergy,
  onRefresh,
}) {
  const [processCount, setProcessCount] = useState(null);
  const [burst, setBurst] = useState([]);
  const [arrival, setArrival] = useState([]);
  const [priority, setPriority] = useState([]);

  const [quantum, setQuantum] = useState(null);
  function handleClick(e) {
    e.preventDefault();

    const newBurst = burst.slice(0, processCount);
    const newArrival = arrival.slice(0, processCount);
    const newPriority = priority.slice(0, processCount);
    const processArray = Array.from({ length: processCount }, (_, i) => i + 1);

    const newData = {
      process: processArray,
      burst: newBurst,
      arrival: newArrival,
      priority: newPriority,
    };

    onData(newData);

    switch (stratergy) {
      case 1:
        onCalculateFCFS(newData);
        break;
      case 2:
        onCalculateSJF(newData);
        break;
      case 3:
        onCalculatePriority(newData);
        break;
      case 4:
        onCalculateRoundRobin(newData, quantum);
        break;
      case 5:
        onCalculatePreemptiveSRJN(newData);
        break;
      default:
        onCalculateFCFS(newData);
        break;
    }

    setBurst([]);
    setArrival([]);
    setPriority([]);

    onOpen(true);
  }

  return (
    <div className="container py-4 ">
      <form onSubmit={handleClick} className=" p-4 rounded form">
        <h2 className=" head mb-4">Scheduling Algorithm Input</h2>

        <div className="mb-3">
          <label htmlFor="ty" className="form-label">
            Enter Type:
          </label>
          <select
            name="stratergies"
            id="ty"
            className="form-select"
            onChange={(e) => {
              setStratergy(Number(e.target.value));
              onRefresh();
            }}
          >
            <option value="1">First Come First Serve</option>
            <option value="2">Shortest Job First</option>
            <option value="3">Priority</option>
            <option value="4">Round Robin</option>
            <option value="5">Preemptive</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="pr" className="form-label">
            Enter Number of Processes:
          </label>
          <input
            type="number"
            min={1}
            onChange={(e) => setProcessCount(Number(e.target.value))}
            className="form-control"
            required
          />
        </div>

        {stratergy === 4 && (
          <div className="mb-3">
            <label htmlFor="pr1" className="form-label">
              Enter Quantum:
            </label>
            <input
              type="number"
              value={quantum}
              min={1}
              onChange={(e) => setQuantum(Number(e.target.value))}
              className="form-control"
              required
            />
          </div>
        )}

        {Array.from({ length: processCount }).map((_, i) => (
          <div className="mb-3" key={i}>
            <label className="form-label">
              Burst Time for Process {i + 1}:
            </label>
            <input
              type="number"
              value={burst[i] || ""}
              onChange={(e) => {
                const newBurst = [...burst];
                newBurst[i] = Number(e.target.value);
                setBurst(newBurst);
              }}
              className="form-control"
              required
            />
          </div>
        ))}

        {stratergy === 5 &&
          Array.from({ length: processCount }).map((_, i) => (
            <div className="mb-3" key={i}>
              <label className="form-label">
                Arrival Time for Process {i + 1}:
              </label>
              <input
                type="number"
                onChange={(e) => {
                  const newArrival = [...arrival];
                  newArrival[i] = Number(e.target.value);
                  setArrival(newArrival);
                }}
                className="form-control"
                required
              />
            </div>
          ))}

        {stratergy === 3 &&
          Array.from({ length: processCount }).map((_, i) => (
            <div className="mb-3" key={i}>
              <label className="form-label">
                Priority for Process {i + 1}:
              </label>
              <input
                type="number"
                value={priority[i] || ""}
                onChange={(e) => {
                  const newPriority = [...priority];
                  newPriority[i] = Number(e.target.value);
                  setPriority(newPriority);
                }}
                className="form-control"
                required
              />
            </div>
          ))}

        <button type="submit" className="btn ">
          Calculate
        </button>
      </form>
    </div>
  );
}

function Table({ data, isOpen, onComplete, stratergy }) {
  return (
    <>
      {isOpen && (
        <>
          <h4 className=" head  mb-4">Question</h4>
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th scope="col">Process</th>
                <th scope="col">Burst Time</th>
                {stratergy === 5 && <th scope="col">Arrival Time</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <React.Fragment key={index}>
                  {item.process.map((process, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.2 }}
                      onAnimationComplete={() => {
                        if (
                          i === item.process.length - 1 &&
                          index === data.length - 1
                        ) {
                          onComplete();
                        }
                      }}
                    >
                      <td>P{process}</td>
                      <td>{item.burst[i]}</td>
                      {stratergy === 5 && <td>{item.arrival[i]}</td>}
                    </motion.tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
function GanttChart({ results, onComplete }) {
  return (
    <>
      <h4 className=" mb-4 head">Gantt Chart</h4>
      <table
        className="table table-bordered table-hover"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <tbody>
          <tr>
            {results.ganttChart.map((item, index) => (
              <motion.td
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.5 }}
                onAnimationComplete={() => {
                  if (index === results.ganttChart.length - 1) {
                    setTimeout(onComplete, 10000);
                  }
                }}
                style={{
                  textAlign: "center",
                  padding: "10px",
                  position: "relative",
                  backgroundColor: "#f8f9fa", // Light background color
                  border: "1px solid #dee2e6", // Light border color
                }}
              >
                <sup
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "16px",
                  }}
                >
                  {item.end - item.start}
                </sup>
                <p style={{ margin: "20px 0 0" }}>
                  <b> P{item.process} </b>
                </p>
                <div
                  style={{ position: "absolute", bottom: "5px", left: "5px" }}
                >
                  <sub>{item.start}</sub>
                </div>
                <div
                  style={{ position: "absolute", bottom: "5px", right: "5px" }}
                >
                  <sub>
                    {index === results.ganttChart.length - 1
                      ? item.end
                      : results.ganttChart[index + 1].start}
                  </sub>
                </div>
              </motion.td>
            ))}
          </tr>
        </tbody>
      </table>
    </>
  );
}

function ProcessTable({ results, isOpen }) {
  try {
    return (
      <>
        {isOpen && (
          <>
            <h4 className=" mb-4 head">Process Table</h4>
            <table className="table table-striped table-bordered">
              <thead className="thead-dark">
                <tr>
                  <th>Process</th>
                  <th>Burst Time</th>
                  <th>Waiting Time</th>
                  <th>Turnaround Time</th>
                </tr>
              </thead>
              <tbody>
                {results.ganttChart
                  .filter(
                    (item, index) =>
                      !isNaN(results.waitingTime[index]) &&
                      !isNaN(results.turnaroundTime[index])
                  )
                  .map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.3 }}
                    >
                      <td>P{item.process}</td>
                      <td>{results.burst[index]}</td>
                      <td>{Math.abs(results.waitingTime[index])}</td>
                      <td>{results.turnaroundTime[index]}</td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </>
        )}
      </>
    );
  } catch (e) {
    console.log("Chill he sab!");
  }
}

function SRJNProcessTable({ results, isOpen }) {
  if (!isOpen) return null;

  // Create an array to store the aggregated data for each process
  const aggregatedResults = results.ganttChart.reduce((acc, item) => {
    const processIndex = item.process - 1;

    // If the process doesn't exist in the accumulator, initialize its values
    if (!acc[processIndex]) {
      acc[processIndex] = {
        process: item.process,
        arrivalTime: results.arrival?.[processIndex] ?? "N/A",
        burstTime: results.burst?.[processIndex] ?? "N/A",
        waitingTime: Math.abs(results.waitingTime?.[processIndex]) ?? "N/A",
        turnaroundTime: results.turnaroundTime?.[processIndex] ?? "N/A",
        completionTime: results.completionTime?.[processIndex] ?? "N/A",
      };
    }

    // If we need to aggregate further (e.g., sum burst times if applicable), do it here.
    return acc;
  }, []);

  return (
    <>
      <h4 className=" mb-4 head">Process Table</h4>
      <table className="table table-striped table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Process</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
            <th>Waiting Time</th>
            <th>Turnaround Time</th>
            <th>Completion Time</th>
          </tr>
        </thead>
        <tbody>
          {aggregatedResults.map((item, index) => (
            <motion.tr
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.3 }}
            >
              <td>P{item.process}</td>
              <td>{item.arrivalTime}</td>
              <td>{item.burstTime}</td>
              <td>{item.waitingTime}</td>
              <td>{item.turnaroundTime}</td>
              <td>{item.completionTime}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function AverageTime({ results }) {
  let averageWaitingTime;
  let averageTurnaroundTime;

  try {
    // Calculate average waiting time
    averageWaitingTime =
      results.waitingTime.reduce((acc, time) => acc + time, 0) /
      results.waitingTime.length;

    // Calculate average turnaround time
    averageTurnaroundTime =
      results.turnaroundTime.reduce((acc, time) => acc + time, 0) /
      results.turnaroundTime.length;
  } catch (e) {
    console.log("Chill he bhai!");
  }

  // Check if either average is NaN
  if (isNaN(averageWaitingTime) || isNaN(averageTurnaroundTime)) {
    return null; // Render nothing if any average is NaN
  }

  return (
    <motion.div
      className="average-time"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4 className="mb-4 head">Average Times</h4>
      <p>
        Average Waiting Time:{" "}
        <span className="head"> {averageWaitingTime.toFixed(2)}</span>
      </p>
      <p>
        Average Turnaround Time:{" "}
        <span className="head">{averageTurnaroundTime.toFixed(2)}</span>
      </p>
    </motion.div>
  );
}

function Loader({fadeOut}) {
  return (
    <center className={`content ${fadeOut ? 'fade-out' : 'fade-in'}`}>
      <h1 className="App-header">
        WELCOME TO OUR CALCULATOR <br /><br />
        <l-grid size="70" speed="1.5" color="white"></l-grid>
      </h1>
    </center>
  );
}
