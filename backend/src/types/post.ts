import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface BlogPostRow extends BlogPost, RowDataPacket {}

export interface CreatePostInput {
  title: string;
  content: string;
}

export interface UpdatePostInput {
  title: string;
  content: string;
}

export interface ApiResponse<T = unknown> {
  message?: string;
  status?: string;
  data?: T;
  id?: number;
}
