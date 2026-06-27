// Calculate the distance between two points in three dimensions
const getDistance = (point1: number[], point2: number[]) => {
  const x = point1[0] - point2[0];
  const y = point1[1] - point2[1];
  const z = point1[2] - point2[2];

  return x * x + y * y + z * z;
};

const MAX_ITER = 1000;

type RgbColor = [number, number, number];

type ColorBucket = {
  key: string;
  color: RgbColor;
  count: number;
};

const toRgbColor = (point: number[]): RgbColor => [
  point[0] ?? 0,
  point[1] ?? 0,
  point[2] ?? 0,
];

const toColorKey = (point: number[]) => point.join(",");

const compareColorBuckets = (a: ColorBucket, b: ColorBucket) => {
  for (let i = 0; i < a.color.length; i++) {
    const diff = a.color[i] - b.color[i];
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
      color: toRgbColor(point),
      count: 1,
    });
  });

  return Array.from(buckets.values()).sort(compareColorBuckets);
};

const getWeightedMean = (buckets: ColorBucket[]): RgbColor => {
  const [r, g, b, count] = buckets.reduce(
    (acc, bucket) => {
      acc[0] += bucket.color[0] * bucket.count;
      acc[1] += bucket.color[1] * bucket.count;
      acc[2] += bucket.color[2] * bucket.count;
      acc[3] += bucket.count;
      return acc;
    },
    [0, 0, 0, 0],
  );

  if (count === 0) return [0, 0, 0];

  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
};

const createInitialCentroids = (
  buckets: ColorBucket[],
  k: number,
): RgbColor[] => {
  if (buckets.length === 0 || k <= 0) return [];

  const effectiveK = Math.min(k, buckets.length);
  if (buckets.length <= effectiveK)
    return buckets.map(({ color }) => [...color]);

  const weightedMean = getWeightedMean(buckets);
  const centroids: RgbColor[] = [weightedMean];
  const selectedKeys = new Set<string>();
  const weightedMeanKey = toColorKey(weightedMean);

  if (buckets.some((bucket) => bucket.key === weightedMeanKey)) {
    selectedKeys.add(weightedMeanKey);
  }

  while (centroids.length < effectiveK && selectedKeys.size < buckets.length) {
    let bestBucket: ColorBucket | undefined;
    let bestScore = -Infinity;

    buckets.forEach((bucket) => {
      if (selectedKeys.has(bucket.key)) return;

      const minDistance = Math.min(
        ...centroids.map((centroid) => getDistance(bucket.color, centroid)),
      );
      const score = minDistance * Math.max(1, Math.log2(bucket.count + 1));

      if (score > bestScore) {
        bestBucket = bucket;
        bestScore = score;
      }
    });

    if (!bestBucket) break;

    centroids.push([...bestBucket.color]);
    selectedKeys.add(bestBucket.key);
  }

  return centroids;
};

const getNearestCentroidIndex = (point: number[], centroids: number[][]) => {
  let min = Infinity;
  let minIndex = 0;

  for (let i = 0; i < centroids.length; i++) {
    const tmp = getDistance(point, centroids[i]);
    if (tmp < min) {
      min = tmp;
      minIndex = i;
    }
  }

  return minIndex;
};

const assignBucketsToCentroids = (
  buckets: ColorBucket[],
  centroids: RgbColor[],
) => {
  return buckets.map((bucket) =>
    getNearestCentroidIndex(bucket.color, centroids),
  );
};

const updateCentroids = (
  buckets: ColorBucket[],
  clusters: number[],
  centroids: RgbColor[],
): RgbColor[] => {
  return centroids.map((centroid, centroidIndex) => {
    const assignedBuckets = buckets.filter(
      (_, index) => clusters[index] === centroidIndex,
    );
    if (assignedBuckets.length === 0) return centroid;

    return getWeightedMean(assignedBuckets);
  });
};

const isSameClusters = (clusters: number[], prevClusters: number[]) => {
  return (
    clusters.length === prevClusters.length &&
    clusters.every((item, index) => item === prevClusters[index])
  );
};

const isSameCentroids = (centroids: RgbColor[], prevCentroids: RgbColor[]) => {
  return (
    centroids.length === prevCentroids.length &&
    centroids.every(
      (centroid, index) => getDistance(centroid, prevCentroids[index]) === 0,
    )
  );
};

// Process the received data based on the k-means method
export const cluster = (data: number[][], k: number) => {
  const buckets = summarizeColors(data);
  let mat = createInitialCentroids(buckets, k);

  if (mat.length === 0) {
    return { clusters: [...Array(data.length)].map(() => 0), mat };
  }

  let bucketClusters: number[] = [];
  let changed: boolean = true;
  let iter: number = 0;

  while (changed && iter < MAX_ITER) {
    const nextBucketClusters = assignBucketsToCentroids(buckets, mat);
    const prevMat = mat.map((centroid) => [...centroid] as RgbColor);
    const nextMat = updateCentroids(buckets, nextBucketClusters, mat);

    changed =
      !isSameClusters(nextBucketClusters, bucketClusters) ||
      !isSameCentroids(nextMat, prevMat);
    bucketClusters = nextBucketClusters;
    mat = nextMat;

    iter++;
  }

  const finalBucketClusters = assignBucketsToCentroids(buckets, mat);
  const clusterByKey = new Map<string, number>();
  buckets.forEach((bucket, index) => {
    clusterByKey.set(bucket.key, finalBucketClusters[index]);
  });

  const clusters = data.map((point) => {
    return (
      clusterByKey.get(toColorKey(point)) ?? getNearestCentroidIndex(point, mat)
    );
  });

  return { clusters, mat };
};
