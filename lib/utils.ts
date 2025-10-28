import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getPathFromUrl = (url: string, bucket: string): string | null => {
  try {
      const urlObject = new URL(url);
      const pathSegment = `/storage/v1/object/public/${bucket}/`;
      const pathIndex = urlObject.pathname.indexOf(pathSegment);
      if (pathIndex !== -1) {
          return urlObject.pathname.substring(pathIndex + pathSegment.length);
      }
      return null;
  } catch (e) {
      console.error("Invalid URL for path extraction", e);
      return null;
  }
};
