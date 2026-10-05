import type { PipelineStage, Types } from 'mongoose';

// Kayıt id'si: veritabanından gelen ObjectId ya da istekten gelen string.
export type IdLike = Types.ObjectId | string;

// Aggregate / find filtresi.
export type MatchFilter = PipelineStage.Match['$match'];

// Aggregate $sort alanları.
export type SortSpec = Record<string, 1 | -1>;
