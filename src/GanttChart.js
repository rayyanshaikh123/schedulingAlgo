import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PASTEL_PALETTE = [
  "#ffd6e0",
  "#ffe5c4",
  "#fff1b8",
  "#d8f3dc",
  "#cde7ff",
  "#e9d5ff",
  "#b8f2e6",
  "#ffc9de",
  "#e7f0b8",
  "#f5d0fe",
];

export default function GanttChart({ results, onComplete, chartRef, isOpen }) {
  const [colorMap, setColorMap] = useState({});


  useEffect(() => {
    const uniqueProcesses = Array.from(
      new Set((results.ganttChart || []).map((item) => item.process))
    );

    const generatedColors = uniqueProcesses.reduce((acc, process) => {
      const numericProcess = Number(process);
      const paletteIndex = Number.isNaN(numericProcess)
        ? 0
        : (numericProcess - 1) % PASTEL_PALETTE.length;
      acc[process] = PASTEL_PALETTE[paletteIndex];
      return acc;
    }, {});

    setColorMap(generatedColors);
  }, [results.ganttChart]);

  useEffect(() => {
    if (isOpen && chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chartRef, isOpen]);

  return (
    <>
      {isOpen && (
        <>
          <h4 className="mb-4 head" style={{ fontSize: "24px", textAlign: "center" }}>
            Gantt Chart
          </h4>
          <div className="table-wrap" ref={chartRef}>
           
            <table
              className="table table-bordered scheduler-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <tbody>
                <tr>
                  {results.ganttChart.map((item, index) => (
                    <motion.td
                      key={index}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.8 }}
                      onAnimationComplete={() => {
                        if (index === results.ganttChart.length - 1) {
                          setTimeout(onComplete, 600);
                        }
                      }}
                      style={{
                        textAlign: "center",
                        padding: "16px",
                        position: "relative",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        fontSize: "18px",
                        fontWeight: "500",
                        color: "#2d2040",
                        backgroundColor: colorMap[item.process],
                      }}
                    >
                      <sup
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "bold",
                          marginBottom: "-2px",
                        }}
                      >
                        {item.end - item.start}
                      </sup>
                      <p
                        style={{
                          margin: "10px 0 0",
                          fontSize: "20px",
                          fontWeight: "bold",
                        }}
                      >
                        P{item.process}
                      </p>
                      <div
                        style={{
                          position: "absolute",
                          bottom: "5px",
                          left: "5px",
                          fontSize: "14px",
                        }}
                      >
                        <sub>{item.start}</sub>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          bottom: "5px",
                          right: "5px",
                          fontSize: "14px",
                        }}
                      >
                        <sub>
                          {index === results.ganttChart.length - 1
                            ? item.end
                            : results.ganttChart[index + 1].start}
                        </sub>
                      </div>
                    </motion.td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
