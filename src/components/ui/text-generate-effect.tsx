"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      { opacity: 1 },
      { duration, delay: stagger(0.12) }
    );
  }, [animate, duration]);

  return (
    <div className={cn("font-bold", className)}>
      <div ref={scope}>
        {wordsArray.map((word, idx) => (
          <span
            key={word + idx}
            className="inline-block text-white opacity-0"
          >
            {word}{"\u00A0"}
          </span>
        ))}
      </div>
    </div>
  );
};
