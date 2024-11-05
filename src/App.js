import "./App.css";
import React, { useState, useEffect, useRef } from "react";

import Form from "./Form";
import AverageTime from "./AverageTime";
import GanttChart from "./GanttChart";
import ProcessTable from "./ProcessTable";
import SRJNProcessTable from "./SRJNProcessTable";
import Table from "./Table";
import Loader from "./Loader";

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






