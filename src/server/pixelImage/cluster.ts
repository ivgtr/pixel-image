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

type PaletteCluster = {
  buckets: ColorBucket[];
  centroid: RgbColor;
  weightedSse: number;
  canSplit: boolean;
};

const toRgbColor = (point: number[]): RgbColor => {
  if (
    !Array.isArray(point) ||
    point.length !== 3 ||
    point.some((channel) => !Number.isFinite(channel))
  ) {
    throw new Error(
      "cluster expects each color to be an RGB tuple of three finite numbers",
    );
  }

  return [point[0], point[1], point[2]];
};

const assertClusterSize = (k: number) => {
  if (!Number.isSafeInteger(k) || k <= 0) {
    throw new Error("cluster expects k to be a positive integer");
  }
};

const toColorKey = (point: RgbColor) => point.join(",");

const compareRgbColors = (a: RgbColor, b: RgbColor) => {
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    if (diff !== 0) return diff;
  }

  return 0;
};

const compareColorBuckets = (a: ColorBucket, b: ColorBucket) => {
  const colorDiff = compareRgbColors(a.color, b.color);
  if (colorDiff !== 0) return colorDiff;

  return a.key.localeCompare(b.key);
};

const comparePaletteClusters = (a: PaletteCluster, b: PaletteCluster) => {
  const centroidDiff = compareRgbColors(a.centroid, b.centroid);
  if (centroidDiff !== 0) return centroidDiff;

  return a.weightedSse - b.weightedSse;
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

const getWeightedSse = (buckets: ColorBucket[], centroid: RgbColor) => {
  return buckets.reduce(
    (acc, bucket) => acc + getDistance(bucket.color, centroid) * bucket.count,
    0,
  );
};

const createPaletteCluster = (buckets: ColorBucket[]): PaletteCluster => {
  const centroid = getWeightedMean(buckets);

  return {
    buckets,
    centroid,
    weightedSse: getWeightedSse(buckets, centroid),
    canSplit: buckets.length > 1,
  };
};

const getNearestCentroidIndex = (point: RgbColor, centroids: RgbColor[]) => {
  let min = Infinity;
  let minIndex = 0;

  for (let i = 0; i < centroids.length; i++) {
    const tmp = getDistance(point, centroids[i]);
    if (
      tmp < min ||
      (tmp === min && compareRgbColors(centroids[i], centroids[minIndex]) < 0)
    ) {
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
  centroidCount: number,
): RgbColor[] | null => {
  const nextCentroids: RgbColor[] = [];

  for (let centroidIndex = 0; centroidIndex < centroidCount; centroidIndex++) {
    const assignedBuckets = buckets.filter(
      (_, index) => clusters[index] === centroidIndex,
    );
    if (assignedBuckets.length === 0) return null;

    nextCentroids.push(getWeightedMean(assignedBuckets));
  }

  return nextCentroids;
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

const findFarthestBucket = (
  buckets: ColorBucket[],
  point: RgbColor,
  excludedKeys = new Set<string>(),
) => {
  let bestBucket: ColorBucket | undefined;
  let bestDistance = -Infinity;

  buckets.forEach((bucket) => {
    if (excludedKeys.has(bucket.key)) return;

    const distance = getDistance(bucket.color, point);
    if (
      distance > bestDistance ||
      (distance === bestDistance &&
        (!bestBucket || compareColorBuckets(bucket, bestBucket) < 0))
    ) {
      bestBucket = bucket;
      bestDistance = distance;
    }
  });

  return bestBucket;
};

const splitBucketsWithWeightedTwoMeans = (buckets: ColorBucket[]) => {
  if (buckets.length < 2) return null;

  const weightedMean = getWeightedMean(buckets);
  const seedA = findFarthestBucket(buckets, weightedMean);
  if (!seedA) return null;

  const seedB = findFarthestBucket(
    buckets,
    seedA.color,
    new Set([seedA.key]),
  );
  if (!seedB) return null;

  let centroids: RgbColor[] = [[...seedA.color], [...seedB.color]];
  let bucketClusters: number[] = [];
  let iter = 0;

  while (iter < MAX_ITER) {
    const nextBucketClusters = assignBucketsToCentroids(buckets, centroids);
    const nextCentroids = updateCentroids(buckets, nextBucketClusters, 2);
    if (!nextCentroids) return null;

    const changed =
      !isSameClusters(nextBucketClusters, bucketClusters) ||
      !isSameCentroids(nextCentroids, centroids);

    bucketClusters = nextBucketClusters;
    centroids = nextCentroids;
    iter++;

    if (!changed) break;
  }

  const splitBuckets: [ColorBucket[], ColorBucket[]] = [[], []];
  buckets.forEach((bucket, index) => {
    splitBuckets[bucketClusters[index]].push(bucket);
  });

  if (splitBuckets.some((clusterBuckets) => clusterBuckets.length === 0)) {
    return null;
  }

  return splitBuckets.map(createPaletteCluster).sort(comparePaletteClusters);
};

const getSplitCandidateIndex = (paletteClusters: PaletteCluster[]) => {
  let bestIndex = -1;
  let bestWeightedSse = -Infinity;

  paletteClusters.forEach((paletteCluster, index) => {
    if (!paletteCluster.canSplit || paletteCluster.buckets.length < 2) return;

    if (
      paletteCluster.weightedSse > bestWeightedSse ||
      (paletteCluster.weightedSse === bestWeightedSse &&
        bestIndex !== -1 &&
        comparePaletteClusters(paletteCluster, paletteClusters[bestIndex]) < 0)
    ) {
      bestIndex = index;
      bestWeightedSse = paletteCluster.weightedSse;
    }
  });

  return bestIndex;
};

const createBisectingPalette = (buckets: ColorBucket[], k: number) => {
  const effectiveK = Math.min(k, buckets.length);
  if (buckets.length <= effectiveK) {
    return buckets.map(({ color }) => [...color] as RgbColor);
  }

  const paletteClusters = [createPaletteCluster(buckets)];

  while (paletteClusters.length < effectiveK) {
    const splitIndex = getSplitCandidateIndex(paletteClusters);
    if (splitIndex === -1) break;

    const splitClusters = splitBucketsWithWeightedTwoMeans(
      paletteClusters[splitIndex].buckets,
    );

    if (!splitClusters) {
      paletteClusters[splitIndex] = {
        ...paletteClusters[splitIndex],
        canSplit: false,
      };
      continue;
    }

    paletteClusters.splice(splitIndex, 1, ...splitClusters);
    paletteClusters.sort(comparePaletteClusters);
  }

  return paletteClusters.map(({ centroid }) => centroid);
};

// Process the received data based on the k-means method
export const cluster = (data: number[][], k: number) => {
  assertClusterSize(k);

  const buckets = summarizeColors(data);
  if (buckets.length === 0) return { clusters: [], mat: [] };

  const mat = createBisectingPalette(buckets, k);
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
