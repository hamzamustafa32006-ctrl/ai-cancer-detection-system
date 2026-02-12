import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Activity, Database, Layers, TrendingUp } from "lucide-react";
import type { ImpedanceSample } from "@shared/schema";
import { tissueClassLabels, tissueClassColors } from "@shared/schema";
import { usePageMeta } from "@/hooks/use-page-meta";

const CLASS_COLORS: Record<string, string> = {
  car: "#ef4444",
  fad: "#eab308",
  mas: "#3b82f6",
  gla: "#22c55e",
  con: "#8b5cf6",
  adi: "#f97316",
};

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="py-5 px-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardContent className="py-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        <Card><CardContent className="py-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  usePageMeta({
    title: "Dashboard - Impedance Data Visualization",
    description: "Interactive visualization of breast tissue electrical impedance spectroscopy data across 6 tissue classes with scatter plots, radar charts, and distribution analysis.",
  });

  const { data: samples, isLoading } = useQuery<ImpedanceSample[]>({
    queryKey: ["/api/impedance-samples"],
  });

  if (isLoading || !samples) return <DashboardSkeleton />;

  const classCounts = samples.reduce<Record<string, number>>((acc, s) => {
    acc[s.tissueClass] = (acc[s.tissueClass] || 0) + 1;
    return acc;
  }, {});

  const distributionData = Object.entries(classCounts).map(([cls, count]) => ({
    name: tissueClassLabels[cls] || cls,
    value: count,
    cls,
  }));

  const classAverages = Object.keys(classCounts).map((cls) => {
    const classSamples = samples.filter((s) => s.tissueClass === cls);
    const avg = (field: keyof ImpedanceSample) =>
      classSamples.reduce((sum, s) => sum + (s[field] as number), 0) / classSamples.length;
    return {
      name: tissueClassLabels[cls] || cls,
      cls,
      I0: Math.round(avg("i0")),
      DA: Math.round(avg("da") * 10) / 10,
      MaxIP: Math.round(avg("maxIp") * 10) / 10,
      P: Math.round(avg("p")),
      Area: Math.round(avg("area")),
    };
  });

  const radarData = Object.keys(classCounts).map((cls) => {
    const classSamples = samples.filter((s) => s.tissueClass === cls);
    const normalize = (field: keyof ImpedanceSample) => {
      const values = samples.map((s) => s[field] as number);
      const max = Math.max(...values);
      const min = Math.min(...values);
      const classAvg = classSamples.reduce((sum, s) => sum + (s[field] as number), 0) / classSamples.length;
      return max === min ? 0.5 : (classAvg - min) / (max - min);
    };
    return {
      cls,
      name: tissueClassLabels[cls] || cls,
      I0: normalize("i0"),
      PA500: normalize("pa500"),
      HFS: normalize("hfs"),
      DA: normalize("da"),
      Area: normalize("area"),
      MaxIP: normalize("maxIp"),
      DR: normalize("dr"),
      P: normalize("p"),
    };
  });

  const radarFeatures = ["I0", "PA500", "HFS", "DA", "Area", "MaxIP", "DR", "P"];
  const radarChartData = radarFeatures.map((feature) => {
    const entry: Record<string, string | number> = { feature };
    radarData.forEach((rd) => {
      entry[rd.name] = Math.round((rd as Record<string, number>)[feature] * 100) / 100;
    });
    return entry;
  });

  const scatterData = samples.map((s) => ({
    x: s.i0,
    y: s.dr,
    cls: s.tissueClass,
    name: tissueClassLabels[s.tissueClass] || s.tissueClass,
  }));

  const carcinomaSamples = samples.filter((s) => s.tissueClass === "car").length;
  const totalSamples = samples.length;
  const features = 9;

  return (
    <div className="flex flex-col gap-4 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-dashboard-title">
          Impedance Data Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Interactive visualization of breast tissue electrical impedance spectroscopy data
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-5 px-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Samples</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground" data-testid="text-total-samples">
              {totalSamples}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 px-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Classes</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground" data-testid="text-total-classes">
              {Object.keys(classCounts).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 px-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Features</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground" data-testid="text-total-features">
              {features}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 px-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Carcinoma</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground" data-testid="text-carcinoma-count">
              {carcinomaSamples}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({Math.round((carcinomaSamples / totalSamples) * 100)}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution" className="w-full">
        <TabsList data-testid="tabs-chart-selector">
          <TabsTrigger value="distribution" data-testid="tab-distribution">Distribution</TabsTrigger>
          <TabsTrigger value="scatter" data-testid="tab-scatter">I0 vs DR</TabsTrigger>
          <TabsTrigger value="comparison" data-testid="tab-comparison">Class Comparison</TabsTrigger>
          <TabsTrigger value="radar" data-testid="tab-radar">Feature Radar</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sample Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                          fontSize: 12,
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {distributionData.map((entry) => (
                          <Cell key={entry.cls} fill={CLASS_COLORS[entry.cls] || "#888"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {distributionData.map((entry) => (
                          <Cell key={entry.cls} fill={CLASS_COLORS[entry.cls] || "#888"} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                          fontSize: 12,
                          color: "hsl(var(--foreground))",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scatter">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">I0 vs DR Scatter Plot</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Key discriminating impedance features for tissue classification
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CLASS_COLORS).map(([cls, color]) => (
                  <div key={cls} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] text-muted-foreground">{tissueClassLabels[cls]}</span>
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="x"
                      name="I0"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      label={{ value: "I0 (Initial Impedance)", position: "insideBottom", offset: -5, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      dataKey="y"
                      name="DR"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      label={{ value: "DR", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: 12,
                        color: "hsl(var(--foreground))",
                      }}
                      formatter={(value: number) => value.toFixed(2)}
                    />
                    {Object.keys(CLASS_COLORS).map((cls) => (
                      <Scatter
                        key={cls}
                        name={tissueClassLabels[cls] || cls}
                        data={scatterData.filter((d) => d.cls === cls)}
                        fill={CLASS_COLORS[cls]}
                        opacity={0.7}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Feature Values by Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classAverages}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: 12,
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="I0" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="P" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="MaxIP" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">Normalized Feature Radar</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Comparing tissue class profiles across all impedance features (0-1 normalized)
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarChartData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="feature"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <PolarRadiusAxis
                      tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                      domain={[0, 1]}
                    />
                    {radarData.map((rd) => (
                      <Radar
                        key={rd.cls}
                        name={rd.name}
                        dataKey={rd.name}
                        stroke={CLASS_COLORS[rd.cls]}
                        fill={CLASS_COLORS[rd.cls]}
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: 11,
                        color: "hsl(var(--foreground))",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tissue Class Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(tissueClassLabels).map(([cls, label]) => (
              <div key={cls} className="flex items-center gap-2" data-testid={`text-class-${cls}`}>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CLASS_COLORS[cls] || "#888" }} />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">{label}</span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{cls}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" data-testid="badge-malignant">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive mr-1.5" />
              Malignant: car
            </Badge>
            <Badge variant="outline" data-testid="badge-benign">
              <div className="w-1.5 h-1.5 rounded-full bg-chart-4 mr-1.5" />
              Benign: fad, mas, gla, con, adi
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
