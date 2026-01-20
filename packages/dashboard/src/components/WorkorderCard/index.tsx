'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, RefreshCw, Zap, Sparkles, Lock, Copy, FolderTree, Share2, Check, MoreVertical, LayoutGrid, Plus, FileText } from 'lucide-react';
import { WorkorderObject } from '@/types/workorders';
import { UnifiedCard } from '@/components/UnifiedCard';
import { ContextMenu, ContextMenuItem } from '@/components/coderef/ContextMenu';
import { useBoardsCache } from '@/hooks/useBoardsCache';

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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [menuItems, setMenuItems] = useState<ContextMenuItem[]>([]);

  const { boards, getBoardDetail, createBoard, createList, createCard } = useBoardsCache();

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

  const handleAddAsNewBoard = async () => {
    const boardId = await createBoard({ name: workorder.feature_name });
    if (!boardId) return;

    const listId = await createList(boardId, { title: 'To Do', order: 0 });
    if (!listId) return;

    await createCard(boardId, {
      listId,
      title: workorder.feature_name,
      description: `Project: ${workorder.project_name}\nStatus: ${workorder.status}\nPath: ${workorder.path}`,
      order: 0,
    });

    setContextMenu(null);
  };

  const handleAddToList = async (boardId: string, listId: string) => {
    const boardDetail = await getBoardDetail(boardId);
    const cardsInList = boardDetail?.cards?.[listId] || [];

    await createCard(boardId, {
      listId,
      title: workorder.feature_name,
      description: `Project: ${workorder.project_name}\nStatus: ${workorder.status}\nPath: ${workorder.path}`,
      order: cardsInList.length,
    });

    setContextMenu(null);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Build menu items including board submenu
  useEffect(() => {
    const buildMenu = async () => {
      const items: ContextMenuItem[] = [
        {
          label: copiedPath ? 'Path Copied' : 'Copy Path',
          icon: copiedPath ? Check : FolderTree,
          onClick: handleCopyPath,
          iconClassName: copiedPath ? 'text-green-500' : '',
        },
        {
          label: copiedContent ? 'Content Copied' : 'Copy Content',
          icon: copiedContent ? Check : Copy,
          onClick: handleCopyContent,
          iconClassName: copiedContent ? 'text-green-500' : '',
        },
        {
          label: shared ? 'Shared' : 'Share',
          icon: shared ? Check : Share2,
          onClick: handleShare,
          iconClassName: shared ? 'text-green-500' : '',
        },
      ];

      // Build board submenu
      const boardSubmenu: ContextMenuItem[] = [
        {
          label: 'Add as New Board',
          icon: Plus,
          onClick: handleAddAsNewBoard,
        },
      ];

      if (boards.length > 0) {
        const boardItems: ContextMenuItem[] = [];

        for (const board of boards) {
          const boardDetail = await getBoardDetail(board.id);
          const listItems: ContextMenuItem[] = [];

          if (boardDetail?.board?.lists) {
            for (const list of boardDetail.board.lists) {
              listItems.push({
                label: list.title,
                icon: FileText,
                onClick: () => handleAddToList(board.id, list.id),
              });
            }
          }

          listItems.push({
            label: 'Add to New List',
            icon: Plus,
            onClick: async () => {
              const listId = await createList(board.id, {
                title: 'New List',
                order: boardDetail?.board?.lists.length || 0,
              });
              if (listId) await handleAddToList(board.id, listId);
            },
          });

          boardItems.push({
            label: board.name,
            icon: LayoutGrid,
            submenu: listItems,
          });
        }

        boardSubmenu.push({
          label: 'Add to Existing Board',
          icon: LayoutGrid,
          submenu: boardItems,
        });
      }

      items.push({
        label: 'Add to Board',
        icon: LayoutGrid,
        submenu: boardSubmenu,
      });

      setMenuItems(items);
    };

    buildMenu();
  }, [boards, copiedPath, copiedContent, shared]);

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

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={menuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}

export default WorkorderCard;
