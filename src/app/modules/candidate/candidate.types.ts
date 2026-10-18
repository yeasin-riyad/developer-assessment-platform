// modules/candidate/candidate.types.ts

export interface CandidateQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CandidateListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export interface CandidatePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CandidateActivityQuery {
  page?: number;
  limit?: number;
}

export interface CandidateAssessmentQuery {
  page?: number;
  limit?: number;
}