'use client';

import { useState } from 'react';
import { Clock, CheckCircle, RefreshCw, Zap, Sparkles, Lock, Copy, FolderTree, Share2, Check, MoreVertical, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { WorkorderObject } from '@/types/workorders';
import { UnifiedCard } from '@/components/UnifiedCard';
import UniversalEntityActionModal, { type ActionMenuItem } from '@/components/coderef/UniversalEntityActionModal';

interface WorkorderCardProps {
  workorder: WorkorderObject;
  onClick?: () => void;
}

const statusIcons: Record<string, any> = {
  pending_plan: Clock,
  plan_submitted: CheckCircle,
  changes_requested: RefreshCw,
  approved: CheckCircle,
  implementing: Zap,
  complete: Sparkles,
  verified: CheckCircle,
  closed: Lock,
};

const statusColors: Record<string, string> = {
  pending_plan: 'text-ind-text-muted',
  plan_submitted: 'text-ind-text',
  changes_requested: 'text-ind-warning',
  approved: 'text-ind-accent',
  implementing: 'text-ind-accent',
  complete: 'text-ind-success',
  verified: 'text-ind-success',
  closed: 'text-ind-text-muted',
};

/**
 * WorkorderCard - Wrapper around UnifiedCard for workorder-specific data
 *
 * Maintains the same external API while using UnifiedCard internally.
 */
export function WorkorderCard({ workorder, onClick }: WorkorderCardProps) {
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [shared, setShared] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const StatusIcon = statusIcons[workorder.status] || Clock;
  const statusColor = statusColors[workorder.status] || 'text-ind-text';

  const lastUpdated = new Date(workorder.updated || workorder.created);
  const formattedDate = lastUpdated.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: lastUpdated.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined,
  });

  // Action handlers
  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(workorder.path);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
    } catch (err) {
      console.error('Failed to copy path:', err);
    }
  };

  const handleCopyContent = async () => {
    try {
      const content = JSON.stringify(workorder.files, null, 2);
      await navigator.clipboard.writeText(content);
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const handleShare = async () => {
    try {
      const shareText = `Workorder: ${workorder.feature_name}\nProject: ${workorder.project_name}\nStatus: ${workorder.status}\nPath: ${workorder.path}`;
      if (navigator.share) {
        await navigator.share({
          title: workorder.feature_name,
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };


  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  // Action menu items for main menu
  const actionMenuItems: ActionMenuItem[] = [
    {
      id: 'copy_path',
      label: copiedPath ? 'Path Copied ✓' : 'Copy Path',
      icon: copiedPath ? Check : FolderTree,
      type: 'immediate',
      onClick: handleCopyPath,
      iconClassName: copiedPath ? 'text-green-500' : '',
    },
    {
      id: 'copy_content',
      label: copiedContent ? 'Content Copied ✓' : 'Copy Content',
      icon: copiedContent ? Check : Copy,
      type: 'immediate',
      onClick: handleCopyContent,
      iconClassName: copiedContent ? 'text-green-500' : '',
    },
    {
      id: 'share',
      label: shared ? 'Shared ✓' : 'Share',
      icon: shared ? Check : Share2,
      type: 'immediate',
      onClick: handleShare,
      iconClassName: shared ? 'text-green-500' : '',
    },
    {
      id: 'add_to_target',
      label: 'Add to Target',
      icon: LayoutGrid,
      type: 'flow',
    },
  ];

  return (
    <>
    <UnifiedCard
      icon={StatusIcon}
      iconColor={statusColor}
      title={workorder.feature_name}
      subtitle={workorder.project_name}
      headerRight={
        <button
          onClick={handleMenuClick}
          className="
            p-1.5 rounded
            text-ind-text-muted hover:text-ind-text hover:bg-ind-bg
            transition-colors duration-200
          "
          title="More actions"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      }
      footerLeft={
        <span className="text-xs text-ind-text-muted capitalize whitespace-nowrap">
          {workorder.status.replace(/_/g, ' ')}
        </span>
      }
      footerRight={
        <span className="text-xs text-ind-text-muted">
          {formattedDate}
        </span>
      }
      onClick={onClick}
    />

      {/* Universal Entity Action Modal with Main Menu */}
      {modalOpen && (
        <UniversalEntityActionModal
          isOpen={modalOpen}
          entity={workorder}
          entityType="Workorder"
          availableTargets={['board', 'session']}
          actionMenuItems={actionMenuItems}
          onClose={() => setModalOpen(false)}
          onSuccess={(targetType, _action, result) => {
            console.log(`✅ Added workorder to ${targetType}:`, result);
            toast.success(`Added to ${targetType}!`);
          }}
          onError={(error) => {
            console.error('❌ Failed to add workorder:', error);
            toast.error(error.message);
          }}
        />
      )}
    </>
  );
}

export default WorkorderCard;
