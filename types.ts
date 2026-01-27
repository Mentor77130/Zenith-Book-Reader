export interface ComicPage {
  name: string;
  url: string;
  index: number;
}

export interface ComicMetadata {
  filename: string;
  totalPages: number;
}

export enum ReadingMode {
  Single = 'SINGLE',
  Double = 'DOUBLE',
  Webtoon = 'WEBTOON' // Continuous vertical scroll
}

export interface ReaderState {
  currentPage: number; // 0-indexed
  scale: number;
  mode: ReadingMode;
  isSidebarOpen: boolean;
  isAiAnalyzing: boolean;
}

export interface AiAnalysisResult {
  text: string;
}
