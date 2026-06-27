// Calculate the distance between two points in three dimensions
const getDistance = (point1: number[], point2: number[]) => {
  const x = point1[0] - point2[0];
  const y = point1[1] - point2[1];
  const z = point1[2] - point2[2];

  return x * x + y * y + z * z;
};

const MAX_ITER = 1000;

const createInitialCentroids = (data: number[][], k: number): number[][] => {
  if (data.length === 0) return [];

  return [...Array(k)].map((_, index) => {
    const dataIndex = Math.floor((index * data.length) / k);
    return [...data[Math.min(dataIndex, data.length - 1)]];
  });
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

    if (prevClusters.join("") !== clusters.join("")) {
      changed = true;
    }

    iter++;
  }

  return { clusters, mat };
};
