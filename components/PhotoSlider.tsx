"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Фото объявления по очереди: листаются сами, пока видны на экране,
 * и свайпаются пальцем или мышью. Любое касание останавливает автопрокрутку.
 */
export function PhotoSlider({
  images,
  alt,
  index,
  onIndexChange,
  interval = 4000,
  imgClassName = "",
  onTap,
  children,
}: {
  images: string[];
  alt: string;
  index: number;
  onIndexChange: (i: number) => void;
  interval?: number;
  imgClassName?: string;
  onTap?: () => void;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const [inView, setInView] = useState(false);
  const [touched, setTouched] = useState(false);
  const reduced = useReducedMotion();
  const count = images.length;
  // Направление анимации по смене номера: назад на одно фото — справа налево, иначе вперёд
  const prev = useRef(index);
  const dirRef = useRef(1);
  if (prev.current !== index) {
    dirRef.current = index === (prev.current - 1 + count) % count ? -1 : 1;
    prev.current = index;
  }
  const dir = dirRef.current;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.6 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const playing = count > 1 && inView && !touched && !reduced;
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => onIndexChange((index + 1) % count), interval);
    return () => clearInterval(timer);
  }, [playing, index, count, interval, onIndexChange]);

  // Следующее фото подгружаем заранее, но только когда слайдер на экране
  useEffect(() => {
    if (inView && count > 1) new Image().src = images[(index + 1) % count];
  }, [inView, index, count, images]);

  function go(step: number) {
    setTouched(true);
    onIndexChange((index + step + count) % count);
  }

  return (
    <div
      ref={ref}
      className="absolute inset-0 touch-pan-y"
      onPointerDown={() => setTouched(true)}
      onClickCapture={(e) => {
        // После свайпа не открываем объявление и не разворачиваем фото
        if (dragged.current) {
          e.preventDefault();
          e.stopPropagation();
          dragged.current = false;
        }
      }}
    >
      <AnimatePresence initial={false} custom={dir}>
        <motion.img
          key={index}
          src={images[index]}
          alt={alt}
          loading="lazy"
          draggable={false}
          custom={dir}
          variants={{
            enter: (d: number) => ({ x: `${d * 100}%` }),
            center: { x: 0 },
            exit: (d: number) => ({ x: `${d * -100}%` }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          drag={count > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.35}
          onDragStart={() => {
            dragged.current = true;
          }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -40 || info.velocity.x < -400) go(1);
            else if (info.offset.x > 40 || info.velocity.x > 400) go(-1);
            setTimeout(() => (dragged.current = false), 50);
          }}
          onClick={onTap}
          className={`absolute inset-0 h-full w-full select-none object-cover ${imgClassName}`}
        />
      </AnimatePresence>
      {children}
    </div>
  );
}

/** Точки-индикаторы под фото */
export function SliderDots({ count, index, onSelect }: { count: number; index: number; onSelect: (i: number) => void }) {
  if (count < 2) return null;
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i + 1} / ${count}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(i);
          }}
          className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/55"}`}
        />
      ))}
    </div>
  );
}
