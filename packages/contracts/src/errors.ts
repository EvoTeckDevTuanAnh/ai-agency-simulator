export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiValidationError extends ApiError {
  validationErrors?: ValidationError[];
}
