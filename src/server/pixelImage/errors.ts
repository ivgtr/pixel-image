export class PixelImageError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "PixelImageError";
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends PixelImageError {
  constructor(message: string) {
    super(message, 400);
    this.name = "BadRequestError";
  }
}

export class UpstreamImageError extends PixelImageError {
  constructor(message: string) {
    super(message, 400);
    this.name = "UpstreamImageError";
  }
}

export const isPixelImageError = (error: unknown): error is PixelImageError => {
  return error instanceof PixelImageError;
};
