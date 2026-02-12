import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  BookOpen,
  Users,
  Calendar,
  ExternalLink,
  GraduationCap,
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

const references = [
  {
    title: "Mechanical properties of human tumour tissues and their implications for cancer development",
    authors: "Massey A, Stewart J, Smith C, Parvini C, McCormick M, Do K, Cartagena-Rivera AX",
    journal: "Nature Reviews Physics",
    year: "2024",
    type: "Review",
    doi: "10.1038/s42254-024-00707-2",
    relevance: "Comprehensive review of mechanical property measurements distinguishing normal from malignant cells using AFM techniques.",
  },
  {
    title: "Early Breast Cancer Detection and Differentiation Tool Based on Tissue Impedance Characteristics and Machine Learning",
    authors: "Ben Salem S, Ali SZ, Leo AJ, Lachiri Z, Mkandawire M",
    journal: "Frontiers in Bioengineering and Biotechnology",
    year: "2024",
    type: "Research Article",
    doi: "10.3389/fbioe.2024.XXXXX",
    relevance: "Demonstrates EIS-based breast tissue classification using I0 and DR features as primary discriminators between tissue types.",
  },
];

const targetAudience = [
  { icon: GraduationCap, title: "Biomedical Researchers", desc: "Exploring novel diagnostic approaches beyond traditional histopathology" },
  { icon: Users, title: "AI Healthcare Researchers", desc: "Developing machine learning models for medical signal analysis" },
  { icon: FileText, title: "Oncology Specialists", desc: "Seeking objective, quantitative diagnostic criteria for clinical use" },
  { icon: BookOpen, title: "Medical Physicists", desc: "Bridging condensed matter physics with clinical diagnostic applications" },
];

export default function Publications() {
  usePageMeta({
    title: "Publications & References",
    description: "Key literature and research supporting the quantum-integrated cancer diagnostics platform's scientific foundation.",
  });

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={0}>
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-publications-title">
            Publications & References
          </h1>
          <p className="text-sm text-muted-foreground">
            Key literature and research supporting the platform's scientific foundation
          </p>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={1}>
        <h2 className="text-lg font-semibold text-foreground mb-3">Key References</h2>
        <div className="flex flex-col gap-4">
          {references.map((ref, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="secondary">{ref.type}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {ref.year}
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1 leading-snug" data-testid={`text-ref-title-${i}`}>
                      {ref.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">{ref.authors}</p>
                    <p className="text-xs text-muted-foreground italic mb-2">{ref.journal}</p>
                    <div className="bg-muted/50 dark:bg-muted/30 rounded-md p-3 mb-2">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Relevance: </span>
                        {ref.relevance}
                      </p>
                    </div>
                    {ref.doi && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <ExternalLink className="w-3 h-3" />
                        <span className="font-mono">DOI: {ref.doi}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <Separator />

      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={3}>
        <h2 className="text-lg font-semibold text-foreground mb-3">Project Documentation</h2>
        <Card>
          <CardContent className="p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h3 className="text-sm font-semibold text-foreground mb-3">Project Overview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                This project explores a next-generation approach to cancer diagnostics by integrating
                principles from quantum physics, biophysics, and artificial intelligence. Instead of
                relying solely on stained microscopy images or traditional histopathology workflows,
                the proposed system investigates cancer as a measurable physical phenomenon.
              </p>

              <h3 className="text-sm font-semibold text-foreground mb-3">Current Development Stage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                The project is currently in research and prototyping phase. Active work includes:
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mb-4">
                {[
                  "Dataset structuring and validation",
                  "Model optimization and hyperparameter tuning",
                  "Quantum-inspired feature engineering",
                  "Validation improvement strategies",
                  "Conceptual system architecture",
                  "Multimodal fusion development",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 dark:bg-muted/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-chart-4 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-sm font-semibold text-foreground mb-3">Methodology Notes</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The AI pipeline employs a three-modality approach: (1) Raman spectroscopy analyzed through
                quantum-inspired features including wavelet energy, spectral/Renyi entropy, and peak
                characteristics, classified by a multi-layer perceptron; (2) Electrical impedance
                spectroscopy using balanced logistic regression with threshold calibration; (3) Late fusion
                combining both modalities with downsampled, leakage-reduced pairing to avoid class imbalance
                in the meta-classifier.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={4}>
        <h2 className="text-lg font-semibold text-foreground mb-3">Target Audience</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {targetAudience.map((item) => (
            <Card key={item.title} className="h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={5}>
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Disclaimer
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-lg mx-auto">
              This platform represents an ongoing research initiative. The diagnostic models and
              approaches presented are for research and academic purposes. Clinical validation
              and regulatory approval would be required before any diagnostic application.
              The project does not claim the use of full-scale quantum computers.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
