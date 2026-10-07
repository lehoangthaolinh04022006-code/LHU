import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Link2,
  Image as ImageIcon,
  Download,
  Plus,
  Search,
  ExternalLink,
  Tag,
  Clock,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { DocumentResource, Project } from '../types';
import { ThemeConfig } from '../utils/theme';

interface DocumentsViewProps {
  project: Project;
  documents: DocumentResource[];
  onAddDocument: (doc: Omit<DocumentResource, 'id'>) => void;
  onDeleteDocument: (docId: string) => void;
  theme: ThemeConfig;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  project,
  documents,
  onAddDocument,
  onDeleteDocument,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'pdf' | 'ppt' | 'doc' | 'sheet' | 'link' | 'image'>('pdf');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');

  const projectDocs = documents.filter((d) => d.projectId === project.id);
  const filteredDocs = projectDocs.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || d.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getDocIcon = (t: DocumentResource['type']) => {
    switch (t) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'ppt':
        return <Presentation className="w-5 h-5 text-amber-500" />;
      case 'sheet':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'link':
        return <Link2 className="w-5 h-5 text-indigo-500" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-sky-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddDocument({
      projectId: project.id,
      name: name.trim(),
      type,
      size: type === 'link' ? 'Đường dẫn web' : '1.8 MB',
      uploaderName: 'Linh Thảo (Bạn)',
      uploaderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      uploadedAt: 'Vừa xong',
      url: url.trim() || undefined,
      description: description.trim() || 'Tài liệu tham khảo phục vụ làm việc nhóm.',
      tags: tagInput ? tagInput.split(',').map((t) => t.trim()) : ['Dự án'],
    });

    setName('');
    setUrl('');
    setDescription('');
    setTagInput('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Kho Lưu Trữ & Chia Sẻ Tài Liệu Nhóm
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tập trung tất cả giáo trình, đề cương, dữ liệu khảo sát và link tài liệu ở một nơi thống nhất
          </p>
        </div>

        <button
          id="btn-upload-document"
          type="button"
          onClick={() => setShowAddModal(true)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${theme.primary} shadow-sm transition-all`}
        >
          <Plus className="w-4 h-4" />
          <span>Tải Lên / Thêm Liên Kết</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu, thẻ tag, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'pdf', label: 'Báo cáo PDF' },
            { id: 'ppt', label: 'Slide PPT' },
            { id: 'sheet', label: 'Số liệu Sheet' },
            { id: 'link', label: 'Liên kết Web' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedType(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedType === cat.id
                  ? `${theme.bgLight} ${theme.textLight} font-bold shadow-2xs`
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                  {getDocIcon(doc.type)}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {doc.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteDocument(doc.id)}
                    className="text-slate-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1 min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                    title="Xóa tệp"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                {doc.name}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {doc.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-2.5">
                {doc.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer with uploader & download / open */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <img
                  src={doc.uploaderAvatar}
                  alt={doc.uploaderName}
                  className="w-5 h-5 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="text-slate-500 truncate max-w-[100px]">
                  {doc.uploaderName.split(' ')[0]}
                </span>
                <span className="text-slate-400">• {doc.size}</span>
              </div>

              {doc.url ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 p-1 min-h-[32px]"
                >
                  Mở link <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([`Tài liệu: ${doc.name}\nMô tả: ${doc.description}`], { type: 'text/plain;charset=utf-8' });
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = `${doc.name}.txt`;
                    link.click();
                    URL.revokeObjectURL(blobUrl);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 p-1 min-h-[32px] cursor-pointer"
                >
                  Tải về <Download className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy tài liệu phù hợp</p>
          <p className="text-xs text-slate-500 mt-1">Hãy thử tìm với từ khóa khác hoặc bấm nút tải lên tài liệu mới.</p>
        </div>
      )}

      {/* Upload Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Thêm Tài Liệu Mới Vào Nhóm
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên tài liệu / Tiêu đề
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: De-Cuong-Bao-Cao-Khoa-Hoc-2026.pdf"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Định dạng
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="pdf">Tài liệu PDF</option>
                    <option value="ppt">Slide bài giảng (PPT)</option>
                    <option value="sheet">Bảng tính (Excel/Sheet)</option>
                    <option value="doc">Văn bản (Word/Doc)</option>
                    <option value="link">Đường dẫn Google Drive/Web</option>
                    <option value="image">Hình ảnh minh họa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Thẻ phân loại (cách nhau dấu phẩy)
                  </label>
                  <input
                    type="text"
                    placeholder="Đề cương, Số liệu"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {type === 'link' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đường dẫn URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mô tả nội dung tóm tắt
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm về nội dung tệp..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold rounded-xl ${theme.primary} shadow-sm`}
                >
                  Lưu Vào Kho Nhóm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
