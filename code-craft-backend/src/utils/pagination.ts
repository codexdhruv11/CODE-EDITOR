import { Request } from 'express';
import { API_CONSTANTS } from './constants';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

export interface CursorPaginationResult<T> {
  data: T[];
  pagination: {
    limit: number;
    hasNext: boolean;
    nextCursor?: string;
  };
}

/**
 * Parse pagination parameters from request query
 */
export const parsePaginationParams = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    API_CONSTANTS.MAX_PAGE_SIZE,
    Math.max(1, parseInt(req.query.limit as string) || API_CONSTANTS.DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Build standardized pagination response
 */
export const buildPaginationResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
};

/**
 * Parse cursor-based pagination parameters
 */
export const parseCursorPaginationParams = (req: Request): CursorPaginationParams => {
  const cursor = req.query.cursor as string;
  const limit = Math.min(
    API_CONSTANTS.MAX_PAGE_SIZE,
    Math.max(1, parseInt(req.query.limit as string) || API_CONSTANTS.DEFAULT_PAGE_SIZE)
  );

  return { cursor, limit };
};

/**
 * Apply cursor-based pagination to MongoDB query
 */
export const applyCursorPagination = (query: any, cursor?: string, limit: number = API_CONSTANTS.DEFAULT_PAGE_SIZE) => {
  if (cursor) {
    // Decode cursor (base64 encoded ObjectId + timestamp)
    try {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
      const [id, timestamp] = decodedCursor.split('|');
      
      // Add cursor condition to query
      query = query.where({
        $or: [
          { createdAt: { $lt: new Date(timestamp) } },
          { 
            createdAt: new Date(timestamp),
            _id: { $lt: id }
          }
        ]
      });
    } catch (error) {
      // Invalid cursor, ignore and start from beginning
    }
  }

  return query.sort({ createdAt: -1, _id: -1 }).limit(limit + 1); // +1 to check if there's a next page
};

/**
 * Build cursor-based pagination response
 */
export const buildCursorPaginationResponse = <T extends { _id: any; createdAt: Date }>(
  data: T[],
  limit: number
): CursorPaginationResult<T> => {
  const hasNext = data.length > limit;
  
  if (hasNext) {
    data.pop(); // Remove the extra item used to check for next page
  }

  let nextCursor: string | undefined;
  if (hasNext && data.length > 0) {
    const lastItem = data[data.length - 1];
    const cursorData = `${lastItem._id}|${lastItem.createdAt.toISOString()}`;
    nextCursor = Buffer.from(cursorData, 'utf-8').toString('base64');
  }

  return {
    data,
    pagination: {
      limit,
      hasNext,
      nextCursor,
    },
  };
};

/**
 * Pagination middleware for Express routes
 */
export const paginationMiddleware = (req: Request, res: any, next: any) => {
  const paginationParams = parsePaginationParams(req);
  req.pagination = paginationParams;
  next();
};

/**
 * Cursor pagination middleware for Express routes
 */
export const cursorPaginationMiddleware = (req: Request, res: any, next: any) => {
  const cursorParams = parseCursorPaginationParams(req);
  req.cursorPagination = cursorParams;
  next();
};

// Extend Request interface to include pagination
declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationParams;
      cursorPagination?: CursorPaginationParams;
    }
  }
}