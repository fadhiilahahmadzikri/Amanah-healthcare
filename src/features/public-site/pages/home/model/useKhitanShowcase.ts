'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

export function useKhitanShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  useGSAP(
    () => {
      if (!sectionRef.current) {
        return;
      }

      if (headerRef.current) {
        const iconItems = headerRef.current.querySelectorAll('[data-header-icon]');
        const heading = headerRef.current.querySelector('[data-mask-text]');

        if (iconItems.length > 0) {
          gsap.fromTo(
            iconItems,
            { scale: 0.35, y: 18, opacity: 0 },
            {
              scale: 1,
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.12,
              ease: 'back.out(2)',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }

        if (heading) {
          gsap.fromTo(
            heading,
            { yPercent: 120, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 1.1,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }
      }

      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      if (contentRef.current) {
        const textElements = contentRef.current.querySelectorAll('[data-content-item]');
        if (textElements.length > 0) {
          gsap.fromTo(
            textElements,
            { y: 25, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              stagger: 0.1,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: cardRef.current ?? sectionRef.current,
                start: 'top 78%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }
      }

      if (videoWrapperRef.current) {
        gsap.fromTo(
          videoWrapperRef.current,
          { scale: 0.94, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardRef.current ?? sectionRef.current,
              start: 'top 78%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return {
    refs: {
      sectionRef,
      headerRef,
      cardRef,
      videoWrapperRef,
      contentRef,
      videoRef
    },
    state: {
      isPlaying,
      isMuted
    },
    actions: {
      togglePlay,
      toggleMute,
      setIsPlaying
    }
  };
}
