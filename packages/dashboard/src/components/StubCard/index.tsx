'use client';

import { useState } from 'react';
import { Sparkles, Bug, TrendingUp, Lightbulb, Wrench, Beaker, Copy, FolderTree, Share2, Check, MoreVertical, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { StubObject } from '@/types/stubs';
import { UnifiedCard } from '@/components/UnifiedCard';
import UniversalEntityActionModal, { type ActionMenuItem } from '@/components/coderef/UniversalEntityActionModal';

interface StubCardProps {
  stub: StubObject;
  onClick?: () => void;
}

const categoryIcons: Record<string, any> = {
  feature: Sparkles,
  fix: Bug,
  improvement: TrendingUp,
  idea: Lightbulb,
  refactor: Wrench,
  test: Beaker,
};

const priorityColors: Record<string, string> = {
  low: 'text-ind-text-muted',
  medium: 'text-ind-text',
  high: 'text-ind-warning',
  critical: 'text-ind-error',
};

const statusBgColors: Record<string, string> = {
  stub: 'bg-ind-bg/30 text-ind-text-muted',
  planned: 'bg-ind-accent/10 text-ind-accent',
  in_progress: 'bg-ind-accent/20 text-ind-accent',
  completed: 'bg-ind-success/10 text-ind-success',
};

/**
 * StubCard - Wrapper around UnifiedCard for stub-specific data
 *
 * Maintains the same external API while using UnifiedCard internally.
 */
export function StubCard({ stub, onClick }: StubCardProps) {
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [shared, setShared] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const CategoryIcon = categoryIcons[stub.category || ''] || categoryIcons.feature;
  const priorityColor = priorityColors[stub.priority || ''] || 'text-ind-text';
  const statusBg = statusBgColors[stub.status || 'stub'] || 'bg-ind-bg text-ind-text';

  const createdDate = stub.created ? new Date(stub.created) : new Date();
  const formattedDate = createdDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: createdDate.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined,
  });

  // Action handlers
  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(stub.path);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
    } catch (err) {
      console.error('Failed to copy path:', err);
    }
  };

  const handleCopyContent = async () => {
    try {
      const content = JSON.stringify(stub, null, 2);
      await navigator.clipboard.writeText(content);
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const handleShare = async () => {
    try {
      const shareText = `Stub: ${stub.title || stub.feature_name}\nProject: ${stub.target_project}\nPriority: ${stub.priority}\nStatus: ${stub.status}\nCategory: ${stub.category}\n\n${stub.description || ''}`;
      if (navigator.share) {
        await navigator.share({
          title: stub.title || stub.feature_name,
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
      icon={CategoryIcon}
      iconColor="text-ind-accent"
      title={stub.title || stub.feature_name || 'Untitled'}
      subtitle={stub.target_project}
      description={stub.description}
      headerRight={
        <div className="flex items-center gap-2">
          {/* Priority Badge */}
          {stub.priority && (
            <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap hidden md:inline ${priorityColor}`}>
              {stub.priority.charAt(0).toUpperCase() + stub.priority.slice(1)}
            </span>
          )}

          {/* More Actions Button */}
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
        </div>
      }
      footerLeft={
        <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${statusBg}`}>
          {stub.status ? stub.status.replace(/_/g, ' ') : 'stub'}
        </span>
      }
      footerRight={
        <span className="text-xs text-ind-text-muted whitespace-nowrap">
          {formattedDate}
        </span>
      }
      onClick={onClick}
    />

      {/* Universal Entity Action Modal with Main Menu */}
      {modalOpen && (
        <UniversalEntityActionModal
          isOpen={modalOpen}
          entity={stub}
          entityType="Stub"
          availableTargets={['board', 'session', 'note']}
          actionMenuItems={actionMenuItems}
          onClose={() => setModalOpen(false)}
          onSuccess={(targetType, _action, result) => {
            console.log(`✅ Added stub to ${targetType}:`, result);
            toast.success(`Added to ${targetType}!`);
          }}
          onError={(error) => {
            console.error('❌ Failed to add stub:', error);
            toast.error(error.message);
          }}
        />
      )}
    </>
  );
}

export default StubCard;
