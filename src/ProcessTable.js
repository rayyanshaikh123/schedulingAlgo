import React, {useEffect} from "react";
import { motion } from "framer-motion";


export default function ProcessTable({ results, isOpen, onComplete, chartRef }) {

    useEffect(() => {
      if (isOpen && chartRef.current) {
        chartRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [chartRef, isOpen]);
    try {
     
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
  