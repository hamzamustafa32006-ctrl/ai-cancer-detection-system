import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Atom,
  Waves,
  Zap,
  Brain,
  FlaskConical,
  Target,
  Microscope,
  BarChart3,
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

const mechanicalProperties = [
  { tissue: "Bladder (HCV29 normal)", modulus: "10.0 +/- 4.6 kPa", method: "AFM Conical" },
  { tissue: "Bladder (T24 malignant)", modulus: "1.0 +/- 0.5 kPa", method: "AFM Conical" },
  { tissue: "Breast (MCF-10A normal)", modulus: "1231 +/- 765 Pa", method: "AFM Pyramidal" },
  { tissue: "Breast (MCF-7 malignant)", modulus: "487 +/- 173 Pa", method: "AFM Pyramidal" },
  { tissue: "Breast (184A normal)", modulus: "2.26 +/- 0.56 kPa", method: "AFM Conical" },
  { tissue: "Breast (MDA-MD-231 malignant)", modulus: "0.3 +/- 0.1 kPa", method: "AFM Pyramidal" },
];

export default function Research() {
  usePageMeta({
    title: "Research - Scientific Rationale",
    description: "Understanding cancer through the lens of physics and measurable cellular properties including vibrational spectra, electrical impedance, and mechanical stiffness.",
  });

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={0}>
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-research-title">
            Scientific Rationale
          </h1>
          <p className="text-sm text-muted-foreground">
            Understanding cancer through the lens of physics and measurable cellular properties
          </p>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={1}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10">
                <Atom className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">The Core Hypothesis</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              A cancer cell is not just a visual abnormality — it is a complex physical system.
              At the microscopic level, cells interact with electromagnetic fields, exhibit distinct
              vibrational spectra, exchange energy differently, and show altered electrical and
              mechanical behavior.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Modern quantum physics and condensed matter principles allow us to understand matter
              not only by structure but by behavior — how it absorbs energy, oscillates, and responds
              to external stimuli.
            </p>
            <div className="bg-muted/50 dark:bg-muted/30 rounded-md p-4 border border-border">
              <p className="text-sm font-medium text-foreground italic">
                "Malignant cells may exhibit measurable physical or energetic signatures
                distinguishable from healthy cells when analyzed through advanced spectroscopic
                and impedance-based techniques."
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={2}>
        <h2 className="text-lg font-semibold text-foreground mb-3">Cellular Physical Properties</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: Waves,
              title: "Electromagnetic Interaction",
              desc: "Cancer cells exhibit altered dielectric properties and respond differently to applied electromagnetic fields across frequency ranges.",
            },
            {
              icon: FlaskConical,
              title: "Vibrational Spectra",
              desc: "Raman spectroscopy reveals molecular vibrational fingerprints that differ between healthy and malignant cells due to biochemical changes.",
            },
            {
              icon: Zap,
              title: "Electrical Impedance",
              desc: "Tissue impedance varies with cellular structure and membrane integrity, showing measurable differences between tissue types.",
            },
            {
              icon: Target,
              title: "Mechanical Stiffness",
              desc: "Cancer cells generally exhibit lower Young's modulus (softer) compared to normal cells, measurable via AFM techniques.",
            },
          ].map((item, i) => (
            <Card key={item.title} className="h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={3}>
        <h2 className="text-lg font-semibold text-foreground mb-3">Mechanical Properties Evidence</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-mechanical-properties">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Cell Type
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Young's Modulus
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Method
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mechanicalProperties.map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-b-0">
                      <td className="p-3 text-foreground font-mono text-xs">{row.tissue}</td>
                      <td className="p-3">
                        <Badge variant="secondary">{row.modulus}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{row.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground mt-2 italic">
          Source: Massey et al., "Mechanical properties of human tumour tissues and their implications
          for cancer development," Nature Reviews Physics, 2024.
        </p>
      </motion.div>

      <Separator />

      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={4}>
        <h2 className="text-lg font-semibold text-foreground mb-3">Impedance-Based Detection</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-chart-2/20 dark:bg-chart-2/15">
                <BarChart3 className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Breast Tissue EIS Analysis</h3>
                <p className="text-xs text-muted-foreground">
                  Electrical Impedance Spectroscopy for tissue classification
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The impedance dataset includes measurements from six breast tissue types: carcinoma (car),
              fibroadenoma (fad), mastopathy (mas), glandular (gla), connective (con), and adipose (adi).
              Each sample is characterized by nine electrical impedance features measured at various frequencies.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: "I0", desc: "Initial impedance" },
                { label: "PA500", desc: "Phase angle at 500 kHz" },
                { label: "HFS", desc: "High frequency slope" },
                { label: "DA", desc: "Distance measure A" },
                { label: "Area", desc: "Spectral area" },
                { label: "A/DA", desc: "Area to DA ratio" },
                { label: "Max.IP", desc: "Maximum inflection point" },
                { label: "DR", desc: "Distance measure R" },
                { label: "P", desc: "Perimeter" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 dark:bg-muted/30">
                  <span className="font-mono text-xs font-semibold text-primary">{f.label}</span>
                  <span className="text-xs text-muted-foreground">{f.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={5}>
        <h2 className="text-lg font-semibold text-foreground mb-3">Quantum-Inspired Feature Engineering</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-chart-3/20 dark:bg-chart-3/15">
                <Microscope className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Raman Spectral Analysis</h3>
                <p className="text-xs text-muted-foreground">19 quantum-inspired features per sample</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The Raman modality uses quantum-inspired feature extraction to capture molecular-level
              information from vibrational spectra. Features include wavelet energy decomposition,
              spectral entropy, Renyi entropy, peak characteristics, and band energy distributions.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: "Wavelet Energy (5 features)", desc: "DB4 wavelet decomposition at level 4, energy ratios per level" },
                { name: "Spectral Entropy", desc: "Shannon entropy of the normalized spectral distribution" },
                { name: "Renyi Entropy", desc: "Second-order Renyi entropy capturing concentration of spectral power" },
                { name: "Peak Features (4)", desc: "Number of peaks, maximum amplitude, mean prominence, density" },
                { name: "Band Energy (8 features)", desc: "Normalized energy in 8 equal spectral bands" },
              ].map((f) => (
                <div key={f.name} className="p-3 rounded-md bg-muted/50 dark:bg-muted/30 border border-border">
                  <span className="text-xs font-semibold text-foreground block mb-1">{f.name}</span>
                  <span className="text-xs text-muted-foreground">{f.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={6}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-chart-4/20 dark:bg-chart-4/15">
                <Brain className="w-5 h-5 text-chart-4" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">AI Classification Pipeline</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Raman Model (MLP)</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Multi-layer perceptron with hidden layers (128, 64), ReLU activation, Adam optimizer,
                  early stopping, and standard scaling. Trained on full Raman dataset for maximum
                  classification performance.
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Impedance Model (Logistic Regression)</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Balanced class-weighted logistic regression with precision-recall threshold calibration.
                  Optimizes F1 score for the positive class (carcinoma detection).
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Late Fusion</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Split-based, leakage-reduced late fusion. Raman probabilities are downsampled per class
                  to match impedance counts within each split, then paired to build balanced fusion samples.
                  A meta-classifier combines both modalities for enhanced diagnostic accuracy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
