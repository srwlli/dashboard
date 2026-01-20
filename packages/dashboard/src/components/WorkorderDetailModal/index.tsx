'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Folder, FileText, MessageSquare } from 'lucide-react';
import { WorkorderDetailResponse } from '@/types/workorders';

interface WorkorderDetailModalProps {
  workorderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkorderDetailModal({
  workorderId,
  isOpen,
  onClose,
}: WorkorderDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<WorkorderDetailResponse['data'] | null>(null);

  useEffect(() => {
    if (!isOpen || !workorderId) {
      setDetails(null);
      setError(null);
      return;
    }

    async function fetchDetails() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/workorders/${encodeURIComponent(workorderId!)}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Workorder API error:', response.status, errorText);
          setError(`Failed to load workorder (${response.status}): ${errorText.substring(0, 100)}`);
          return;
        }

        const data: WorkorderDetailResponse = await response.json();

        if (data.success) {
          setDetails(data.data);
        } else {
          const errorMsg = (data as any).error?.message || 'Unknown error';
          console.error('Workorder response error:', data);
          setError(`Failed to load workorder details: ${errorMsg}`);
        }
      } catch (err) {
        console.error('Workorder fetch exception:', err);
        setError((err as Error).message || 'Failed to load workorder');
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [workorderId, isOpen]);

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
      case 'verified':
      case 'closed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'implementing':
      case 'approved':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'pending_plan':
      case 'plan_submitted':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'changes_requested':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
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
            w-full max-w-3xl max-h-[80vh]
            pointer-events-auto
            animate-in zoom-in-95 duration-200
            flex flex-col
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-ind-border flex-shrink-0">
            <div className="flex-1 min-w-0">
              {loading && (
                <div className="space-y-2">
                  <div className="h-6 bg-ind-bg rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-ind-bg rounded w-1/2 animate-pulse"></div>
                </div>
              )}
              {!loading && details && (
                <>
                  <h2 className="text-lg sm:text-xl font-bold text-ind-text mb-1 truncate">
                    {details.workorder.feature_name}
                  </h2>
                  <p className="text-xs sm:text-sm text-ind-text-muted truncate">
                    {details.workorder.id}
                  </p>
                </>
              )}
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
            {loading && (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-ind-bg rounded w-1/4 animate-pulse"></div>
                    <div className="h-16 bg-ind-bg rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {!loading && !error && details && (
              <>
                {/* Status & Metadata */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium border
                        ${getStatusColor(details.workorder.status)}
                      `}
                    >
                      {details.workorder.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Folder className="w-4 h-4 text-ind-text-muted flex-shrink-0" />
                      <span className="text-ind-text-muted">Project:</span>
                      <span className="text-ind-text font-medium truncate">
                        {details.workorder.project_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-ind-text-muted flex-shrink-0" />
                      <span className="text-ind-text-muted">Created:</span>
                      <span className="text-ind-text">
                        {new Date(details.workorder.created).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-ind-text-muted flex-shrink-0" />
                      <span className="text-ind-text-muted">Updated:</span>
                      <span className="text-ind-text">
                        {new Date(details.workorder.updated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                {details.tasks && details.tasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-ind-text-muted" />
                      <h3 className="text-sm font-semibold text-ind-text">Tasks</h3>
                      <span className="text-xs text-ind-text-muted">
                        ({details.tasks.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {details.tasks.map((task: any, idx: number) => (
                        <div
                          key={task.id || idx}
                          className="p-3 rounded-lg bg-ind-bg border border-ind-border/50"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-ind-text-muted flex-shrink-0 mt-0.5">
                              {idx + 1}.
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-ind-text">
                                {task.description || task.title || 'No description'}
                              </p>
                              {task.status && (
                                <span className="inline-block mt-1 text-xs text-ind-text-muted">
                                  Status: {task.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Communication Log */}
                {details.communication_log && details.communication_log.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-ind-text-muted" />
                      <h3 className="text-sm font-semibold text-ind-text">Communication Log</h3>
                      <span className="text-xs text-ind-text-muted">
                        ({details.communication_log.length})
                      </span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {details.communication_log.map((log: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-ind-bg border border-ind-border/50"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            {log.author && (
                              <span className="text-xs font-medium text-ind-accent">
                                {log.author}
                              </span>
                            )}
                            {log.timestamp && (
                              <span className="text-xs text-ind-text-muted flex-shrink-0">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-ind-text whitespace-pre-wrap">
                            {log.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Path */}
                <div className="pt-3 border-t border-ind-border/30">
                  <p className="text-xs text-ind-text-muted break-all">
                    <span className="font-semibold">Path:</span> {details.workorder.path}
                  </p>
                </div>
              </>
            )}
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

export default WorkorderDetailModal;
