
export interface PDFPageImage {
  id: number;
  fileName: string;
  dataUrl: string;
  width: number;
  height: number;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  EXTRACTING = 'EXTRACTING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
