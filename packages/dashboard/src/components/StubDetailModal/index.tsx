'use client';

import { X, Calendar, Tag, AlertCircle, FolderOpen } from 'lucide-react';
import { StubObject } from '@/types/stubs';

interface StubDetailModalProps {
  stub: StubObject | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StubDetailModal({
  stub,
  isOpen,
  onClose,
}: StubDetailModalProps) {
  if (!isOpen || !stub) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default:
        return 'bg-ind-bg text-ind-text-muted border-ind-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'planned':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'stub':
        return 'bg-ind-bg text-ind-text-muted border-ind-border';
      default:
        return 'bg-ind-bg text-ind-text-muted border-ind-border';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feature':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'fix':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'improvement':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'refactor':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'test':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'idea':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      default:
        return 'bg-ind-bg text-ind-text-muted border-ind-border';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="
            bg-ind-panel border border-ind-border rounded-lg
            w-full max-w-2xl max-h-[80vh]
            pointer-events-auto
            animate-in zoom-in-95 duration-200
            flex flex-col
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-ind-border flex-shrink-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-ind-text mb-1">
                {stub.title}
              </h2>
              <p className="text-xs sm:text-sm text-ind-text-muted truncate">
                {stub.feature_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="
                ml-4 p-2 rounded-lg flex-shrink-0
                text-ind-text-muted hover:text-ind-text hover:bg-ind-bg
                transition-colors duration-200
              "
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-medium border
                  ${getStatusColor(stub.status)}
                `}
              >
                {stub.status.replace(/_/g, ' ')}
              </span>
              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-medium border
                  ${getPriorityColor(stub.priority)}
                `}
              >
                {stub.priority}
              </span>
              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-medium border
                  ${getCategoryColor(stub.category)}
                `}
              >
                {stub.category}
              </span>
            </div>

            {/* Description */}
            {stub.description && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-ind-text-muted" />
                  <h3 className="text-sm font-semibold text-ind-text">Description</h3>
                </div>
                <div className="p-4 rounded-lg bg-ind-bg border border-ind-border/50">
                  <p className="text-sm text-ind-text whitespace-pre-wrap">
                    {stub.description}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-ind-text-muted flex-shrink-0" />
                <span className="text-ind-text-muted">Created:</span>
                <span className="text-ind-text">
                  {new Date(stub.created).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-ind-text-muted flex-shrink-0" />
                <span className="text-ind-text-muted">Updated:</span>
                <span className="text-ind-text">
                  {new Date(stub.updated).toLocaleDateString()}
                </span>
              </div>

              {stub.target_project && (
                <div className="flex items-center gap-2 text-sm sm:col-span-2">
                  <FolderOpen className="w-4 h-4 text-ind-text-muted flex-shrink-0" />
                  <span className="text-ind-text-muted">Target Project:</span>
                  <span className="text-ind-text font-medium">
                    {stub.target_project}
                  </span>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-ind-text-muted">
                <Tag className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">ID:</span> {stub.id}
                </div>
              </div>
              <div className="text-xs text-ind-text-muted break-all">
                <span className="font-semibold">Path:</span> {stub.path}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 sm:p-6 border-t border-ind-border flex-shrink-0">
            <button
              onClick={onClose}
              className="
                px-4 py-2 rounded text-sm font-medium
                bg-ind-bg border border-ind-border
                text-ind-text hover:border-ind-accent
                transition-colors duration-200
              "
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default StubDetailModal;
