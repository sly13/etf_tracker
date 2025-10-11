"use client";

import { useEffect, useState } from "react";

interface MoneyItem {
  id: number;
  x: number;
  y: number;
  rotation: number;
  speed: number;
  type: "bill" | "coin";
  value: string;
}

export default function MoneyRain() {
  const [moneyItems, setMoneyItems] = useState<MoneyItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const createMoneyItem = (): MoneyItem => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      speed: 1 + Math.random() * 3,
      type: Math.random() > 0.6 ? "coin" : "bill",
      value: Math.random() > 0.3 ? "$" : "₿",
    });

    const interval = setInterval(() => {
      setMoneyItems(prev => {
        const newItems = [...prev, createMoneyItem()];
        // Удаляем элементы, которые упали за экран
        return newItems.filter(item => item.y < 110);
      });
    }, 100);

    const animationInterval = setInterval(() => {
      setMoneyItems(prev =>
        prev.map(item => ({
          ...item,
          y: item.y + item.speed,
          rotation: item.rotation + 2,
        }))
      );
    }, 50);

    return () => {
      clearInterval(interval);
      clearInterval(animationInterval);
    };
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {moneyItems.map(item => (
        <div
          key={item.id}
          className="absolute text-4xl font-bold opacity-70 select-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            transform: `rotate(${item.rotation}deg)`,
            color: item.type === "bill" ? "#059669" : "#d97706",
            textShadow:
              "0 0 15px rgba(0,0,0,0.5), 0 0 30px rgba(255,255,255,0.3)",
            animation: "falling 6s linear infinite",
            filter: "drop-shadow(0 0 8px rgba(0,0,0,0.4))",
          }}
        >
          {item.value}
        </div>
      ))}

      <style jsx>{`
        @keyframes falling {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.2;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
