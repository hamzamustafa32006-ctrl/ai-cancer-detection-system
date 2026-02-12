import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Atom,
  Zap,
  Brain,
  Stethoscope,
  ArrowRight,
  Activity,
  Shield,
  Database,
  TrendingUp,
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

const features = [
  {
    icon: Stethoscope,
    title: "AI-Powered Diagnosis",
    description: "Input electrical impedance measurements and receive instant tissue classification with confidence scoring",
  },
  {
    icon: Zap,
    title: "Electrical Impedance Analysis",
    description: "Multi-frequency impedance spectroscopy analysis across 9 key tissue biomarkers",
  },
  {
    icon: Brain,
    title: "Machine Learning Classification",
    description: "KNN-based classifier trained on 106 verified breast tissue samples across 6 tissue classes",
  },
  {
    icon: Database,
    title: "Evidence-Based Predictions",
    description: "Predictions backed by real clinical impedance data with transparent nearest-neighbor voting",
  },
  {
    icon: Activity,
    title: "Instant Results",
    description: "Real-time analysis with confidence scores and detailed breakdown of classifier decisions",
  },
  {
    icon: Shield,
    title: "Clinical Decision Support",
    description: "Designed as a support tool for physicians — complements, never replaces, clinical judgment",
  },
];

const stats = [
  { value: "106", label: "Training Samples", suffix: "" },
  { value: "6", label: "Tissue Classes", suffix: "" },
  { value: "9", label: "Impedance Features", suffix: "" },
  { value: "KNN", label: "Classifier Model", suffix: "" },
];

export default function Home() {
  usePageMeta({
    title: "QuantumDx - AI Cancer Diagnostics for Physicians",
    description: "AI-powered tissue classification platform for physicians. Input impedance spectroscopy data and receive instant predictions on whether tissue samples are cancerous or benign.",
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
            Diagnostic Support Tool for Physicians
          </Badge>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-foreground">
            AI-Powered{" "}
            <span className="text-primary">Tissue Classification</span>
          </h1>

          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">
            A diagnostic support platform for physicians. Enter electrical impedance
            spectroscopy measurements and receive instant AI-driven predictions
            on tissue classification — distinguishing cancerous from benign tissue.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/diagnosis">
              <Button data-testid="button-start-diagnosis">
                <Stethoscope className="w-4 h-4 mr-2" />
                Start Diagnosis
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" data-testid="button-view-data">
                View Training Data
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
                    <div className="text-3xl font-bold text-primary font-mono mb-1" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
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
              <h2 className="text-2xl font-bold mb-2 text-foreground">How It Works</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Designed for physicians who need fast, data-driven tissue classification support
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((cap, i) => (
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

      <section className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Ready to Analyze?</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  Enter your patient's impedance spectroscopy data and get instant AI-powered
                  tissue classification with confidence scoring.
                </p>
              </div>
              <Link href="/diagnosis">
                <Button data-testid="button-cta-diagnosis">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Go to Diagnosis
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-6 py-8 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <Atom className="w-8 h-8 text-primary mx-auto mb-4 opacity-60" />
          <h2 className="text-xl font-bold mb-3 text-foreground">Physics-First Diagnostics</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            This platform treats cancer detection as a problem of physical state differentiation.
            By analyzing intrinsic cellular properties — electrical impedance behavior,
            membrane characteristics, and tissue structure — it provides objective,
            quantitative diagnostic support independent of visual assessment alone.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["Impedance Spectroscopy", "KNN Classifier", "106 Training Samples", "6 Tissue Classes", "Real-Time Analysis"].map(
              (tag) => (
                <Badge key={tag} variant="secondary" data-testid={`badge-tag-${tag.toLowerCase().replace(/\s/g, "-")}`}>
                  {tag}
                </Badge>
              )
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold">Disclaimer: </span>
                This platform is a research-grade diagnostic support tool. AI predictions are
                based on impedance data patterns and should be used to complement — not replace —
                standard clinical pathology methods. Always confirm results with established
                diagnostic procedures.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
