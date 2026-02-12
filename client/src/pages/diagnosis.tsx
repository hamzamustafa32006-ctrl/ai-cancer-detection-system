import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Upload,
  FileSpreadsheet,
  X,
  Download,
  Activity,
  Zap,
  Waves,
} from "lucide-react";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/queryClient";
import { tissueClassLabels } from "@shared/schema";
import type { Prediction } from "@shared/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

interface RamanAnalysis {
  totalPoints: number;
  shiftRange: { min: number; max: number };
  meanIntensity: number;
  maxIntensity: number;
  maxIntensityShift: number;
  stdIntensity: number;
  areaUnderCurve: number;
  peaks: { shift: number; intensity: number }[];
  snr: number;
  spectrum: { shift: number; intensity: number }[];
}

interface DiagnosisResponse {
  prediction: Prediction;
  impedanceResult: {
    predictedClass: string;
    predictedLabel: string;
    confidence: number;
    isMalignant: boolean;
    nearestClasses: string[];
    details: {
      malignantVotes: number;
      benignVotes: number;
      totalNeighbors: number;
      topClass: string;
      topClassLabel: string;
    };
  };
  ramanAnalysis: RamanAnalysis;
}

function generateSampleImpedanceCSV(): string {
  return "I0,PA500,HFS,DA,Area,A/DA,MaxIP,DR,P\n500,0.2,0.1,200,8000,35,70,180,550";
}

