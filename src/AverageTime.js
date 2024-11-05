import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";


export default function AverageTime({ results, complete, chartRef }) {
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