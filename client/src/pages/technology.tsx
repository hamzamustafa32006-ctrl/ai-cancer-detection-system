import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Layers,
  Radio,
  Cpu,
  Monitor,
  ArrowDown,
  Lock,
  Server,
  Database,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/use-page-meta";

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

const layers = [
  {
    icon: Radio,
    title: "Physical Signal Acquisition Layer",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    items: [
      "Raman spectroscopy data (molecular vibrational fingerprints)",
      "Electrical impedance spectroscopy measurements",
      "Mechanical stiffness / elasticity indicators",
      "Potential future quantum-sensitive sensing modalities",
    ],
  },
  {
    icon: Cpu,
    title: "AI-Based Analysis Engine",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    items: [
      "Feature extraction from high-dimensional spectral datasets",
      "Multimodal data fusion with balanced class representation",
      "Machine learning classification (MLP + Logistic Regression)",
      "Robust validation strategies with calibrated thresholds",
      "Explainable AI outputs for interpretability",
    ],
  },
  {
    icon: Monitor,
    title: "Diagnostic Interface Platform",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    items: [
      "Secure sample upload portal",
      "Data preprocessing automation",
      "Real-time classification results",
      "Confidence scoring and probabilistic interpretation",
      "Research dashboard for clinicians and scientists",
    ],
  },
];

const innovations = [
  "Multidisciplinary integration (Physics + Oncology + AI)",
  "Non-image-dependent diagnostic exploration",
  "Multimodal signal fusion (Raman + Impedance)",
  "Emphasis on intrinsic cellular properties",
  "Pathway toward non-invasive diagnostics",
  "Scalable digital infrastructure design",
];

export default function Technology() {
  usePageMeta({
    title: "Technology - Platform Architecture",
    description: "Three-layer architecture integrating physical signal acquisition, AI-based analysis, and diagnostic interface for quantum-integrated cancer diagnostics.",
  });

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={0}>
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-technology-title">
            Platform Architecture
          </h1>
          <p className="text-sm text-muted-foreground">
            Three-layer architecture integrating signal acquisition, AI analysis, and diagnostic interface
          </p>
        </div>
      </motion.div>

      <div className="flex flex-col gap-3">
        {layers.map((layer, i) => (
          <motion.div key={layer.title} initial="hidden" animate="visible" variants={fadeIn} custom={i + 1}>
            {i > 0 && (
              <div className="flex justify-center my-1">
                <ArrowDown className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-md ${layer.bg}`}>
                    <layer.icon className={`w-5 h-5 ${layer.color}`} />
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-1">Layer {i + 1}</Badge>
                    <h2 className="font-semibold text-foreground">{layer.title}</h2>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {layer.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2 p-2 rounded-md bg-muted/50 dark:bg-muted/30"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${layer.bg.replace('/10', '')} ${layer.color.replace('text-', 'bg-')}`} />
                      <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Separator />

      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={5}>
        <h2 className="text-lg font-semibold text-foreground mb-3">Quantum Physics Integration</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The project incorporates quantum-informed principles rather than full-scale quantum computation.
              By treating cancer detection as a problem of physical state differentiation, the platform
              utilizes concepts from condensed matter physics and quantum mechanics:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { title: "Molecular Vibrational Transitions", desc: "Energy level transitions captured through Raman spectroscopy" },
                { title: "Spectral Interaction Modeling", desc: "Understanding light-matter interactions at molecular scale" },
                { title: "Nanoscopic Signal Behavior", desc: "Signal characteristics at cellular and sub-cellular dimensions" },
                { title: "Quantum-Inspired Feature Space", desc: "Wavelet decomposition and entropy measures inspired by quantum information theory" },
              ].map((item) => (
                <div key={item.title} className="p-3 rounded-md border border-border">
                  <span className="text-xs font-semibold text-foreground block mb-1">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={6}>
        <h2 className="text-lg font-semibold text-foreground mb-3">Innovation Factors</h2>
        <Card>
          <CardContent className="p-5">
            <div className="grid sm:grid-cols-2 gap-2">
              {innovations.map((item) => (
                <div key={item} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 dark:bg-muted/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-xs text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={7}>
        <h2 className="text-lg font-semibold text-foreground mb-3">Technical Stack</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Server,
              title: "Backend",
              items: ["Python ML Pipeline", "scikit-learn Models", "Express.js API", "PostgreSQL Database"],
            },
            {
              icon: Monitor,
              title: "Frontend",
              items: ["React + TypeScript", "Recharts Visualization", "Responsive Design", "Dark/Light Themes"],
            },
            {
              icon: Lock,
              title: "Security",
              items: ["Secure Data Upload", "API Authentication", "Data Encryption", "Session Management"],
            },
          ].map((stack) => (
            <Card key={stack.title} className="h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <stack.icon className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">{stack.title}</h3>
                </div>
                <div className="space-y-1.5">
                  {stack.items.map((item) => (
                    <div key={item} className="text-xs text-muted-foreground flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={8}>
        <h2 className="text-lg font-semibold text-foreground mb-3">Long-Term Vision</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-chart-5/20 dark:bg-chart-5/15">
                <Database className="w-5 h-5 text-chart-5" />
              </div>
              <h3 className="font-semibold text-foreground">Contributing to Physics-Driven Medicine</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Earlier cancer detection strategies",
                "More objective diagnostic criteria",
                "Reduced dependency on invasive biopsies",
                "Real-time physical diagnostic systems",
                "A new category of physics-driven diagnostics",
                "Clinically adaptable research-grade tools",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-chart-5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
