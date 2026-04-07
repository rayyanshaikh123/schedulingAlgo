
import React, { useEffect, useState } from "react";

const HOVER_EMOJIS = ["✨", "🔥", "⚡", "🎉", "🚀", "🌟", "😎", "💫", "🎯", "🫶"];

const INTRO_SEQUENCE = [
  "Introducing",
  "Scheduling Algo Sim",
  "By",
  "Rayyan Shaikh",
  "And",
  "Arnav Tawar",
];

export default function Loader({ fadeOut }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [emojiBursts, setEmojiBursts] = useState([]);
  const [lastSpawnTime, setLastSpawnTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= INTRO_SEQUENCE.length - 1) {
          return prev;
        }

        return prev + 1;
      });
    }, 1150);

    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (event) => {
    const now = Date.now();

    if (now - lastSpawnTime < 80) {
      return;
    }

    setLastSpawnTime(now);

    const rect = event.currentTarget.getBoundingClientRect();
    const emoji = HOVER_EMOJIS[Math.floor(Math.random() * HOVER_EMOJIS.length)];
    const id = `${now}-${Math.random()}`;
    const size = 16 + Math.floor(Math.random() * 18);
    const offsetX = Math.floor(Math.random() * 18) - 9;
    const offsetY = Math.floor(Math.random() * 18) - 9;
    const rotation = Math.floor(Math.random() * 36) - 18;

    const nextEmoji = {
      id,
      emoji,
      x: event.clientX - rect.left + offsetX,
      y: event.clientY - rect.top + offsetY,
      size,
      rotation,
    };

    setEmojiBursts((prev) => [...prev, nextEmoji]);

    setTimeout(() => {
      setEmojiBursts((prev) => prev.filter((item) => item.id !== id));
    }, 900);
  };

  return (
    <section
      className={`loader-screen content ${fadeOut ? "fade-out" : "fade-in"}`}
      onMouseMove={handleMouseMove}
    >
      <div className="loader-plain">
        <h1 key={activeIndex} className="loader-single-line">
          {INTRO_SEQUENCE[activeIndex]}
        </h1>
      </div>
      <div className="emoji-layer" aria-hidden="true">
        {emojiBursts.map((item) => (
          <span
            key={item.id}
            className="hover-emoji"
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              fontSize: `${item.size}px`,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>
    </section>
  );
}
