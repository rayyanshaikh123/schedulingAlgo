import React, {useEffect } from "react";
import { motion } from "framer-motion";

export default function SRJNProcessTable({ results, isOpen, onComplete, chartRef }) {

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
  