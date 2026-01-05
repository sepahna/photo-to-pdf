
import React, { useState, useRef } from 'react';
import { PDFService } from './services/pdfService';
import { PDFPageImage, ProcessingStatus } from './types';
import PageCard from './components/PageCard';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [pages, setPages] = useState<PDFPageImage[]>([]);
  const [progress, setProgress] = useState({ currentFile: '', current: 0, total: 0, fileIndex: 0, fileCount: 0 });
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    
    if (files.length === 0) {
      setError('هیچ فایل PDF معتبری یافت نشد.');
      return;
    }

    try {
      setError(null);
      setStatus(ProcessingStatus.LOADING);
      setPages([]);
      
      const allConvertedPages: PDFPageImage[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        setProgress(prev => ({ ...prev, currentFile: file.name, fileIndex: i + 1, fileCount: totalFiles }));
        
        const filePages = await PDFService.convertPdfToImages(file, (current, total) => {
          setStatus(ProcessingStatus.EXTRACTING);
          setProgress(prev => ({ ...prev, current, total }));
        });
        
        allConvertedPages.push(...filePages);
        // Update pages incrementally for better UX
        setPages(prev => [...prev, ...filePages]);
      }

      setStatus(ProcessingStatus.COMPLETED);
    } catch (err) {
      console.error(err);
      setError('خطا در پردازش فایل‌ها. لطفاً دوباره تلاش کنید.');
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(event.target.files);
    }
  };

  const handleDownload = (page: PDFPageImage) => {
    const link = document.createElement('a');
    link.href = page.dataUrl;
    link.download = `${page.fileName.replace('.pdf', '')}-p${page.id}.png`;
    link.click();
  };

  const downloadAll = () => {
    pages.forEach((page, index) => {
      setTimeout(() => handleDownload(page), index * 150);
    });
  };

  const reset = () => {
    setStatus(ProcessingStatus.IDLE);
    setPages([]);
    setProgress({ currentFile: '', current: 0, total: 0, fileIndex: 0, fileCount: 0 });
    setError(null);
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50 font-sans" dir="rtl">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">تبدیل PDF به عکس</span>
          </div>
          
          {(status === ProcessingStatus.COMPLETED || pages.length > 0) && (
            <div className="flex gap-4">
              <button 
                onClick={reset}
                className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
              >
                پاکسازی
              </button>
              <button 
                onClick={downloadAll}
                className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                دانلود همه ({pages.length})
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {status === ProcessingStatus.IDLE || status === ProcessingStatus.ERROR ? (
          <div className="max-w-3xl mx-auto text-center space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="space-y-4">
              <h1 className="text-5xl font-black text-slate-900 leading-tight">فایل‌های PDF خود را به عکس تبدیل کنید</h1>
              <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">
                استخراج سریع صفحات چندین فایل یا یک پوشه به صورت عکس PNG، کاملاً در مرورگر شما.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Multi File Upload */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="group border-4 border-dashed border-slate-200 rounded-[2.5rem] p-10 hover:border-blue-400 hover:bg-blue-50/30 transition-all relative overflow-hidden text-center"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".pdf" 
                  multiple
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">انتخاب چندین فایل</p>
                    <p className="text-slate-400 font-medium text-sm">PDFها را انتخاب کنید</p>
                  </div>
                </div>
              </button>

              {/* Folder Upload */}
              <button 
                onClick={() => folderInputRef.current?.click()}
                className="group border-4 border-dashed border-slate-200 rounded-[2.5rem] p-10 hover:border-amber-400 hover:bg-amber-50/30 transition-all relative overflow-hidden text-center"
              >
                <input 
                  type="file" 
                  ref={folderInputRef}
                  webkitdirectory="" 
                  directory=""
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">انتخاب پوشه</p>
                    <p className="text-slate-400 font-medium text-sm">تمامی PDFهای داخل پوشه</p>
                  </div>
                </div>
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                {error}
              </div>
            )}
          </div>
        ) : status === ProcessingStatus.LOADING || status === ProcessingStatus.EXTRACTING ? (
          <div className="max-w-2xl mx-auto py-24 text-center space-y-10 animate-in fade-in duration-500">
            <div className="space-y-3">
              <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black mb-2">
                فایل {progress.fileIndex} از {progress.fileCount}
              </div>
              <h2 className="text-3xl font-black text-slate-900 truncate px-4">{progress.currentFile}</h2>
              <p className="text-slate-500 font-medium text-lg">
                {status === ProcessingStatus.LOADING ? 'آماده‌سازی فایل...' : `استخراج صفحه ${progress.current} از ${progress.total}...`}
              </p>
            </div>
            
            <div className="relative pt-1 max-w-md mx-auto">
              <div className="flex mb-4 items-center justify-between">
                <div>
                  <span className="text-xs font-black inline-block py-1.5 px-3 uppercase rounded-full text-blue-700 bg-blue-100 tracking-wider">
                    پیشرفت کل
                  </span>
                </div>
                <div className="text-left font-mono font-bold text-blue-600 text-lg">
                  {Math.round(((progress.fileIndex - 1) / progress.fileCount) * 100 + (progress.total > 0 ? (progress.current / progress.total) * (100 / progress.fileCount) : 0))}%
                </div>
              </div>
              <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-blue-50 border border-blue-100 shadow-inner">
                <div 
                  style={{ width: `${((progress.fileIndex - 1) / progress.fileCount) * 100 + (progress.total > 0 ? (progress.current / progress.total) * (100 / progress.fileCount) : 0)}%` }}
                  className="shadow-md flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500 ease-out"
                />
              </div>
            </div>
            
            {pages.length > 0 && (
              <p className="text-slate-400 text-sm animate-pulse">تا اینجا {pages.length} تصویر آماده شده است...</p>
            )}
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-slate-200 pb-6 gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900">تصاویر استخراج شده</h2>
                <p className="text-slate-500 font-medium">مجموعاً {pages.length} صفحه از {progress.fileCount} فایل</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
                تصاویر به تفکیک فایل دسته‌بندی شده‌اند
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {pages.map((page, idx) => (
                <PageCard 
                  key={`${page.fileName}-${page.id}-${idx}`} 
                  page={page} 
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 py-4 text-center z-40">
        <p className="text-slate-500 text-sm font-bold tracking-tight">
          پردازش شده توسط موتور محلی PDF.js • بدون محدودیت تعداد فایل
        </p>
      </footer>
    </div>
  );
};

export default App;
