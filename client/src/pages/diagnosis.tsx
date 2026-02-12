import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Send,
  RotateCcw,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { diagnosisInputSchema, tissueClassLabels } from "@shared/schema";
import type { DiagnosisInput, Prediction } from "@shared/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useToast } from "@/hooks/use-toast";

const featureInfo = [
  { key: "i0" as const, label: "I0", desc: "Impedance at zero frequency", unit: "Ohm", placeholder: "e.g. 500" },
  { key: "pa500" as const, label: "PA500", desc: "Phase angle at 500 kHz", unit: "Rad", placeholder: "e.g. 0.2" },
  { key: "hfs" as const, label: "HFS", desc: "High frequency slope", unit: "", placeholder: "e.g. 0.1" },
  { key: "da" as const, label: "DA", desc: "Impedance distance", unit: "Ohm", placeholder: "e.g. 200" },
  { key: "area" as const, label: "Area", desc: "Spectral area under curve", unit: "", placeholder: "e.g. 8000" },
  { key: "aDa" as const, label: "A/DA", desc: "Area to distance ratio", unit: "", placeholder: "e.g. 35" },
  { key: "maxIp" as const, label: "Max IP", desc: "Maximum of impedance peak", unit: "Ohm", placeholder: "e.g. 70" },
  { key: "dr" as const, label: "DR", desc: "Distance measure R", unit: "Ohm", placeholder: "e.g. 180" },
  { key: "p" as const, label: "P", desc: "Perimeter measure", unit: "Ohm", placeholder: "e.g. 550" },
];

interface DiagnosisResult {
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

export default function Diagnosis() {
  usePageMeta({
    title: "Diagnosis - Tissue Classification",
    description: "Input breast tissue electrical impedance spectroscopy measurements for AI-powered classification and cancer risk assessment.",
  });

  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const { toast } = useToast();

  const form = useForm<DiagnosisInput>({
    resolver: zodResolver(diagnosisInputSchema),
    defaultValues: {
      i0: undefined,
      pa500: undefined,
      hfs: undefined,
      da: undefined,
      area: undefined,
      aDa: undefined,
      maxIp: undefined,
      dr: undefined,
      p: undefined,
    },
  });

  const { data: history, isLoading: historyLoading } = useQuery<Prediction[]>({
    queryKey: ["/api/diagnosis-history"],
  });

  const mutation = useMutation({
    mutationFn: async (data: DiagnosisInput) => {
      const res = await apiRequest("POST", "/api/diagnosis", data);
      return res.json() as Promise<DiagnosisResult>;
    },
    onSuccess: (data) => {
      setDiagnosisResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/diagnosis-history"] });
      toast({
        title: "Analysis Complete",
        description: `Prediction: ${data.result.predictedLabel}`,
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

  const onSubmit = (data: DiagnosisInput) => {
    setDiagnosisResult(null);
    mutation.mutate(data);
  };

  const handleReset = () => {
    form.reset();
    setDiagnosisResult(null);
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
              Enter impedance spectroscopy measurements for AI-powered tissue classification
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
              <CardTitle className="text-sm font-medium">Impedance Measurements</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                data-testid="button-reset-form"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {featureInfo.map((feat) => (
                      <FormField
                        key={feat.key}
                        control={form.control}
                        name={feat.key}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              <span className="font-mono text-primary">{feat.label}</span>
                              {feat.unit && <span className="text-muted-foreground ml-1">({feat.unit})</span>}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                placeholder={feat.placeholder}
                                data-testid={`input-${feat.key}`}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  field.onChange(val === "" ? undefined : parseFloat(val));
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>All 9 impedance features are required for accurate classification</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={mutation.isPending}
                    data-testid="button-submit-diagnosis"
                  >
                    {mutation.isPending ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Run Diagnosis
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {diagnosisResult ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={diagnosisResult.result.isMalignant ? "border-destructive/50" : "border-chart-4/50"}>
                <CardHeader className="pb-3 space-y-0">
                  <div className="flex items-center gap-2">
                    {diagnosisResult.result.isMalignant ? (
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-chart-4" />
                    )}
                    <CardTitle className="text-sm font-medium" data-testid="text-result-label">
                      {diagnosisResult.result.isMalignant ? "Malignant Detected" : "Benign Classification"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-3">
                    <div
                      className={`text-2xl font-bold font-mono mb-1 ${
                        diagnosisResult.result.isMalignant ? "text-destructive" : "text-chart-4"
                      }`}
                      data-testid="text-result-class"
                    >
                      {diagnosisResult.result.predictedLabel}
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid="text-result-confidence">
                      Confidence: {(diagnosisResult.result.confidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-muted/50 dark:bg-muted/30 rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">Malignant Votes</span>
                      <span className="font-mono font-semibold text-foreground" data-testid="text-malignant-votes">
                        {diagnosisResult.result.details.malignantVotes}/{diagnosisResult.result.details.totalNeighbors}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">Benign Votes</span>
                      <span className="font-mono font-semibold text-foreground" data-testid="text-benign-votes">
                        {diagnosisResult.result.details.benignVotes}/{diagnosisResult.result.details.totalNeighbors}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">Top Class</span>
                      <Badge variant="secondary" data-testid="badge-top-class">
                        {diagnosisResult.result.details.topClassLabel}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Nearest Neighbors
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-1 mt-1">
                      {diagnosisResult.result.nearestClasses.map((cls, i) => (
                        <Badge
                          key={i}
                          variant={cls === "car" ? "destructive" : "secondary"}
                          data-testid={`badge-neighbor-${i}`}
                        >
                          {tissueClassLabels[cls] || cls}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {diagnosisResult.result.isMalignant && (
                    <div className="bg-destructive/10 dark:bg-destructive/5 border border-destructive/20 rounded-md p-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-destructive">Important: </span>
                        This AI prediction is for research support only. Always confirm with
                        standard clinical pathology methods before making diagnostic decisions.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Stethoscope className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground" data-testid="text-no-result">
                  Enter impedance measurements and click "Run Diagnosis" to see classification results
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
              No predictions yet. Run your first diagnosis above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
