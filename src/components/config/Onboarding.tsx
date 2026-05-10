import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wand2, MousePointerClick, Sparkles, Download } from "lucide-react";

const KEY = "forgeyaml.onboarded.v1";

const STEPS = [
  {
    icon: Wand2,
    title: "Paste, drop, or load",
    body: "Drop any plugin config (YAML, TOML or JSON) into the input panel — or click a plugin in the sidebar to start from a complete real-world default.",
  },
  {
    icon: Sparkles,
    title: "Edit visually",
    body: "We auto-detect the plugin and turn the file into proper toggles, number fields and lists. Booleans are switches, strings are inputs — no YAML knowledge needed.",
  },
  {
    icon: MousePointerClick,
    title: "Undo anything",
    body: "Every change is captured in history. Use ⌘Z / Ctrl+Z to undo and ⌘⇧Z to redo, or use the toolbar buttons.",
  },
  {
    icon: Download,
    title: "Export in one click",
    body: "Copy to clipboard or download the perfectly-formatted file. Switch between YAML / TOML / JSON without losing your edits.",
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  function close() {
    localStorage.setItem(KEY, "1");
    setOpen(false);
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else close();
  }

  const Step = STEPS[step];
  const Icon = Step.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-border/60 bg-card/95 backdrop-blur-xl">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10 pointer-events-none" />
          <div className="relative p-6">
            <DialogHeader className="space-y-3">
              <motion.div
                key={step}
                initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="size-12 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/30 text-primary flex items-center justify-center pulse-glow"
              >
                <Icon className="size-6" strokeWidth={2.2} />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <DialogTitle className="font-display text-xl tracking-tight">{Step.title}</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {Step.body}
                  </DialogDescription>
                </motion.div>
              </AnimatePresence>
            </DialogHeader>

            {/* Step dots */}
            <div className="flex items-center gap-1.5 mt-6">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  aria-label={`Step ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between mt-5">
              <button
                onClick={close}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>
              <Button
                size="sm"
                onClick={next}
                className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
              >
                {step < STEPS.length - 1 ? "Next" : "Start editing"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
