type RgbColor = [number, number, number];

// Calculate the distance between two points in three dimensions
const getDistance = (point1: RgbColor, point2: RgbColor) => {
  const x = point1[0] - point2[0];
  const y = point1[1] - point2[1];
  const z = point1[2] - point2[2];

  return x * x + y * y + z * z;
};

const MAX_ITER = 1000;

type ColorBucket = {
  key: string;
  color: RgbColor;
  count: number;
};

const toRgbColor = (point: number[]): RgbColor => {
  if (point.length !== 3 || point.some((channel) => !Number.isFinite(channel))) {
    throw new Error("cluster expects each color to be an RGB tuple of three finite numbers");
  }

  return [point[0], point[1], point[2]];
};

const assertClusterSize = (k: number) => {
  if (!Number.isSafeInteger(k) || k <= 0) {
    throw new Error("cluster expects k to be a positive integer");
  }
};

const toColorKey = (point: RgbColor) => point.join(",");

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
    const color = toRgbColor(point);
    const key = toColorKey(color);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.count++;
      return;
    }

    buckets.set(key, {
      key,
      color,
      count: 1,
    });
  });

  return Array.from(buckets.values()).sort(compareColorBuckets);
};

const getWeightedMean = (buckets: ColorBucket[]): RgbColor => {
  if (buckets.length === 0) {
    throw new Error("cannot compute a weighted mean without color buckets");
  }

  const total = buckets.reduce(
    (acc, bucket) => {
      acc.r += bucket.color[0] * bucket.count;
      acc.g += bucket.color[1] * bucket.count;
      acc.b += bucket.color[2] * bucket.count;
      acc.count += bucket.count;
      return acc;
    },
    { r: 0, g: 0, b: 0, count: 0 },
  );

  return [
    Math.round(total.r / total.count),
    Math.round(total.g / total.count),
    Math.round(total.b / total.count),
  ];
};

const createInitialCentroids = (
  buckets: ColorBucket[],
  k: number,
): RgbColor[] => {
  if (buckets.length === 0) return [];

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

const getNearestCentroidIndex = (point: RgbColor, centroids: RgbColor[]) => {
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
  assertClusterSize(k);

  const buckets = summarizeColors(data);
  if (buckets.length === 0) return { clusters: [], mat: [] };

  let mat = createInitialCentroids(buckets, k);
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
    const key = toColorKey(toRgbColor(point));
    const clusterIndex = clusterByKey.get(key);

    if (clusterIndex === undefined) {
      throw new Error(`missing cluster assignment for RGB color ${key}`);
    }

    return clusterIndex;
  });

  return { clusters, mat };
};
