'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Bug, TrendingUp, Lightbulb, Wrench, Beaker, Copy, FolderTree, Share2, Check, MoreVertical, LayoutGrid, Plus, FileText } from 'lucide-react';
import { StubObject } from '@/types/stubs';
import { UnifiedCard } from '@/components/UnifiedCard';
import { ContextMenu, ContextMenuItem } from '@/components/coderef/ContextMenu';
import { useBoardsCache } from '@/hooks/useBoardsCache';

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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [menuItems, setMenuItems] = useState<ContextMenuItem[]>([]);

  const { boards, getBoardDetail, createBoard, createList, createCard } = useBoardsCache();

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

  const handleAddAsNewBoard = async () => {
    const boardId = await createBoard({ name: stub.title || stub.feature_name });
    if (!boardId) return;

    const listId = await createList(boardId, { title: 'To Do', order: 0 });
    if (!listId) return;

    await createCard(boardId, {
      listId,
      title: stub.title || stub.feature_name || 'Untitled',
      description: `Project: ${stub.target_project}\nPriority: ${stub.priority}\nStatus: ${stub.status}\nCategory: ${stub.category}\n\n${stub.description || ''}`,
      order: 0,
    });

    setContextMenu(null);
  };

  const handleAddToList = async (boardId: string, listId: string) => {
    const boardDetail = await getBoardDetail(boardId);
    const cardsInList = boardDetail?.cards?.[listId] || [];

    await createCard(boardId, {
      listId,
      title: stub.title || stub.feature_name || 'Untitled',
      description: `Project: ${stub.target_project}\nPriority: ${stub.priority}\nStatus: ${stub.status}\nCategory: ${stub.category}\n\n${stub.description || ''}`,
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

export default StubCard;
