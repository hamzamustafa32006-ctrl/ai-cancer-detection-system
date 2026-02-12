import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Atom,
  Zap,
  Brain,
  Microscope,
  ArrowRight,
  Activity,
  Layers,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/use-page-meta";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const capabilities = [
  {
    icon: Microscope,
    title: "Raman Spectroscopy",
    description: "Molecular vibrational fingerprinting for cellular characterization at the quantum level",
  },
  {
    icon: Zap,
    title: "Electrical Impedance",
    description: "Multi-frequency impedance spectroscopy revealing intrinsic tissue electrical properties",
  },
  {
    icon: Brain,
    title: "AI Classification",
    description: "Neural network and logistic regression models with quantum-inspired feature extraction",
  },
  {
    icon: Layers,
    title: "Multimodal Fusion",
    description: "Late fusion architecture combining spectral and impedance modalities for enhanced accuracy",
  },
  {
    icon: Activity,
    title: "Real-Time Analysis",
    description: "Automated preprocessing pipelines with confidence scoring and probabilistic interpretation",
  },
  {
    icon: Shield,
    title: "Validated Pipeline",
    description: "Rigorous train/validation/test splitting with calibrated thresholds and AUC reporting",
  },
];

const stats = [
  { value: "6", label: "Tissue Classes", suffix: "" },
  { value: "9", label: "Impedance Features", suffix: "" },
  { value: "19", label: "Quantum Features", suffix: "" },
  { value: "3", label: "AI Models", suffix: "" },
];

export default function Home() {
  usePageMeta({
    title: "Overview - Quantum Cancer Diagnostics",
    description: "A next-generation diagnostic platform exploring cancer as a measurable physical phenomenon through molecular vibrations, electrical impedance, and AI-driven classification.",
  });

  return (
    <div className="flex flex-col min-h-full" data-testid="page-home">
      <section className="relative flex flex-col items-center justify-center px-6 py-20 lg:py-28 overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent dark:from-primary/10 pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-primary/5 dark:bg-primary/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-chart-3/5 dark:bg-chart-3/8 blur-3xl pointer-events-none" />

        <motion.div
          className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <Badge variant="secondary" className="mb-6" data-testid="badge-status">
            <div className="w-1.5 h-1.5 rounded-full bg-chart-4 mr-2" />
            Research & Prototyping Phase
          </Badge>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Quantum-Integrated AI for{" "}
            <span className="text-primary">Cancer Diagnostics</span>
          </h1>

          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">
            A next-generation diagnostic platform exploring cancer as a measurable physical
            phenomenon through molecular vibrations, electrical impedance, and AI-driven
            classification.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button data-testid="button-explore-dashboard">
                Explore Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/research">
              <Button variant="outline" data-testid="button-read-research">
                Read the Research
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
            initial="hidden"
            animate="visible"
          >
            {stats.map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i + 1}>
                <Card className="text-center">
                  <CardContent className="py-6 px-4">
                    <div className="text-3xl font-bold text-primary font-mono mb-1">
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <motion.div variants={fadeUp} custom={0} className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2 text-foreground">Platform Capabilities</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Integrating quantum physics, biophysics, and artificial intelligence
                into a unified diagnostic framework
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {capabilities.map((cap, i) => (
                <motion.div key={cap.title} variants={fadeUp} custom={i + 1}>
                  <Card className="h-full hover-elevate">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10">
                          <cap.icon className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm text-foreground">{cap.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {cap.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-12 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <Atom className="w-8 h-8 text-primary mx-auto mb-4 opacity-60" />
          <h2 className="text-xl font-bold mb-3 text-foreground">Physics-First Diagnostics</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            By treating cancer detection as a problem of physical state differentiation
            rather than image pattern recognition alone, this platform shifts toward a
            physics-first diagnostic philosophy — analyzing intrinsic cellular properties
            including molecular vibrational signatures, electrical impedance behavior,
            and mechanical characteristics.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["Raman Spectra", "Impedance", "Wavelet Analysis", "MLP Classifier", "Late Fusion"].map(
              (tag) => (
                <Badge key={tag} variant="secondary" data-testid={`badge-tag-${tag.toLowerCase().replace(/\s/g, "-")}`}>
                  {tag}
                </Badge>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
