import React, { useState } from "react";


export default function Form({
    onData,
    onOpen,
    onCalculateFCFS,
    onCalculateSJF,
    onCalculatePriority,
    onCalculateRoundRobin,
  onCalculatePreemptiveSRTN,
    stratergy,
    setStratergy,
    onRefresh,
  }) {
    const [processCount, setProcessCount] = useState(3);
    const [burst, setBurst] = useState([]);
    const [arrival, setArrival] = useState([]);
    const [priority, setPriority] = useState([]);
    const [bulkBurst, setBulkBurst] = useState("");
    const [bulkArrival, setBulkArrival] = useState("");
    const [bulkPriority, setBulkPriority] = useState("");
  
    const [quantum, setQuantum] = useState(null);

    const resizeToCount = (nextCount) => {
      setBurst((prev) => prev.slice(0, nextCount));
      setArrival((prev) => prev.slice(0, nextCount));
      setPriority((prev) => prev.slice(0, nextCount));
    };

    const parseCsvNumbers = (value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map(Number);

    const applyBulkInput = () => {
      const burstValues = parseCsvNumbers(bulkBurst);
      const arrivalValues = parseCsvNumbers(bulkArrival);
      const priorityValues = stratergy === 3 ? parseCsvNumbers(bulkPriority) : [];

      if (!burstValues.length) {
        return;
      }

      const nextCount = Math.max(
        burstValues.length,
        arrivalValues.length,
        priorityValues.length,
        processCount
      );

      setProcessCount(nextCount);
      setBurst((prev) =>
        Array.from({ length: nextCount }, (_, i) => burstValues[i] ?? prev[i] ?? "")
      );
      setArrival((prev) =>
        Array.from({ length: nextCount }, (_, i) => arrivalValues[i] ?? prev[i] ?? 0)
      );
      setPriority((prev) =>
        Array.from({ length: nextCount }, (_, i) => priorityValues[i] ?? prev[i] ?? 1)
      );
    };

    function handleClick(e) {
      e.preventDefault();

      if (!processCount || processCount < 1) {
        return;
      }

      const newBurst = Array.from({ length: processCount }, (_, i) =>
        Number(burst[i] ?? 0)
      );
      const newArrival = Array.from({ length: processCount }, (_, i) =>
        Number(arrival[i] ?? 0)
      );
      const newPriority = Array.from({ length: processCount }, (_, i) =>
        Number(priority[i] ?? 1)
      );

      const hasInvalidBurst = newBurst.some((value) => Number.isNaN(value) || value <= 0);
      const hasInvalidArrival = newArrival.some((value) => Number.isNaN(value) || value < 0);
      const hasInvalidPriority =
        stratergy === 3 &&
        newPriority.some((value) => Number.isNaN(value) || value <= 0);

      if (hasInvalidBurst || hasInvalidArrival || hasInvalidPriority) {
        return;
      }
  
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
          onCalculatePreemptiveSRTN(newData);
          break;
        default:
          onCalculateFCFS(newData);
          break;
      }
  
      setBurst([]);
      setArrival([]);
      setPriority([]);
      setBulkBurst("");
      setBulkArrival("");
      setBulkPriority("");
      setQuantum(null);
  
      onOpen(true);
    }
  
    return (
      <div className="container py-4">
        <form onSubmit={handleClick} className="p-4 rounded form">
          <h2 className="head mb-4 text-center">
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
              defaultValue={stratergy}
            >
              <option value="1">First Come First Serve</option>
              <option value="2">Shortest Job First</option>
              <option value="3">Priority</option>
              <option value="4">Round Robin</option>
              <option value="5">Preemptive SRTN</option>
            </select>
          </div>
  
          <div className="mb-3">
            <label htmlFor="pr" className="form-label">
              Number of Processes:
            </label>
            <div className="count-controls">
              <button
                type="button"
                className="count-btn"
                onClick={() => {
                  const next = Math.max(1, processCount - 1);
                  setProcessCount(next);
                  resizeToCount(next);
                }}
              >
                -
              </button>
              <input
                id="pr"
                type="number"
                min={1}
                value={processCount}
                onChange={(e) => {
                  const next = Math.max(1, Number(e.target.value) || 1);
                  setProcessCount(next);
                  resizeToCount(next);
                }}
                className="form-control count-input"
                required
              />
              <button
                type="button"
                className="count-btn"
                onClick={() => setProcessCount((prev) => prev + 1)}
              >
                +
              </button>
            </div>
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
  
          <div className="bulk-input-card mb-3">
            <label className="form-label">Quick Fill (comma separated)</label>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Burst: 5,3,8"
              value={bulkBurst}
              onChange={(e) => setBulkBurst(e.target.value)}
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Arrival: 0,1,2"
              value={bulkArrival}
              onChange={(e) => setBulkArrival(e.target.value)}
            />
            {stratergy === 3 && (
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Priority: 2,1,3"
                value={bulkPriority}
                onChange={(e) => setBulkPriority(e.target.value)}
              />
            )}
            <button type="button" className="btn btn-outline-primary w-100" onClick={applyBulkInput}>
              Apply Quick Fill
            </button>
          </div>

          <div
            className={`process-editor mb-3 ${stratergy === 3 ? "priority-mode" : ""}`}
          >
            <div className="process-editor-header">
              <span>Process</span>
              <span>Burst</span>
              <span>Arrival</span>
              {stratergy === 3 && <span>Priority</span>}
            </div>
            {Array.from({ length: processCount }).map((_, i) => (
              <div className="process-row" key={`row-${i}`}>
                <span className="process-label">P{i + 1}</span>
                <input
                  type="number"
                  value={burst[i] ?? ""}
                  onChange={(e) => {
                    const newBurst = [...burst];
                    newBurst[i] = e.target.value;
                    setBurst(newBurst);
                  }}
                  className="form-control"
                  required
                  min={1}
                />
                <input
                  type="number"
                  value={arrival[i] ?? 0}
                  onChange={(e) => {
                    const newArrival = [...arrival];
                    newArrival[i] = e.target.value;
                    setArrival(newArrival);
                  }}
                  className="form-control"
                  required
                  min={0}
                />
                {stratergy === 3 && (
                  <input
                    type="number"
                    value={priority[i] ?? ""}
                    onChange={(e) => {
                      const newPriority = [...priority];
                      newPriority[i] = e.target.value;
                      setPriority(newPriority);
                    }}
                    className="form-control"
                    required
                    min={1}
                  />
                )}
              </div>
            ))}
          </div>

          <p className="note-text">
            <b>Tip:</b> Use Quick Fill for fast entry, then tweak any row manually.
          </p>
          <button type="submit" className="btn btn-primary w-100 mt-2 form-submit-btn">
            Calculate
          </button>
        </form>
      </div>
    );
  }