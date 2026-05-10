import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ConfigStudio } from "@/components/config/ConfigStudio";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bolt, Eye, Layers, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ForgeYAML — Visual Plugin Config Generator for Minecraft" },
      {
        name: "description",
        content:
          "Paste any LuckPerms, EssentialsX, TAB or DeluxeMenus config and edit it visually. No YAML headaches — just toggles, inputs and live preview.",
      },
      { property: "og:title", content: "ForgeYAML — No-code plugin config builder" },
      {
        property: "og:description",
        content: "Auto-detect any Minecraft plugin config and turn it into a clean visual editor.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Nav */}
      <header className="relative z-10 border-b border-border/40 backdrop-blur-md bg-background/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
              <Bolt className="size-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">ForgeYAML</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#studio" className="hover:text-foreground transition-colors">Studio</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
            Get lifetime — $5.97
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6"
        >
          <Sparkles className="size-3" />
          Auto-detects 4+ plugins · zero YAML knowledge needed
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-display text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.05]"
        >
          Plugin configs, <span className="text-gradient">without the YAML pain.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Paste any LuckPerms, EssentialsX, TAB or DeluxeMenus file. ForgeYAML detects the plugin,
          turns it into clean toggles and inputs, and exports a clean config — live.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-9 flex items-center justify-center gap-3"
        >
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-primary h-12 px-6"
          >
            <a href="#studio">
              Open the studio <ArrowRight className="size-4 ml-1" />
            </a>
          </Button>
          <Button asChild size="lg" variant="ghost" className="h-12 px-6 hover:bg-muted">
            <a href="#features">See how it works</a>
          </Button>
        </motion.div>
      </section>

      {/* Studio */}
      <section id="studio" className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <ConfigStudio />
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Built for owners who'd rather <span className="text-gradient">play than debug</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            One workflow, four plugins, zero `mapping values are not allowed here` errors.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <Feature
            icon={<Layers className="size-5" />}
            title="Auto-detect plugin"
            body="Drop a YAML in — we identify whether it's LuckPerms, Essentials, TAB or DeluxeMenus and adapt the editor."
          />
          <Feature
            icon={<Eye className="size-5" />}
            title="Live preview"
            body="Every toggle, slider and field updates the output instantly. No save dance, no surprises."
          />
          <Feature
            icon={<ShieldCheck className="size-5" />}
            title="Syntax-safe export"
            body="Output is always valid YAML with proper indentation. Drop it in your plugins folder and reload."
          />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          One price. <span className="text-gradient">Forever.</span>
        </h2>
        <p className="mt-3 text-muted-foreground">No subscriptions. No upsells. Updates included.</p>

        <div className="mt-10 glass rounded-3xl p-8 md:p-10 text-left max-w-lg mx-auto relative overflow-hidden">
          <div className="absolute -top-20 -right-20 size-60 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider">
              <Sparkles className="size-3" /> Lifetime License
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-6xl font-bold">$5.97</span>
              <span className="text-muted-foreground line-through text-lg">$24</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-sm">
              {[
                "Unlimited configs across all plugins",
                "Auto-detect & smart UI for any YAML",
                "Live preview + one-click export",
                "Free updates as new plugins are added",
                "Works offline in your browser",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <div className="mt-0.5 size-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <div className="size-1.5 rounded-full bg-primary" />
                  </div>
                  <span className="text-foreground/90">{f}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-primary">
              Get ForgeYAML — $5.97
            </Button>
            <p className="mt-3 text-xs text-center text-muted-foreground">
              30-day refund · pay once, use forever
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/40 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-md bg-gradient-to-br from-primary to-accent" />
            <span className="font-display font-semibold text-foreground">ForgeYAML</span>
          </div>
          <p>© {new Date().getFullYear()} ForgeYAML. Not affiliated with Mojang.</p>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors group"
    >
      <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:glow-primary transition-shadow">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </motion.div>
  );
}
