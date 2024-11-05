import "./App.css";
import React, { useState, useEffect, useRef } from "react";
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
  const [complete, setComplete] = useState(false);
  const chartRef = useRef(null);

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
      }, results.ganttChart.length * 900);
    }
  }, [showGantt, results.ganttChart]);

  return (
    <>
      {loading ? (
        <Loader fadeOut={fadeOut} />
      ) : (
        <div>
          <section className="my-4">
            <center>
              <h1 className="display-4 header">
                SCHEDULING ALGORITHM SIMULATOR🧮
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
              chartRef={chartRef}
              data={data}
              stratergy={stratergy}
              isOpen={isOpen}
              onComplete={() => setShowGantt(true)}
            />
          </div>

          {/* Gantt Chart Section with conditional rendering */}
          {showGantt && (
            <div className="container-lg my-4">
              <GanttChart
                chartRef={chartRef}
                isOpen={isOpen}
                results={results}
                onComplete={() => setShowProcessTable(true)}
              />
            </div>
          )}

          {/* Conditional rendering for Process Table and Average Time */}
          {stratergy === 5
            ? showProcessTableSRJN && (
                <div className="container-lg my-4 " style={{marginBottom: '50px'}}>
                  <SRJNProcessTable
                    chartRef={chartRef}
                    results={results}
                    complete={complete}
                    onComplete={setComplete}
                    isOpen={showProcessTableSRJN}
                  />

                  <AverageTime
                    results={results}
                    chartRef={chartRef}
                    complete={complete}
                   

                  />
                </div>
              )
            : showProcessTable && (
                <div className="container-lg my-4" >
                  <ProcessTable
                    chartRef={chartRef}
                    results={results}
                    isOpen={showProcessTable}
                    complete={complete}
                    onComplete={setComplete}
                  />
                  <AverageTime
                    results={results}
                    chartRef={chartRef}
                    complete={complete}
                    
                  />
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
    <div className="container py-4">
      <form onSubmit={handleClick} className="p-4 rounded form">
        <h2
          className="head mb-4"
          style={{ textAlign: "center", color: "#493628" }}
        >
          Enter Details
        </h2>

        <div className="mb-3">
          <label htmlFor="ty" className="form-label">
            Enter Type:
          </label>
          <select
            name="strategies"
            id="ty"
            className="form-select"
            onChange={(e) => {
              setStratergy(Number(e.target.value));
              onRefresh();
            }}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #D6C0B3",
            }}
          >
            <option value="1">First Come First Serve</option>
            <option value="2">Shortest Job First</option>
            <option value="3">Priority</option>
            <option value="4">Round Robin</option>
            <option value="5">Preemptive SRJN</option>
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
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #D6C0B3",
            }}
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
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #D6C0B3",
              }}
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
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #D6C0B3",
              }}
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
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #D6C0B3",
                }}
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
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #D6C0B3",
                }}
              />
            </div>
          ))}
        <p>
          <b>Note:</b> To refresh the calculator change the stratergy...😁{" "}
        </p>
        <button
          type="submit"
          className="btn btn-primary"
          style={{
            padding: "10px 20px",
            borderRadius: "5px",
            border: "none",
            fontWeight: "bold",
            width: "100%",
            marginTop: "10px",
            transition: "background-color 0.3s",
          }}
        >
          Calculate
        </button>
      </form>
    </div>
  );
}

