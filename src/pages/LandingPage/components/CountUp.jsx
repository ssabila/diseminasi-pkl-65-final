import { useEffect, useRef, useState } from "react";

export default function CountUp({
    target,
    start = 0,
    duration = 1500,
    trigger = false,
    reverse = false,
}) {
    const targetNumber = Number(target);
    const startNumber = Number(start);

    const [count, setCount] = useState(
        reverse ? targetNumber : startNumber
    );

    const animationRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        // Jangan lakukan apa-apa jika sudah pernah selesai
        if (hasAnimated.current) return;

        // Hanya mulai ketika trigger true
        if (!trigger) return;

        const from = reverse ? targetNumber : startNumber;
        const to = reverse ? startNumber : targetNumber;

        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;

            const progress = Math.min(
                elapsed / duration,
                1
            );

            const easedProgress =
                1 - Math.pow(1 - progress, 3);

            const currentValue =
                from + (to - from) * easedProgress;

            setCount(Math.round(currentValue));

            if (progress < 1) {
                animationRef.current =
                    requestAnimationFrame(animate);
            } else {
                setCount(to);

                // Tandai bahwa animasi sudah pernah dijalankan
                hasAnimated.current = true;

                animationRef.current = null;
            }
        };

        animationRef.current =
            requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [
        trigger,
        reverse,
        targetNumber,
        startNumber,
        duration,
    ]);

    return <span>{count}</span>;
}