
import React from 'react';
import { PDFPageImage } from '../types';

interface PageCardProps {
  page: PDFPageImage;
  onDownload: (page: PDFPageImage) => void;
}

const PageCard: React.FC<PageCardProps> = ({ page, onDownload }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all hover:shadow-md group">
      <div className="relative aspect-[1/1.4] bg-slate-100 overflow-hidden">
        <img 
          src={page.dataUrl} 
          alt={`${page.fileName} - Page ${page.id}`} 
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            onClick={() => onDownload(page)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-slate-900 font-semibold text-sm hover:bg-blue-50 hover:text-blue-600 transition-all transform translate-y-2 group-hover:translate-y-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            ذخیره تصویر
          </button>
        </div>
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          <div className="bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-medium backdrop-blur-sm max-w-[120px] truncate">
            {page.fileName}
          </div>
          <div className="bg-blue-600/90 text-white text-xs px-2 py-0.5 rounded font-bold backdrop-blur-sm">
            صفحه {page.id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageCard;
