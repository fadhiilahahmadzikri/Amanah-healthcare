'use client';

import React from 'react';

/**
 * Atom: ChoreographyStyleAtom
 * Scoped pure CSS keyframes & timing functions for the choreographed modal.
 */
export function ChoreographyStyleAtom() {
  return (
    <style>{`
      .sunburst-wrapper {
        position: absolute;
        top: -115px;
        left: 50%;
        transform: translateX(-50%);
        width: 440px;
        height: 440px;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
        mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 15%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 70%);
        -webkit-mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 15%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 70%);
      }

      .sunburst-rays {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: repeating-conic-gradient(
          from 0deg,
          var(--theme-ray, rgba(22, 163, 74, 0.1)) 0deg 14deg,
          transparent 14deg 30deg
        );
        animation: rotateRays 24s linear infinite;
        transform-origin: center center;
      }

      .sunburst-rays-secondary {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: repeating-conic-gradient(
          from 15deg,
          var(--theme-ray, rgba(22, 163, 74, 0.1)) 0deg 8deg,
          transparent 8deg 24deg
        );
        opacity: 0.5;
        animation: rotateRaysReverse 32s linear infinite;
        transform-origin: center center;
      }

      @keyframes rotateRays {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.06); }
        100% { transform: rotate(360deg) scale(1); }
      }

      @keyframes rotateRaysReverse {
        0% { transform: rotate(360deg); }
        100% { transform: rotate(0deg); }
      }

      .modal-choreographed-enter {
        animation: modalPopIn 0.52s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }

      @keyframes modalPopIn {
        0% { opacity: 0; transform: translateY(32px) scale(0.93); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      .badge-scallop {
        transform-origin: center;
        animation: badgeMorphEnter 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                   badgeSlowSpin 22s linear 0.85s infinite;
      }

      .choreo-pulse .badge-scallop {
        animation: badgePulseEnter 0.8s cubic-bezier(0.25, 1.5, 0.5, 1) forwards,
                   badgeBreathing 3.5s ease-in-out 0.8s infinite;
      }

      .choreo-vortex .badge-scallop {
        animation: badgeVortexEnter 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards,
                   badgeSlowSpin 10s linear 0.95s infinite;
      }

      @keyframes badgeMorphEnter {
        0% { transform: scale(0) rotate(-140deg); opacity: 0; }
        65% { transform: scale(1.14) rotate(12deg); opacity: 1; }
        82% { transform: scale(0.95) rotate(-4deg); }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }

      @keyframes badgePulseEnter {
        0% { transform: scale(0.2); opacity: 0; }
        50% { transform: scale(1.22); opacity: 1; }
        75% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
      }

      @keyframes badgeVortexEnter {
        0% { transform: scale(0) rotate(-360deg); opacity: 0; filter: blur(6px); }
        70% { transform: scale(1.1) rotate(20deg); opacity: 1; filter: blur(0px); }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }

      @keyframes badgeSlowSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes badgeBreathing {
        0%, 100% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.06) rotate(6deg); }
      }

      .morph-ring {
        transform-origin: center;
        animation: ringExpand 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
        opacity: 0;
      }

      @keyframes ringExpand {
        0% { transform: scale(0.5); opacity: 0.7; stroke-width: 8px; }
        100% { transform: scale(1.65); opacity: 0; stroke-width: 1px; }
      }

      .icon-stroke-path {
        stroke-dasharray: 100;
        stroke-dashoffset: 100;
        animation: drawStroke 0.65s cubic-bezier(0.65, 0, 0.35, 1) 0.38s forwards;
      }

      .icon-stroke-path-delay {
        stroke-dasharray: 100;
        stroke-dashoffset: 100;
        animation: drawStroke 0.5s cubic-bezier(0.65, 0, 0.35, 1) 0.62s forwards;
      }

      @keyframes drawStroke {
        0% { stroke-dashoffset: 100; }
        100% { stroke-dashoffset: 0; }
      }

      .stagger-item {
        opacity: 0;
        transform: translateY(14px);
        animation: staggerSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }

      .stagger-1 { animation-delay: 0.2s; }
      .stagger-2 { animation-delay: 0.3s; }
      .stagger-3 { animation-delay: 0.4s; }
      .stagger-4 { animation-delay: 0.5s; }

      @keyframes staggerSlideUp {
        0% { opacity: 0; transform: translateY(14px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      .sparkle-particle {
        opacity: 0;
        transform-origin: center;
        animation: particleBurst 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.28s forwards,
                   particleFloat 3.2s ease-in-out 1.18s infinite;
      }

      @keyframes particleBurst {
        0% { opacity: 0; transform: translate(var(--start-x, 0px), var(--start-y, 0px)) scale(0) rotate(-45deg); }
        70% { opacity: 1; transform: translate(0, 0) scale(1.25) rotate(10deg); }
        100% { opacity: 1; transform: translate(0, 0) scale(1) rotate(0deg); }
      }

      @keyframes particleFloat {
        0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
        50% { transform: translateY(-4px) rotate(18deg) scale(1.1); }
      }
    `}</style>
  );
}