function generateSampleRamanCSV(): string {
  const lines = ["RamanShift,Intensity"];
  for (let s = 400; s <= 1800; s += 2) {
    const base = 100 + Math.sin((s - 400) / 200) * 30;
    const peak1 = 300 * Math.exp(-((s - 1002) ** 2) / 200);
    const peak2 = 200 * Math.exp(-((s - 1450) ** 2) / 300);
    const peak3 = 150 * Math.exp(-((s - 785) ** 2) / 150);
    const noise = (Math.random() - 0.5) * 10;
    lines.push(`${s},${(base + peak1 + peak2 + peak3 + noise).toFixed(2)}`);
  }
  return lines.join("\n");
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface FileUploadBoxProps {
  label: string;
  icon: React.ReactNode;
  file: File | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  testIdPrefix: string;
  description: string;
}

function FileUploadBox({ label, icon, file, onFileSelect, onRemove, inputRef, testIdPrefix, description }: FileUploadBoxProps) {
  const { toast } = useToast();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.name.endsWith(".csv")) {
      onFileSelect(f);
    } else {
      toast({ title: "Invalid File", description: "Please upload a CSV file (.csv)", variant: "destructive" });
    }
  };

  return (
    <div
      className="border-2 border-dashed border-border rounded-md p-5 text-center cursor-pointer transition-colors hover:border-primary/50"
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      data-testid={`dropzone-${testIdPrefix}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelect(f);
        }}
        className="hidden"
        data-testid={`input-${testIdPrefix}`}
      />
      {file ? (
        <div className="flex flex-col items-center gap-1.5">
          <FileSpreadsheet className="w-8 h-8 text-primary" />
          <p className="text-sm font-medium text-foreground" data-testid={`text-${testIdPrefix}-filename`}>
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            data-testid={`button-remove-${testIdPrefix}`}
          >
            <X className="w-3 h-3 mr-1" />
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5">
          {icon}
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      )}
    </div>
  );
}

export default function Diagnosis() {
  usePageMeta({
    title: "Diagnosis - Tissue Classification",
    description: "Upload impedance and Raman spectroscopy data for AI-powered tissue classification.",
  });

  const [impedanceFile, setImpedanceFile] = useState<File | null>(null);
  const [ramanFile, setRamanFile] = useState<File | null>(null);
  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const impedanceRef = useRef<HTMLInputElement>(null);
  const ramanRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: history, isLoading: historyLoading } = useQuery<Prediction[]>({
    queryKey: ["/api/diagnosis-history"],
  });

  const mutation = useMutation({
    mutationFn: async ({ impedance, raman }: { impedance: File; raman: File }) => {
      const formData = new FormData();
      formData.append("impedanceFile", impedance);
      formData.append("ramanFile", raman);
      const res = await fetch("/api/diagnosis", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to process files");
      }
      return res.json() as Promise<DiagnosisResponse>;
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/diagnosis-history"] });
      toast({
        title: "Analysis Complete",
        description: `Classification: ${data.impedanceResult.predictedLabel}`,
      });
    },
    onError: (error) => {
      toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (impedanceFile && ramanFile) {
      setResult(null);
      mutation.mutate({ impedance: impedanceFile, raman: ramanFile });
    }
  };

  const handleReset = () => {
    setImpedanceFile(null);
    setRamanFile(null);
    setResult(null);
    if (impedanceRef.current) impedanceRef.current.value = "";
    if (ramanRef.current) ramanRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto" data-testid="page-diagnosis">
      <div className="flex flex-col gap-1 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-diagnosis-title">
              Tissue Diagnosis
            </h1>
            <p className="text-sm text-muted-foreground">
              Upload impedance and Raman spectroscopy files for the same tissue sample
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
          <CardTitle className="text-sm font-medium">Upload Sample Data</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadCSV(generateSampleImpedanceCSV(), "sample_impedance.csv")}
              data-testid="button-download-impedance-sample"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Impedance
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadCSV(generateSampleRamanCSV(), "sample_raman.csv")}
              data-testid="button-download-raman-sample"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Raman
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Zap className="w-3.5 h-3.5" />
                <span>Impedance Spectroscopy</span>
              </div>
              <FileUploadBox
                label="Impedance Data File"
                icon={<Zap className="w-8 h-8 text-muted-foreground/40" />}
                file={impedanceFile}
                onFileSelect={setImpedanceFile}
                onRemove={() => { setImpedanceFile(null); if (impedanceRef.current) impedanceRef.current.value = ""; }}
                inputRef={impedanceRef}
                testIdPrefix="impedance"
                description="CSV with I0, PA500, HFS, DA, Area, A/DA, MaxIP, DR, P"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Waves className="w-3.5 h-3.5" />
                <span>Raman Spectroscopy</span>
              </div>
              <FileUploadBox
                label="Raman Data File"
                icon={<Waves className="w-8 h-8 text-muted-foreground/40" />}
                file={ramanFile}
                onFileSelect={setRamanFile}
                onRemove={() => { setRamanFile(null); if (ramanRef.current) ramanRef.current.value = ""; }}
                inputRef={ramanRef}
                testIdPrefix="raman"
                description="CSV with RamanShift, Intensity columns"
              />
            </div>
          </div>

          <Button
            className="w-full"
            disabled={!impedanceFile || !ramanFile || mutation.isPending}
            onClick={handleSubmit}
            data-testid="button-submit-diagnosis"
          >
            {mutation.isPending ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing Both Spectra...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Run Combined Diagnosis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          <Card className={result.impedanceResult.isMalignant ? "border-destructive/50" : "border-chart-4/50"}>
            <CardHeader className="pb-3 space-y-0">
              <div className="flex items-center gap-2">
                {result.impedanceResult.isMalignant ? (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-chart-4" />
                )}
                <CardTitle className="text-sm font-medium" data-testid="text-result-label">
                  {result.impedanceResult.isMalignant ? "Malignant Detected" : "Benign Classification"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-2">
                <div
                  className={`text-2xl font-bold font-mono mb-1 ${
                    result.impedanceResult.isMalignant ? "text-destructive" : "text-chart-4"
                  }`}
                  data-testid="text-result-class"
                >
                  {result.impedanceResult.predictedLabel}
                </div>
                <div className="text-sm text-muted-foreground" data-testid="text-result-confidence">
                  Confidence: {(result.impedanceResult.confidence * 100).toFixed(1)}%
                </div>
              </div>

              <div className="bg-muted/50 dark:bg-muted/30 rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Impedance Classification</span>
                  <Badge variant="secondary">
                    <Zap className="w-3 h-3 mr-1" />
                    KNN (K=7)
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Malignant Votes</span>
                  <span className="font-mono font-semibold text-foreground" data-testid="text-malignant-votes">
                    {result.impedanceResult.details.malignantVotes}/{result.impedanceResult.details.totalNeighbors}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Benign Votes</span>
                  <span className="font-mono font-semibold text-foreground" data-testid="text-benign-votes">
                    {result.impedanceResult.details.benignVotes}/{result.impedanceResult.details.totalNeighbors}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Nearest Neighbors</span>
                <div className="flex flex-wrap items-center justify-center gap-1 mt-1">
                  {result.impedanceResult.nearestClasses.map((cls, i) => (
                    <Badge key={i} variant={cls === "car" ? "destructive" : "secondary"} data-testid={`badge-neighbor-${i}`}>
                      {tissueClassLabels[cls] || cls}
                    </Badge>
                  ))}
                </div>
              </div>

              {result.impedanceResult.isMalignant && (
                <div className="bg-destructive/10 dark:bg-destructive/5 border border-destructive/20 rounded-md p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-destructive">Important: </span>
                    AI predictions are for research support only. Confirm with standard clinical pathology.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 space-y-0">
              <div className="flex items-center gap-2">
                <Waves className="w-5 h-5 text-primary" />
                <CardTitle className="text-sm font-medium" data-testid="text-raman-title">
                  Raman Spectrum Analysis
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-48" data-testid="chart-raman-spectrum">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.ramanAnalysis.spectrum}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="shift"
                      tick={{ fontSize: 10 }}
                      label={{ value: "Raman Shift (cm⁻¹)", position: "insideBottom", offset: -2, style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      label={{ value: "Intensity", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 11, backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                      labelFormatter={(v) => `${v} cm⁻¹`}
                    />
                    <Line type="monotone" dataKey="intensity" stroke="hsl(var(--primary))" dot={false} strokeWidth={1.5} />
                    {result.ramanAnalysis.peaks.slice(0, 5).map((peak, i) => (
                      <ReferenceDot
                        key={i}
                        x={peak.shift}
                        y={peak.intensity}
                        r={4}
                        fill="hsl(var(--destructive))"
                        stroke="hsl(var(--destructive))"
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/50 dark:bg-muted/30 rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Data Points</span>
                  <span className="font-mono text-foreground" data-testid="text-raman-points">{result.ramanAnalysis.totalPoints}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Shift Range</span>
                  <span className="font-mono text-foreground">{result.ramanAnalysis.shiftRange.min} - {result.ramanAnalysis.shiftRange.max} cm⁻¹</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Max Intensity</span>
                  <span className="font-mono text-foreground">{result.ramanAnalysis.maxIntensity} at {result.ramanAnalysis.maxIntensityShift} cm⁻¹</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">SNR</span>
                  <span className="font-mono text-foreground" data-testid="text-raman-snr">{result.ramanAnalysis.snr}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Area Under Curve</span>
                  <span className="font-mono text-foreground">{result.ramanAnalysis.areaUnderCurve.toLocaleString()}</span>
                </div>
              </div>

              {result.ramanAnalysis.peaks.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Detected Peaks</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.ramanAnalysis.peaks.slice(0, 6).map((peak, i) => (
                      <Badge key={i} variant="secondary" className="font-mono text-[10px]" data-testid={`badge-peak-${i}`}>
                        {peak.shift} cm⁻¹
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!result && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Zap className="w-8 h-8 text-muted-foreground/30" />
              <span className="text-2xl text-muted-foreground/30">+</span>
              <Waves className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground" data-testid="text-no-result">
              Upload both impedance and Raman spectroscopy files for the same sample to get a combined diagnosis
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Predictions
          </CardTitle>
          {history && (
            <Badge variant="secondary" data-testid="badge-history-count">
              {history.length} records
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-history">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Result</th>
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Confidence</th>
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">I0</th>
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">DA</th>
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">DR</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((pred) => (
                    <tr key={pred.id} className="border-b border-border last:border-b-0" data-testid={`row-prediction-${pred.id}`}>
                      <td className="p-2 text-xs text-muted-foreground font-mono">
                        {new Date(pred.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="p-2">
                        <Badge variant={pred.isMalignant ? "destructive" : "secondary"}>
                          {tissueClassLabels[pred.predictedClass] || (pred.isMalignant ? "Malignant" : "Benign")}
                        </Badge>
                      </td>
                      <td className="p-2 text-xs font-mono text-foreground">
                        {(pred.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="p-2 text-xs font-mono text-muted-foreground">{pred.i0.toFixed(1)}</td>
                      <td className="p-2 text-xs font-mono text-muted-foreground">{pred.da.toFixed(1)}</td>
                      <td className="p-2 text-xs font-mono text-muted-foreground">{pred.dr.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6" data-testid="text-no-history">
              No predictions yet. Upload your first sample files above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
