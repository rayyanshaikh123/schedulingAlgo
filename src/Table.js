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
            <div className="table-wrap" ref={chartRef}>
              <table className="table scheduler-table">
                <thead>
                  <tr>
                    <th>Process</th>
                    <th>Burst Time</th>
                    <th>Arrival Time</th>
                    {strategy === 3 && <th>Priority</th>}
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
                          className={i % 2 === 0 ? "row-even" : "row-odd"}
                        >
                          <td>P{process}</td>
                          <td>{item.burst[i]}</td>
                          <td>{item.arrival[i]}</td>
                          {strategy === 3 && <td>{item.priority[i]}</td>}
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
  
  