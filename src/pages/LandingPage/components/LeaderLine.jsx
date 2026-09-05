import React, { useState, useEffect } from "react";

const PROVINCE_CONFIGS = {
    aceh: {
        color: "var(--green)",
        targetConfig: { points: "465,40 400,100 200,100", cx: 465, cy: 40 }
    },
    sumut: {
        color: "var(--gold)",
        targetConfig: { points: "414,-35 310,100 200,100", cx: 414, cy: -35 }
    },
    sumbar: {
        color: "#c2703d",
        targetConfig: { points: "327,-60 250,100 200,100", cx: 327, cy: -60 }
    }
};

export default function LeaderLine({
    show = true,
    region = "",
    label = "INDIKATOR",
    targetNumber = 1250,
    position = { top: "30%", left: "40%" },
    delay = 0,
}) {
    const [count, setCount] = useState(0);
    const config = PROVINCE_CONFIGS[region] || {
        color: "#38bdf8",
        targetConfig: { points: "210,20 130,20 130,100", cx: 210, cy: 20 }
    };

    const { color, targetConfig } = config;

    useEffect(() => {
        if (!show) {
            setCount(0);
            return;
        }

        let start = 0;
        const duration = 2000;
        const frameRate = 1000 / 60;
        const totalFrames = Math.round(duration / frameRate);
        const increment = targetNumber / totalFrames;

        const timer = setInterval(() => {
            start += increment;
            if (start >= targetNumber) {
                setCount(targetNumber);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, frameRate);

        return () => clearInterval(timer);
    }, [show, targetNumber]);

    return (
        <div
            style={{
                position: "absolute",
                ...position,
                width: "220px",
                height: "140px",
                pointerEvents: "none",
            }}
        >
            <style>
                {`
                    @keyframes leaderLineDrawIn {
                        0% { stroke-dashoffset: 300; opacity: 0; }
                        100% { stroke-dashoffset: 0; opacity: 1; }
                    }
                    @keyframes leaderLineDrawOut {
                        0% { stroke-dashoffset: 0; opacity: 1; }
                        100% { stroke-dashoffset: 300; opacity: 0; }
                    }
                    @keyframes boxPopIn {
                        0% { opacity: 0; transform: skewX(-15deg) scale(0.85) translateY(8px); }
                        100% { opacity: 1; transform: skewX(-15deg) scale(1) translateY(0); }
                    }
                    @keyframes boxPopOut {
                        0% { opacity: 1; transform: skewX(-15deg) scale(1) translateY(0); }
                        100% { opacity: 0; transform: skewX(-15deg) scale(0.85) translateY(8px); }
                    }
                    .animate-in-line {
                        stroke-dasharray: 300;
                        animation: leaderLineDrawIn 0.7s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                        animation-delay: ${delay}s;
                        will-change: stroke-dashoffset, opacity;
                    }
                    .animate-out-line {
                        stroke-dasharray: 300;
                        animation: leaderLineDrawOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                        will-change: stroke-dashoffset, opacity;
                    }
                    .animate-in-box {
                        animation: boxPopIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        animation-delay: ${delay}s;
                        will-change: transform, opacity;
                    }
                    .animate-out-box {
                        animation: boxPopOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                        will-change: transform, opacity;
                    }
                `}
            </style>

            <svg width="100%" height="100%" style={{ position: "absolute", overflow: "visible" }}>
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    points={targetConfig.points}
                    className={show ? "animate-in-line" : "animate-out-line"}
                />
                <circle
                    cx={targetConfig.cx}
                    cy={targetConfig.cy}
                    r="3"
                    fill={color}
                    style={{
                        opacity: show ? 1 : 0,
                        transition: `opacity 0.3s ease ${show ? delay + 0.4 : 0}s`
                    }}
                />
            </svg>

            <div
                className={show ? "animate-in-box" : "animate-out-box"}
                style={{
                    position: "absolute",
                    left: "20px",
                    bottom: "10px",
                    opacity: 0,
                    backgroundColor: "rgba(15, 23, 42, 0.85)",
                    border: `1px solid ${color}`,
                    padding: "8px 16px",
                    boxShadow: `0 0 15px ${color}33`,
                    backdropFilter: "blur(4px)",
                    pointerEvents: "auto",
                }}
            >
                <div style={{ transform: "skewX(15deg)", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", letterSpacing: "0.05em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "2px", fontFamily: "sans-serif" }}>
                        {label}
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: "700", color, fontFamily: "monospace", lineHeight: "1.1" }}>
                        {count.toLocaleString()}
                        <span style={{ fontSize: "14px", marginLeft: "4px" }}>mahasiswa</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function LeafletLeaderLinesWrapper({ show }) {
    return (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-visible left-0">
            <LeaderLine show={show} label="Aceh" targetNumber={280} position={{ top: "20%", left: "5%" }} region="aceh" delay={0} />
            <LeaderLine show={show} label="Sumatera Utara" targetNumber={190} position={{ top: "40%", left: "15%" }} region="sumut" delay={0.4} />
            <LeaderLine show={show} label="Sumatera Barat" targetNumber={30} position={{ top: "60%", left: "25%" }} region="sumbar" delay={0.8} />
        </div>
    );
}