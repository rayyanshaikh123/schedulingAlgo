import "./App.css";
import React, { useState, useEffect, useRef } from "react";

import Form from "./Form";
import AverageTime from "./AverageTime";
import GanttChart from "./GanttChart";
import ProcessTable from "./ProcessTable";
import Table from "./Table";
import Loader from "./Loader";

export default function App() {
  const [data, setData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState({});
  const [showGantt, setShowGantt] = useState(false);
  const [showProcessTable, setShowProcessTable] = useState(false);

  const [stratergy, setStratergy] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [complete, setComplete] = useState(false);
  const chartRef = useRef(null);

  const applyResult = (newResult) => {
    setResults(newResult);
    setShowGantt(false);
    setShowProcessTable(false);
    setComplete(false);
  };

  const buildResult = (processes, ganttChart) => {
    const n = processes.length;
    const process = Array(n).fill(0);
    const arrival = Array(n).fill(0);
    const burst = Array(n).fill(0);
    const priority = Array(n).fill(0);
    const waitingTime = Array(n).fill(0);
    const turnaroundTime = Array(n).fill(0);
    const completionTime = Array(n).fill(0);

    processes.forEach((proc) => {
      const idx = proc.process - 1;
      process[idx] = proc.process;
      arrival[idx] = proc.arrival;
      burst[idx] = proc.burst;
      priority[idx] = proc.priority;
      completionTime[idx] = proc.completionTime;
      turnaroundTime[idx] = completionTime[idx] - arrival[idx];
      waitingTime[idx] = turnaroundTime[idx] - burst[idx];
    });

    return {
      process,
      arrival,
      burst,
      priority,
      waitingTime,
      turnaroundTime,
      completionTime,
      ganttChart,
    };
  };

  const mapInput = (inputData) =>
    inputData.process.map((process, index) => ({
      process,
      burst: Number(inputData.burst[index] ?? 0),
      arrival: Number(inputData.arrival[index] ?? 0),
      priority: Number(inputData.priority[index] ?? 0),
      completionTime: 0,
    }));

  function handleData(item) {
    setData([item]);
  }

  function handleOpen(open) {
    setIsOpen(open);
  }

  const calculateFCFS = (inputData) => {
    const processes = mapInput(inputData).sort(
      (a, b) => a.arrival - b.arrival || a.process - b.process
    );
    const ganttChart = [];
    let currentTime = 0;

    processes.forEach((proc) => {
      const start = Math.max(currentTime, proc.arrival);
      const end = start + proc.burst;
      proc.completionTime = end;
      currentTime = end;
      ganttChart.push({ process: proc.process, start, end });
    });

    applyResult(buildResult(processes, ganttChart));
  };

  const calculateSJF = (inputData) => {
    const processes = mapInput(inputData).map((proc) => ({ ...proc, done: false }));
    const ganttChart = [];
    let completed = 0;
    let currentTime = Math.min(...processes.map((proc) => proc.arrival));

    while (completed < processes.length) {
      const timeCursor = currentTime;
      const ready = processes.filter((proc) => !proc.done && proc.arrival <= timeCursor);

      if (!ready.length) {
        currentTime = Math.min(
          ...processes.filter((proc) => !proc.done).map((proc) => proc.arrival)
        );
        continue;
      }

      ready.sort(
        (a, b) => a.burst - b.burst || a.arrival - b.arrival || a.process - b.process
      );

      const selected = ready[0];
      const start = currentTime;
      const end = start + selected.burst;

      selected.completionTime = end;
      selected.done = true;
      completed += 1;
      currentTime = end;

      ganttChart.push({ process: selected.process, start, end });
    }

    applyResult(buildResult(processes, ganttChart));
  };

  const calculatePriority = (inputData) => {
    const processes = mapInput(inputData).map((proc) => ({ ...proc, done: false }));
    const ganttChart = [];
    let completed = 0;
    let currentTime = Math.min(...processes.map((proc) => proc.arrival));

    while (completed < processes.length) {
      const timeCursor = currentTime;
      const ready = processes.filter((proc) => !proc.done && proc.arrival <= timeCursor);

      if (!ready.length) {
        currentTime = Math.min(
          ...processes.filter((proc) => !proc.done).map((proc) => proc.arrival)
        );
        continue;
      }

      ready.sort(
        (a, b) =>
          a.priority - b.priority || a.arrival - b.arrival || a.process - b.process
      );

      const selected = ready[0];
      const start = currentTime;
      const end = start + selected.burst;

      selected.completionTime = end;
      selected.done = true;
      completed += 1;
      currentTime = end;

      ganttChart.push({ process: selected.process, start, end });
    }

    applyResult(buildResult(processes, ganttChart));
  };

  const calculateRoundRobin = (inputData, quantum) => {
    const q = Math.max(1, Number(quantum) || 1);
    const processes = mapInput(inputData).map((proc) => ({ ...proc, remaining: proc.burst }));

    const byArrival = [...processes].sort(
      (a, b) => a.arrival - b.arrival || a.process - b.process
    );
    const ganttChart = [];
    const queue = [];

    let currentTime = byArrival[0]?.arrival ?? 0;
    let nextArrival = 0;
    let completed = 0;

    while (completed < processes.length) {
      while (nextArrival < byArrival.length && byArrival[nextArrival].arrival <= currentTime) {
        queue.push(byArrival[nextArrival]);
        nextArrival += 1;
      }

      if (!queue.length) {
        currentTime = byArrival[nextArrival].arrival;
        continue;
      }

      const current = queue.shift();
      const start = currentTime;
      const slice = Math.min(q, current.remaining);

      current.remaining -= slice;
      currentTime += slice;
      ganttChart.push({ process: current.process, start, end: currentTime });

      while (nextArrival < byArrival.length && byArrival[nextArrival].arrival <= currentTime) {
        queue.push(byArrival[nextArrival]);
        nextArrival += 1;
      }

      if (current.remaining > 0) {
        queue.push(current);
      } else {
        current.completionTime = currentTime;
        completed += 1;
      }
    }

    applyResult(buildResult(processes, ganttChart));
  };

  const calculatePreemptiveSRTN = (inputData) => {
    const processes = mapInput(inputData).map((proc) => ({ ...proc, remaining: proc.burst }));
    const ganttChart = [];

    let completed = 0;
    let currentTime = Math.min(...processes.map((proc) => proc.arrival));

    while (completed < processes.length) {
      const timeCursor = currentTime;
      const ready = processes.filter(
        (proc) => proc.arrival <= timeCursor && proc.remaining > 0
      );

      if (!ready.length) {
        currentTime += 1;
        continue;
      }

      ready.sort(
        (a, b) =>
          a.remaining - b.remaining || a.arrival - b.arrival || a.process - b.process
      );

      const running = ready[0];
      const last = ganttChart[ganttChart.length - 1];

      if (last && last.process === running.process) {
        last.end += 1;
      } else {
        ganttChart.push({ process: running.process, start: currentTime, end: currentTime + 1 });
      }

      running.remaining -= 1;
      currentTime += 1;

      if (running.remaining === 0) {
        running.completionTime = currentTime;
        completed += 1;
      }
    }

    applyResult(buildResult(processes, ganttChart));
  };

  function refresh() {
    setData([]);
    setIsOpen(false);
    setResults({});
    setShowGantt(false);
    setShowProcessTable(false);
    setComplete(false);
  }

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1600);

    const loadTimer = setTimeout(() => {
      setLoading(false);
    }, 2300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(loadTimer);
    };
  }, []);

  useEffect(() => {
    if (results.ganttChart?.length) {
      setShowGantt(true);
    }
  }, [results]);

  useEffect(() => {
    if (showGantt && results.ganttChart?.length) {
      const timer = setTimeout(() => {
        setShowProcessTable(true);
      }, Math.max(1200, results.ganttChart.length * 450));

      return () => clearTimeout(timer);
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
              <h1 className="display-4 header">SCHEDULING ALGORITHM SIMULATOR</h1>
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
              onCalculatePreemptiveSRTN={calculatePreemptiveSRTN}
              stratergy={stratergy}
              setStratergy={setStratergy}
              onRefresh={refresh}
            />
          </div>

          <div className="container-lg my-4">
            <Table
              chartRef={chartRef}
              data={data}
              strategy={stratergy}
              isOpen={isOpen}
              onComplete={() => setShowGantt(true)}
            />
          </div>

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

          {showProcessTable && (
            <div className="container-lg my-4" style={{ marginBottom: "50px" }}>
              <ProcessTable
                chartRef={chartRef}
                results={results}
                isOpen={showProcessTable}
                complete={complete}
                onComplete={setComplete}
              />
              <AverageTime results={results} chartRef={chartRef} complete={complete} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
