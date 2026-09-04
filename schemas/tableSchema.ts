import { z } from 'zod';
import type React from 'react';

// Column configuration schema - generic for any table
export const ColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  sortable: z.boolean().optional().default(true),
  render: z.function().optional(),
});

export type Column = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: unknown) => React.ReactNode;
};