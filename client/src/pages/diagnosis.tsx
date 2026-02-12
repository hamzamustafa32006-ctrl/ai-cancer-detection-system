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
} from "lucide-react";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/queryClient";
import { tissueClassLabels } from "@shared/schema";
import type { Prediction } from "@shared/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useToast } from "@/hooks/use-toast";

interface BatchResultItem {
  row: number;
  prediction: Prediction;
  result: {
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
}

interface BatchResponse {
  total: number;
  successful: number;
  failed: number;
  results: BatchResultItem[];
  errors: { row: number; message: string }[];
}

const EXPECTED_COLUMNS = ["I0", "PA500", "HFS", "DA", "Area", "A/DA", "MaxIP", "DR", "P"];

function generateSampleCSV(): string {
  const header = EXPECTED_COLUMNS.join(",");
  const rows = [
    "500,0.2,0.1,200,8000,35,70,180,550",
    "2000,0.06,0.05,300,10000,30,100,280,1900",
    "350,0.15,0.08,80,1200,15,30,70,370",
  ];
  return [header, ...rows].join("\n");
}

export default function Diagnosis() {
  usePageMeta({
    title: "Diagnosis - Tissue Classification",
    description: "Upload impedance spectroscopy data files for AI-powered tissue classification and cancer risk assessment.",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [batchResults, setBatchResults] = useState<BatchResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: history, isLoading: historyLoading } = useQuery<Prediction[]>({
    queryKey: ["/api/diagnosis-history"],
  });

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/diagnosis-batch", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to process file");
      }
      return res.json() as Promise<BatchResponse>;
    },
    onSuccess: (data) => {
      setBatchResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/diagnosis-history"] });
      const malCount = data.results.filter((r) => r.result.isMalignant).length;
      toast({
        title: "Analysis Complete",
        description: `${data.successful} samples analyzed. ${malCount} malignant detected.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        toast({
          title: "Invalid File",
          description: "Please upload a CSV file (.csv)",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setBatchResults(null);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      setBatchResults(null);
      mutation.mutate(selectedFile);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setBatchResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadSample = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_impedance_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      setSelectedFile(file);
      setBatchResults(null);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file (.csv)",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto" data-testid="page-diagnosis">
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
              Upload a CSV file with impedance spectroscopy measurements for AI-powered tissue classification
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
              <CardTitle className="text-sm font-medium">Upload Data File</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadSample}
                data-testid="button-download-sample"
              >
                <Download className="w-4 h-4 mr-1" />
                Sample CSV
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer transition-colors hover:border-primary/50"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                data-testid="dropzone-file"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-file"
                />
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileSpreadsheet className="w-10 h-10 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground" data-testid="text-filename">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      data-testid="button-remove-file"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-10 h-10 text-muted-foreground/40" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        CSV file with impedance measurements
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 dark:bg-muted/30 rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Required CSV columns:</p>
                <div className="flex flex-wrap gap-1">
                  {EXPECTED_COLUMNS.map((col) => (
                    <Badge key={col} variant="secondary" className="font-mono text-[10px]">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                disabled={!selectedFile || mutation.isPending}
                onClick={handleUpload}
                data-testid="button-submit-diagnosis"
              >
                {mutation.isPending ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Run Diagnosis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {batchResults ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3 space-y-0">
                  <CardTitle className="text-sm font-medium" data-testid="text-batch-summary">
                    Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-muted/50 dark:bg-muted/30 rounded-md">
                      <div className="text-lg font-bold font-mono text-foreground" data-testid="text-total-count">
                        {batchResults.total}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</div>
                    </div>
                    <div className="text-center p-2 bg-destructive/10 dark:bg-destructive/5 rounded-md">
                      <div className="text-lg font-bold font-mono text-destructive" data-testid="text-malignant-count">
                        {batchResults.results.filter((r) => r.result.isMalignant).length}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Malignant</div>
                    </div>
                    <div className="text-center p-2 bg-chart-4/10 rounded-md">
                      <div className="text-lg font-bold font-mono text-chart-4" data-testid="text-benign-count">
                        {batchResults.results.filter((r) => !r.result.isMalignant).length}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Benign</div>
                    </div>
                  </div>

                  {batchResults.errors.length > 0 && (
                    <div className="bg-destructive/10 dark:bg-destructive/5 border border-destructive/20 rounded-md p-3">
                      <p className="text-xs text-destructive font-medium mb-1">
                        {batchResults.errors.length} row(s) had errors:
                      </p>
                      {batchResults.errors.map((err, i) => (
                        <p key={i} className="text-[10px] text-muted-foreground">
                          Row {err.row}: {err.message}
                        </p>
                      ))}
                    </div>
                  )}

                  {batchResults.results.some((r) => r.result.isMalignant) && (
                    <div className="bg-destructive/10 dark:bg-destructive/5 border border-destructive/20 rounded-md p-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-destructive">Important: </span>
                        AI predictions are for research support only. Confirm with standard clinical pathology.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileSpreadsheet className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground" data-testid="text-no-result">
                  Upload a CSV file with impedance measurements to see classification results
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {batchResults && batchResults.results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Batch Results
              </CardTitle>
              <Badge variant="secondary" data-testid="badge-results-count">
                {batchResults.results.length} samples
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-batch-results">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Row</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Result</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Confidence</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Votes</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">I0</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">DA</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">DR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchResults.results.map((item) => (
                      <tr key={item.row} className="border-b border-border last:border-b-0" data-testid={`row-result-${item.row}`}>
                        <td className="p-2 text-xs font-mono text-muted-foreground">{item.row}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-1.5">
                            {item.result.isMalignant ? (
                              <AlertTriangle className="w-3 h-3 text-destructive flex-shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 text-chart-4 flex-shrink-0" />
                            )}
                            <Badge variant={item.result.isMalignant ? "destructive" : "secondary"}>
                              {item.result.predictedLabel}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-2 text-xs font-mono text-foreground">
                          {(item.result.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="p-2 text-xs font-mono text-muted-foreground">
                          {item.result.details.malignantVotes}/{item.result.details.totalNeighbors}
                        </td>
                        <td className="p-2 text-xs font-mono text-muted-foreground">{item.prediction.i0.toFixed(1)}</td>
                        <td className="p-2 text-xs font-mono text-muted-foreground">{item.prediction.da.toFixed(1)}</td>
                        <td className="p-2 text-xs font-mono text-muted-foreground">{item.prediction.dr.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
              No predictions yet. Upload your first file above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
