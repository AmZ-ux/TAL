import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

function sanitizeString(value: string) {
  return value
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitize(value: unknown): unknown {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitize(item)]),
    );
  }

  return value;
}

@Injectable()
export class SanitizeInputPipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata) {
    return sanitize(value);
  }
}
