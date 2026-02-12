export interface RamanDataPoint {
  shift: number;
  intensity: number;
}

export interface RamanAnalysis {
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

export function parseRamanCSV(csvText: string): RamanDataPoint[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("Raman CSV must have a header and data rows");

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const shiftIdx = header.findIndex((h) =>
    h.includes("raman") || h.includes("shift") || h.includes("wavenumber") || h.includes("cm")
  );
  const intensityIdx = header.findIndex((h) =>
    h.includes("intensity") || h.includes("int") || h.includes("counts")
  );

  if (shiftIdx === -1 || intensityIdx === -1) {
    throw new Error("Raman CSV must have RamanShift and Intensity columns");
  }

  const data: RamanDataPoint[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(",").map((c) => c.trim());
    const shift = parseFloat(cols[shiftIdx]);
    const intensity = parseFloat(cols[intensityIdx]);
    if (!isNaN(shift) && !isNaN(intensity)) {
      data.push({ shift, intensity });
    }
  }

  if (data.length === 0) throw new Error("No valid Raman data points found");
  data.sort((a, b) => a.shift - b.shift);
  return data;
}

function findPeaks(data: RamanDataPoint[], windowSize = 5, threshold = 0.3): { shift: number; intensity: number }[] {
  const peaks: { shift: number; intensity: number }[] = [];
  const intensities = data.map((d) => d.intensity);
  const maxVal = Math.max(...intensities);
  const minVal = Math.min(...intensities);
  const range = maxVal - minVal || 1;

  for (let i = windowSize; i < data.length - windowSize; i++) {
    let isPeak = true;
    for (let j = 1; j <= windowSize; j++) {
      if (data[i].intensity <= data[i - j].intensity || data[i].intensity <= data[i + j].intensity) {
        isPeak = false;
        break;
      }
    }
    if (isPeak && (data[i].intensity - minVal) / range > threshold) {
      peaks.push({ shift: Math.round(data[i].shift), intensity: Math.round(data[i].intensity * 100) / 100 });
    }
  }

  peaks.sort((a, b) => b.intensity - a.intensity);
  return peaks.slice(0, 10);
}

export function analyzeRamanSpectrum(data: RamanDataPoint[]): RamanAnalysis {
  const intensities = data.map((d) => d.intensity);
  const shifts = data.map((d) => d.shift);

  const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
  const maxIntensity = Math.max(...intensities);
  const maxIdx = intensities.indexOf(maxIntensity);
  const variance = intensities.reduce((a, v) => a + (v - mean) ** 2, 0) / intensities.length;
  const std = Math.sqrt(variance);

  let auc = 0;
  for (let i = 1; i < data.length; i++) {
    auc += ((data[i].intensity + data[i - 1].intensity) / 2) * (data[i].shift - data[i - 1].shift);
  }

  const noise = intensities.slice(0, Math.min(20, intensities.length));
  const noiseMean = noise.reduce((a, b) => a + b, 0) / noise.length;
  const noiseStd = Math.sqrt(noise.reduce((a, v) => a + (v - noiseMean) ** 2, 0) / noise.length) || 1;
  const snr = (maxIntensity - noiseMean) / noiseStd;

  const peaks = findPeaks(data);

  const step = Math.max(1, Math.floor(data.length / 200));
  const spectrum = data.filter((_, i) => i % step === 0).map((d) => ({
    shift: Math.round(d.shift),
    intensity: Math.round(d.intensity * 100) / 100,
  }));

  return {
    totalPoints: data.length,
    shiftRange: { min: Math.round(Math.min(...shifts)), max: Math.round(Math.max(...shifts)) },
    meanIntensity: Math.round(mean * 100) / 100,
    maxIntensity: Math.round(maxIntensity * 100) / 100,
    maxIntensityShift: Math.round(data[maxIdx].shift),
    stdIntensity: Math.round(std * 100) / 100,
    areaUnderCurve: Math.round(auc),
    peaks,
    snr: Math.round(snr * 10) / 10,
    spectrum,
  };
}
