import React from 'react';

export interface DocumentPageProps {
  children: React.ReactNode;
  className?: string;
}

export const DocumentPage: React.FC<DocumentPageProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className="document-page-wrapper w-full flex justify-center py-6 px-2 sm:px-4">
      <article
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '7.41mm 9.17mm',
        }}
        className={`document-a4-page bg-white shadow-xl border border-gray-300 text-black font-serif box-border flex flex-col justify-between transition-all ${className}`}
      >
        <div className="w-full grow flex flex-col">{children}</div>
      </article>
    </div>
  );
};
