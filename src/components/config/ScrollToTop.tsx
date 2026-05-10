import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

interface Props {
  /** Ref to scrollable element */
  targetRef: React.RefObject<HTMLElement>;
  threshold?: number;
}

export function ScrollToTop({ targetRef, threshold = 240 }: Props) {
  const [show, setShow] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setShow(el.scrollTop > threshold);
        ticking.current = false;
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [targetRef, threshold]);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          transition={{ duration: 0.18 }}
          onClick={() => targetRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className="absolute bottom-3 right-3 z-20 size-9 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg glow-primary backdrop-blur flex items-center justify-center border border-primary/30"
          aria-label="Scroll to top"
        >
          <ArrowUp className="size-4" strokeWidth={2.4} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
