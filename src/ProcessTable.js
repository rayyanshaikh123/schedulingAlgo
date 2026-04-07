import React, {useEffect} from "react";
import { motion } from "framer-motion";


export default function ProcessTable({ results, isOpen, onComplete, chartRef }) {

    useEffect(() => {
      if (isOpen && chartRef.current) {
        chartRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [chartRef, isOpen]);
    try {
      const rows = (results.process || []).map((processId, index) => ({
        processId,
        burst: results.burst?.[index],
        arrival: results.arrival?.[index],
        waitingTime: results.waitingTime?.[index],
        turnaroundTime: results.turnaroundTime?.[index],
        completionTime: results.completionTime?.[index],
      }));
  
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
              <div className="table-wrap" ref={chartRef}>
                <table className="table scheduler-table">
                  <thead>
                    <tr>
                      <th>Process</th>
                      <th>Arrival Time</th>
                      <th>Burst Time</th>
                      <th>Waiting Time</th>
                      <th>Turnaround Time</th>
                      <th>Completion Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 1, delay: index * 0.8 }}
                          onAnimationComplete={() => {
                            if (index === rows.length - 1) {
                              onComplete(true);
                            }
                          }}
                          className={index % 2 === 0 ? "row-even" : "row-odd"}
                        >
                          <td>P{item.processId}</td>
                          <td>{item.arrival}</td>
                          <td>{item.burst}</td>
                          <td>{Math.abs(item.waitingTime)}</td>
                          <td>{item.turnaroundTime}</td>
                          <td>{item.completionTime}</td>
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
  