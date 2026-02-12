import type { ImpedanceSample, DiagnosisInput } from "@shared/schema";
import { tissueClassLabels } from "@shared/schema";

const FEATURES: (keyof DiagnosisInput)[] = ["i0", "pa500", "hfs", "da", "area", "aDa", "maxIp", "dr", "p"];
const K = 7;

interface PredictionResult {
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
}

function getFeatureVector(sample: DiagnosisInput | ImpedanceSample): number[] {
  return FEATURES.map((f) => sample[f] as number);
}

function computeStats(samples: ImpedanceSample[]) {
  const n = samples.length;
  const means: number[] = [];
  const stds: number[] = [];

  for (let fi = 0; fi < FEATURES.length; fi++) {
    const values = samples.map((s) => s[FEATURES[fi]] as number);
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / n;
    means.push(mean);
    stds.push(Math.sqrt(variance) || 1);
  }

  return { means, stds };
}

function standardize(vec: number[], means: number[], stds: number[]): number[] {
  return vec.map((v, i) => (v - means[i]) / stds[i]);
}

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

export function predict(input: DiagnosisInput, trainingData: ImpedanceSample[]): PredictionResult {
  const { means, stds } = computeStats(trainingData);
  const inputVec = standardize(getFeatureVector(input), means, stds);

  const distances = trainingData.map((sample) => {
    const sampleVec = standardize(getFeatureVector(sample), means, stds);
    return {
      distance: euclideanDistance(inputVec, sampleVec),
      tissueClass: sample.tissueClass,
    };
  });

  distances.sort((a, b) => a.distance - b.distance);
  const neighbors = distances.slice(0, K);

  const classCounts: Record<string, number> = {};
  neighbors.forEach((n) => {
    classCounts[n.tissueClass] = (classCounts[n.tissueClass] || 0) + 1;
  });

  const malignantVotes = classCounts["car"] || 0;
  const benignVotes = K - malignantVotes;
  const isMalignant = malignantVotes > benignVotes;

  let predictedClass: string;
  if (isMalignant) {
    predictedClass = "car";
  } else {
    const benignCounts = Object.entries(classCounts)
      .filter(([cls]) => cls !== "car")
      .sort((a, b) => b[1] - a[1]);
    predictedClass = benignCounts.length > 0 ? benignCounts[0][0] : "adi";
  }

  const confidence = isMalignant
    ? malignantVotes / K
    : benignVotes / K;

  return {
    predictedClass,
    predictedLabel: isMalignant
      ? "Carcinoma (Malignant)"
      : tissueClassLabels[predictedClass] || "Benign",
    confidence: Math.round(confidence * 1000) / 1000,
    isMalignant,
    nearestClasses: neighbors.map((n) => n.tissueClass),
    details: {
      malignantVotes,
      benignVotes,
      totalNeighbors: K,
      topClass: predictedClass,
      topClassLabel: tissueClassLabels[predictedClass] || predictedClass,
    },
  };
}
