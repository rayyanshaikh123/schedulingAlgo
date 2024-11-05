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

   
    const processes = data.process.map((process, index) => ({
      process,
      burst: data.burst[index],
    }));


    processes.sort((a, b) => a.burst - b.burst);

   
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

    
    const processes = data.process.map((process, index) => ({
      process,
      burst: data.burst[index],
      priority: data.priority[index],
    }));

   
    processes.sort((a, b) => a.priority - b.priority);

   
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

    let completed = 0; 
    let currentIndex = 0; 

    while (completed < n) {
      const burstLeft = remainingBurst[currentIndex];

      if (burstLeft > 0) {
        let startTime = time; 
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

      currentIndex = (currentIndex + 1) % n; 
    }

    
    for (let i = 0; i < n; i++) {
      let processBursts = ganttChart.filter(
        (g) => g.process === data.process[i]
      );

    
      let completionTime = processBursts[processBursts.length - 1].end;
      turnaroundTime[i] = completionTime - 0; 
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

    let waitingTime = Array(n).fill(0); 
    let turnaroundTime = Array(n).fill(0); 
    let completionTime = Array(n).fill(0); 
    let ganttChart = []; 
    let currentTime = 0; 
    let completed = 0; 
    let shortest = -1; 
    let minBurst = Infinity; 
    let isProcessRunning = false; 

    while (completed !== n) {
     
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

   
      if (!isProcessRunning) {
        currentTime++;
        continue;
      }

      
      remainingBurst[shortest]--;
      minBurst = remainingBurst[shortest]; 
      if (minBurst === 0) minBurst = Infinity;

   
      ganttChart.push({
        process: shortest + 1, 
        start: currentTime,
        end: currentTime + 1,
      });

   
      currentTime++;

      
      if (remainingBurst[shortest] === 0) {
        completed++;
        isProcessRunning = false;
        completionTime[shortest] = currentTime;
        turnaroundTime[shortest] =
          completionTime[shortest] - arrivalTime[shortest];
        waitingTime[shortest] = turnaroundTime[shortest] - burstTime[shortest];
      }
    }

  
    const newResult = {
      burst: burstTime,
      waitingTime,
      turnaroundTime,
      ganttChart,
      completionTime, 
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
    
    const timer = setTimeout(() => {
      setLoading(false); 
    }, 4000);
    const fadeInTimer = setTimeout(() => {
      setFadeOut(true); 
    }, 3100); 

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeInTimer);
    }; 
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






