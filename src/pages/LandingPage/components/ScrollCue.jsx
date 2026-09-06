import React from 'react'

function ScrollCue() {
    return (
        <div className="hero-scroll-cue opacity-0 absolute md:bottom-[clamp(20px,3.5vh,40px)] md:left-[5%] bottom-[43vh] left-5 flex items-center gap-2.5 z-[50]">
            <style>{`
                @keyframes scrollLine {
                0%   { transform:scaleY(0); transform-origin:top; opacity:0; }
                30%  { transform:scaleY(1); transform-origin:top; opacity:1; }
                70%  { transform:scaleY(1); transform-origin:bottom; opacity:1; }
                100% { transform:scaleY(0); transform-origin:bottom; opacity:0; }
                }
      `}</style>
            <div className="w-[1px] h-10 bg-[var(--beige)] animate-[scrollLine_2.2s_ease-in-out_infinite]" />
            <span className="text-[9px] tracking-[0.2em] uppercase text-[var(--beige)] font-light">
                Scroll
            </span>
        </div>)
}

export default ScrollCue;