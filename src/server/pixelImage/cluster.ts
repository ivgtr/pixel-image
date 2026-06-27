// Calculate the distance between two points in three dimensions
const getDistance = (point1: number[], point2: number[]) => {
  const x = point1[0] - point2[0];
  const y = point1[1] - point2[1];
  const z = point1[2] - point2[2];

  return x * x + y * y + z * z;
};

const MAX_ITER = 1000;

type ColorBucket = {
  key: string;
  point: number[];
  count: number;
};

const toColorKey = (point: number[]) => point.join(",");

const compareColorBuckets = (a: ColorBucket, b: ColorBucket) => {
  for (let i = 0; i < a.point.length; i++) {
    const diff = a.point[i] - b.point[i];
    if (diff !== 0) return diff;
  }

  return a.key.localeCompare(b.key);
};

const summarizeColors = (data: number[][]): ColorBucket[] => {
  const buckets = new Map<string, ColorBucket>();

  data.forEach((point) => {
    const key = toColorKey(point);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.count++;
      return;
    }

    buckets.set(key, {
      key,
      point: [...point],
      count: 1,
    });
  });

  return Array.from(buckets.values()).sort(compareColorBuckets);
};

const getWeightedMean = (buckets: ColorBucket[]): number[] => {
  const [r, g, b, count] = buckets.reduce(
    (acc, bucket) => {
      acc[0] += bucket.point[0] * bucket.count;
      acc[1] += bucket.point[1] * bucket.count;
      acc[2] += bucket.point[2] * bucket.count;
      acc[3] += bucket.count;
      return acc;
    },
    [0, 0, 0, 0],
  );

  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
};

const createInitialCentroids = (data: number[][], k: number): number[][] => {
  if (data.length === 0 || k <= 0) return [];

  const buckets = summarizeColors(data);
  if (buckets.length <= k) return buckets.map(({ point }) => [...point]);

  const weightedMean = getWeightedMean(buckets);
  const centroids = [weightedMean];
  const selectedKeys = new Set<string>();
  const weightedMeanKey = toColorKey(weightedMean);

  if (buckets.some((bucket) => bucket.key === weightedMeanKey)) {
    selectedKeys.add(weightedMeanKey);
  }

  while (centroids.length < k && selectedKeys.size < buckets.length) {
    let bestBucket: ColorBucket | undefined;
    let bestScore = -Infinity;

    buckets.forEach((bucket) => {
      if (selectedKeys.has(bucket.key)) return;

      const minDistance = Math.min(
        ...centroids.map((centroid) => getDistance(bucket.point, centroid)),
      );
      const score = minDistance * Math.max(1, Math.log2(bucket.count + 1));

      if (score > bestScore) {
        bestBucket = bucket;
        bestScore = score;
      }
    });

    if (!bestBucket) break;

    centroids.push([...bestBucket.point]);
    selectedKeys.add(bestBucket.key);
  }

  return centroids;
};

const isSameClusters = (clusters: number[], prevClusters: number[]) => {
  return (
    clusters.length === prevClusters.length &&
    clusters.every((item, index) => item === prevClusters[index])
  );
};

// Process the received data based on the k-means method
export const cluster = (data: number[][], k: number) => {
  const mat = createInitialCentroids(data, k);
  const clusters = [...Array(data.length)].map(() => 0);
  let prevClusters: number[] = [];
  let changed: boolean = true;
  let iter: number = 0;

  while (changed && iter < MAX_ITER) {
    changed = false;
    prevClusters = [...clusters];
    for (let i = 0; i < data.length; i++) {
      let min = Infinity;
      let minIndex = 0;

      for (let j = 0; j < mat.length; j++) {
        const tmp = getDistance(data[i], mat[j]);
        if (tmp < min) {
          min = tmp;
          minIndex = j;
        }
      }
      clusters[i] = minIndex;
    }

    for (let i = 0; i < mat.length; i++) {
      const points = data.filter((_, index) => clusters[index] === i);
      if (points.length === 0) continue;

      const [r, g, b] = points.reduce(
        (acc, point) => {
          acc[0] += point[0];
          acc[1] += point[1];
          acc[2] += point[2];
          return acc;
        },
        [0, 0, 0],
      );
      mat[i] = [
        Math.round(r / points.length),
        Math.round(g / points.length),
        Math.round(b / points.length),
      ];
    }

    if (!isSameClusters(clusters, prevClusters)) {
      changed = true;
    }

    iter++;
  }

  return { clusters, mat };
};
