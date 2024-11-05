import React, {  useEffect } from "react";
import { motion } from "framer-motion";

export default function Table({ data, isOpen, onComplete, strategy, chartRef }) {
  
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
                    
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: "bold",
                    }}
                  >
                    <th
                      style={{
                        padding: "12px 15px",
                        backgroundColor: "#493628", 
                        color: "#E4E0E1",
                      }}
                    >
                      Process
                    </th>
                    <th
                      style={{
                        padding: "12px 15px",
                        backgroundColor: "#493628", 
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
                          backgroundColor: "#493628", 
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
                            backgroundColor: i % 2 === 0 ? "#f2f2f2" : "#E4E0E1", 
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
  
  