function Table({ data, isOpen, onComplete, strategy, chartRef }) {
  // Use effect to scroll into view when isOpen is true
  useEffect(() => {
    if (isOpen && chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chartRef, isOpen]);

  return (
    <>
      {isOpen && (
        <>
          <h4 className="head " style={{ textAlign: "center" }}>
            Process Table
          </h4>
          <div style={{ overflowX: "auto", marginBottom: '30px'  }} ref={chartRef}>
            {/* Allows horizontal scroll for small screens */}
            <table
              className="table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                margin: "20px 0",
                fontSize: "16px",
                textAlign: "center",
                backgroundColor: "#fdfdfd",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr
                  style={{
                    // Header text color
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontWeight: "bold",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 15px",
                      backgroundColor: "#493628", // Table header background color
                      color: "#E4E0E1",
                    }}
                  >
                    Process
                  </th>
                  <th
                    style={{
                      padding: "12px 15px",
                      backgroundColor: "#493628", // Table header background color
                      color: "#E4E0E1",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: "bold",
                    }}
                  >
                    Burst Time
                  </th>
                  {strategy === 5 && (
                    <th
                      style={{
                        padding: "12px 15px",
                        backgroundColor: "#493628", // Table header background color
                        color: "#E4E0E1",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        fontWeight: "bold",
                      }}
                    >
                      Arrival Time
                    </th>
                  )}
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
                        transition={{ duration: 0.8, delay: i * 0.5 }}
                        onAnimationComplete={() => {
                          if (
                            i === item.process.length - 1 &&
                            index === data.length - 1
                          ) {
                            onComplete();
                          }
                        }}
                        style={{
                          backgroundColor: i % 2 === 0 ? "#f2f2f2" : "#E4E0E1", // Alternating row colors
                        }}
                      >
                        <td style={{ padding: "12px 15px" }}>P{process}</td>
                        <td style={{ padding: "12px 15px" }}>
                          {item.burst[i]}
                        </td>
                        {strategy === 5 && (
                          <td style={{ padding: "12px 15px" }}>
                            {item.arrival[i]}
                          </td>
                        )}
                      </motion.tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

function GanttChart({ results, onComplete, chartRef, isOpen }) {
  const [ranColor, setColors] = useState([]);

  // Generate random colors only once, when the component mounts
  useEffect(() => {
    const generatedColors = results.ganttChart.map(() => {
      const n1 = Math.ceil(Math.random() * 255);
      const n2 = Math.ceil(Math.random() * 255);
      const n3 = Math.ceil(Math.random() * 255);
      return `rgb(${n1},${n2},${n3})`;
    });
    setColors(generatedColors);
  }, [results.ganttChart]);

  useEffect(() => {
    if (isOpen && chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chartRef, isOpen]);

  return (
    <>
      {isOpen && (
        <>
          <h4
            className="mb-4 head"
            style={{ fontSize: "24px", textAlign: "center" }}
          >
            Gantt Chart
          </h4>
          <div style={{ overflowX: "auto", marginBottom: '30px'  }} ref={chartRef}>
            {" "}
            {/* Allows horizontal scroll for small screens */}
            <table
              className="table table-bordered"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <tbody>
                <tr>
                  {results.ganttChart.map((item, index) => (
                    <motion.td
                      key={index}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.8 }}
                      onAnimationComplete={() => {
                        if (index === results.ganttChart.length - 1) {
                          setTimeout(onComplete, 10000);
                        }
                      }}
                      style={{
                        textAlign: "center",
                        padding: "16px",
                        position: "relative",

                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        fontSize: "18px",
                        fontWeight: "500",
                        backgroundColor: ranColor[index],
                      }}
                    >
                      <sup
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "bold",
                          marginBottom: "-2px",
                        }}
                      >
                        {item.end - item.start}
                      </sup>
                      <p
                        style={{
                          margin: "10px 0 0",
                          fontSize: "20px",
                          fontWeight: "bold",
                        }}
                      >
                        P{item.process}
                      </p>
                      <div
                        style={{
                          position: "absolute",
                          bottom: "5px",
                          left: "5px",
                          fontSize: "14px",
                        }}
                      >
                        <sub>{item.start}</sub>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          bottom: "5px",
                          right: "5px",
                          fontSize: "14px",
                        }}
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
          </div>
        </>
      )}
    </>
  );
}

function ProcessTable({ results, isOpen, onComplete, chartRef }) {

  useEffect(() => {
    if (isOpen && chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chartRef, isOpen]);
  try {
    // Keep track of processes that have already been displayed
    const displayedProcesses = new Set();

    return (
      <>
        {isOpen && (
          <>
            <h4
              className=" head"
              style={{
                fontSize: "24px",
                textAlign: "center",
              }}
            >
              Process Table
            </h4>
            <div style={{ overflowX: "auto", marginBottom: '30px' }} ref={chartRef}>
              {" "}
              {/* Allows horizontal scroll for small screens */}
              <table
                className="table"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  margin: "20px 0",
                  fontSize: "16px",
                  textAlign: "center",
                  backgroundColor: "#fdfdfd",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#493628",
                      color: "#E4E0E1",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: "bold",
                    }}
                  >
                    <th style={headerStyle}>Process</th>
                    <th style={headerStyle}>Burst Time</th>
                    <th style={headerStyle}>Waiting Time</th>
                    <th style={headerStyle}>Turnaround Time</th>
                  </tr>
                </thead>
                <tbody>
                  {results.ganttChart
                    .filter((item, index) => {
                      // Filter out NaN waiting time and duplicate processes
                      const isWaitingTimeValid = !isNaN(
                        results.waitingTime[index]
                      );
                      const isDuplicate = displayedProcesses.has(item.process);

                      if (isWaitingTimeValid && !isDuplicate) {
                        displayedProcesses.add(item.process);
                        return true;
                      }
                      return false;
                    })
                    .map((item, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: index * 0.8 }}
                        onAnimationComplete={() => {
                          if (index === results.ganttChart.length - 1) {
                            onComplete(true);
                          }
                        }}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#f2f2f2" : "#E4E0E1",
                        }}
                      >
                        <td style={cellStyle}>P{item.process}</td>
                        <td style={cellStyle}>{results.burst[index]}</td>
                        <td style={cellStyle}>
                          {Math.abs(results.waitingTime[index])}
                        </td>
                        <td style={cellStyle}>
                          {results.turnaroundTime[index]}
                        </td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </>
    );
  } catch (e) {
    console.log("Chill he sab!");
  }
}

function SRJNProcessTable({ results, isOpen, onComplete, chartRef }) {

  useEffect(() => {
    if (isOpen && chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chartRef, isOpen]);
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
  try {
    return (
      <>
        {isOpen && (
          <>
            <h4
              className=" head"
              style={{
                fontSize: "24px",
                textAlign: "center",
              }}
            >
              Process Table
            </h4>
            <div style={{ overflowX: "auto", marginBottom: '30px'  }} ref={chartRef}>
              {" "}
              {/* Allows horizontal scroll for small screens */}
              <table
                className="table"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  margin: "20px 0",
                  fontSize: "16px",
                  textAlign: "center",
                  backgroundColor: "#fdfdfd",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <thead>
                  <tr>
                    <th style={headerStyle}>Process</th>
                    <th style={headerStyle}>Arrival Time</th>
                    <th style={headerStyle}>Burst Time</th>
                    <th style={headerStyle}>Waiting Time</th>
                    <th style={headerStyle}>Turnaround Time</th>
                    <th style={headerStyle}>Completion Time</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedResults.map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 1, delay: index * 0.8 }}
                      onAnimationComplete={() => {
                        if (index === aggregatedResults.length - 1) {
                          onComplete(true);
                        }
                      }}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#f2f2f2" : "#E4E0E1", // Alternating row colors
                      }}
                    >
                      <td style={cellStyle}>P{item.process}</td>
                      <td style={cellStyle}>{item.arrivalTime}</td>
                      <td style={cellStyle}>{item.burstTime}</td>
                      <td style={cellStyle}>{item.waitingTime}</td>
                      <td style={cellStyle}>{item.turnaroundTime}</td>
                      <td style={cellStyle}>{item.completionTime}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </>
    );
  } catch (e) {
    console.log("Chill he sab");
  }
}

function AverageTime({ results, complete, chartRef }) {
  let averageWaitingTime;
  let averageTurnaroundTime;
  const [isOpen, setIsOpen] = useState(false);
  if (complete) {
    setTimeout(() => {
      setIsOpen(true);
    }, 2000);
  }
  useEffect(() => {
    if (isOpen && chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chartRef, isOpen]);
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
  if (isOpen) {
    return (
      <>
        <div className="average-time-container" style={{marginBottom:'30px' }} ref={chartRef}>
          <h4
            className="mb-4 head"
            style={{ textAlign: "center", color: "#493628" }}
          >
            Average Times
          </h4>
          <motion.div
            className="average-time p-4 rounded"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
            style={{
              backgroundColor: "#493628",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              borderRadius: "10px",
              color: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "18px",
              }}
            >
              <span>AVG WAITING TIME</span>
              <span
                className="head"
                style={{ fontWeight: "bold", color: "#fff" }}
              >
                {averageWaitingTime.toFixed(2)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "18px",
                marginTop: "10px",
              }}
            >
              <span>AVG TURNAROUND TIME</span>
              <span
                className="head"
                style={{ fontWeight: "bold", color: "#fff" }}
              >
                {averageTurnaroundTime.toFixed(2)}
              </span>
            </div>
          </motion.div>
        </div>
      </>
    );
  }
}

function Loader({ fadeOut }) {
  return (
    <center className={`content ${fadeOut ? "fade-out" : "fade-in"}`}>
      <h1 className="App-header">
        SCHEDULING ALGORITHM CALCULATOR <br />
        <br />
        <l-grid size="70" speed="1.5" color="white"></l-grid>
      </h1>
    </center>
  );
}
const headerStyle = {
  padding: "12px 15px",
  backgroundColor: "#493628",
  color: "#E4E0E1",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontWeight: "bold",
};

const cellStyle = {
  padding: "12px 15px",
};
