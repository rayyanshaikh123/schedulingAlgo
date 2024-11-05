import React, { useState } from "react";


export default function Form({
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