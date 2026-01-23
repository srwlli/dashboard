/**
 * UniversalEntityActionModal Component
 *
 * Universal modal-based target selector that works with ALL right-click contexts.
 * Supports 5 target types: Board, Session, Prompt, Note, Favorite
 *
 * Part of WO-UNIVERSAL-CTX-MENU-001-DASHBOARD
 *
 * User Flow:
 * 1. Select target type (Board, Session, Prompt, Note, Favorite)
 * 2. Select action (based on target type)
 * 3. Select target (if required)
 * 4. Confirm operation
 *
 * @example
 * ```tsx
 * <UniversalEntityActionModal
 *   isOpen={modalOpen}
 *   entity={stub}
 *   entityType="Stub"
 *   availableTargets={['board', 'session', 'note']}
 *   onClose={() => setModalOpen(false)}
 *   onSuccess={(targetType, action, result) => toast.success(`Added to ${targetType}!`)}
 *   onError={(error) => toast.error(error.message)}
 * />
 * ```
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, LayoutGrid, FileText, MessageSquare, StickyNote, Star, Folder, List, Paperclip, Plus, Loader2, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import BoardTargetPickerModal from './BoardTargetPickerModal';
import {
  BoardTargetAdapter,
  SessionTargetAdapter,
  PromptTargetAdapter,
  NoteTargetAdapter,
  FavoriteTargetAdapter,
  type TargetAdapter,
} from '@/lib/boards/target-adapters';
import {
  fileToBoard,
  fileToPrompt,
  stubToBoard,
  stubToSession,
  workorderToBoard,
  workorderToSession,
  type EntityConverter,
} from '@/lib/boards/entity-converters';

/**
 * Target type identifier
 */
export type TargetType = 'board' | 'session' | 'prompt' | 'note' | 'favorite';

/**
 * Action configuration for a target type
 */
interface ActionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresTargetSelection: boolean;
  requiresNestedSelection?: boolean; // For Board → List → Card
}

/**
 * Target configuration
 */
interface TargetConfig {
  type: TargetType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adapter: TargetAdapter<any>;
  actions: ActionConfig[];
}

/**
 * Action menu item for main menu
 * Distinguishes between immediate actions (execute & close) and flow actions (multi-step)
 */
export interface ActionMenuItem {
  /** Unique action ID */
  id: string;

  /** Display label */
  label: string;

  /** Icon component */
  icon: React.ComponentType<{ className?: string }>;

  /** Action type: immediate actions execute and close, flow actions start multi-step process */
  type: 'immediate' | 'flow';

  /** Handler for immediate actions */
  onClick?: () => void | Promise<void>;

  /** Optional icon styling */
  iconClassName?: string;
}

/**
 * Props for UniversalEntityActionModal
 */
export interface UniversalEntityActionModalProps<TEntity = any> {
  /** Whether modal is open */
  isOpen: boolean;

  /** Entity to add (Stub, Workorder, File, etc.) */
  entity: TEntity;

  /** Entity type label for display */
  entityType: string; // "Stub", "Workorder", "File"

  /** Available target types (defaults to all 5) */
  availableTargets?: TargetType[];

  /** Action menu items for main menu (NEW) */
  actionMenuItems?: ActionMenuItem[];

  /** Skip main menu and go directly to target selection (NEW) */
  skipMainMenu?: boolean;

  /** Close modal callback */
  onClose: () => void;

  /** Success callback */
  onSuccess?: (targetType: TargetType, action: string, result: any) => void;

  /** Error callback */
  onError?: (error: Error) => void;
}

/**
 * Modal step type
 */
type ModalStep = 'main_menu' | 'target_type' | 'action' | 'target_selection';

/**
 * UniversalEntityActionModal Component
 */
export default function UniversalEntityActionModal<TEntity = any>({
  isOpen,
  entity,
  entityType,
  availableTargets = ['board', 'session', 'prompt', 'note', 'favorite'],
  actionMenuItems,
  skipMainMenu = false,
  onClose,
  onSuccess,
  onError,
}: UniversalEntityActionModalProps<TEntity>) {
  // Modal step management
  const [currentStep, setCurrentStep] = useState<ModalStep>(
    skipMainMenu || !actionMenuItems ? 'target_type' : 'main_menu'
  );

  // Step 1: Target type selection
  const [selectedTargetType, setSelectedTargetType] = useState<TargetType | null>(null);

  // Step 2: Action selection
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Step 3: Target selection (boards, sessions, etc.)
  const [selectedTarget, setSelectedTarget] = useState<any | null>(null);
  const [selectedList, setSelectedList] = useState<any | null>(null); // For boards

  // Board Target Picker Modal (for "Add to Existing Card")
  const [showBoardTargetPicker, setShowBoardTargetPicker] = useState(false);

  // Target configs
  const targetConfigs: Record<TargetType, TargetConfig> = useMemo(() => ({
    board: {
      type: 'board',
      label: 'Board',
      icon: LayoutGrid,
      adapter: BoardTargetAdapter,
      actions: [
        { id: 'as_board', label: 'Add as New Board', icon: Folder, requiresTargetSelection: false },
        { id: 'as_list', label: 'Add as New List', icon: List, requiresTargetSelection: true },
        { id: 'as_card', label: 'Add as New Card', icon: FileText, requiresTargetSelection: true, requiresNestedSelection: true },
        { id: 'to_card', label: 'Add to Existing Card', icon: Paperclip, requiresTargetSelection: true, requiresNestedSelection: true },
      ],
    },
    session: {
      type: 'session',
      label: 'Session',
      icon: FileText,
      adapter: SessionTargetAdapter,
      actions: [
        { id: 'new_session', label: 'Create New Session', icon: Plus, requiresTargetSelection: false },
        { id: 'to_session', label: 'Add to Existing Session', icon: FileText, requiresTargetSelection: true },
      ],
    },
    prompt: {
      type: 'prompt',
      label: 'Prompt',
      icon: MessageSquare,
      adapter: PromptTargetAdapter,
      actions: [
        { id: 'to_prompt', label: 'Add to Prompt Library', icon: MessageSquare, requiresTargetSelection: true },
      ],
    },
    note: {
      type: 'note',
      label: 'Note',
      icon: StickyNote,
      adapter: NoteTargetAdapter,
      actions: [
        { id: 'new_note', label: 'Create New Note', icon: Plus, requiresTargetSelection: false },
        { id: 'to_note', label: 'Add to Existing Note', icon: StickyNote, requiresTargetSelection: true },
      ],
    },
    favorite: {
      type: 'favorite',
      label: 'Favorite',
      icon: Star,
      adapter: FavoriteTargetAdapter,
      actions: [
        { id: 'to_favorite', label: 'Add to Favorites', icon: Star, requiresTargetSelection: true },
      ],
    },
  }), []);

  // Get converter for current entity and target type
  const getConverter = (): EntityConverter<any, any> | null => {
    if (!selectedTargetType) return null;

    // Type-based converter selection
    const isFile = entityType === 'File' || (entity as any).path !== undefined;
    const isStub = entityType === 'Stub' || (entity as any).stub_id !== undefined;
    const isWorkorder = entityType === 'Workorder' || (entity as any).workorder_id !== undefined;

    if (selectedTargetType === 'board') {
      if (isFile) return fileToBoard;
      if (isStub) return stubToBoard;
      if (isWorkorder) return workorderToBoard;
    }

    if (selectedTargetType === 'session') {
      if (isStub) return stubToSession;
      if (isWorkorder) return workorderToSession;
    }

    if (selectedTargetType === 'prompt') {
      if (isFile) return fileToPrompt;
    }

    // Note and Favorite converters TODO: implement
    return null;
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTargetType(null);
      setSelectedAction(null);
      setSelectedTarget(null);
      setSelectedList(null);
      setShowBoardTargetPicker(false);
    }
  }, [isOpen]);

  /**
   * Handle final "Add to Target" action
   */
  const handleAddToTarget = async () => {
    if (!selectedTargetType || !selectedAction) return;

    const config = targetConfigs[selectedTargetType];
    const action = config.actions.find(a => a.id === selectedAction);
    if (!action) return;

    // Validate target selection if required
    if (action.requiresTargetSelection && !selectedTarget) {
      toast.error('Please select a target');
      return;
    }

    // Validate nested selection if required (e.g., Board → List)
    if (action.requiresNestedSelection && !selectedList && selectedAction !== 'to_card') {
      toast.error('Please select a list');
      return;
    }

    const converter = getConverter();
    if (!converter) {
      toast.error(`No converter available for ${entityType} → ${selectedTargetType}`);
      onError?.(new Error(`No converter for ${entityType} → ${selectedTargetType}`));
      return;
    }

    const toastId = toast.loading(`Adding ${entityType} to ${config.label}...`);

    try {
      const adapter = config.adapter;

      if (selectedAction === 'as_board') {
        // Create new board
        const boardData = converter.convert(entity, 'board');
        await adapter.addToTarget({} as any, boardData, { action: 'as_board' });
        toast.success(`Created board successfully`, { id: toastId });
        onSuccess?.(selectedTargetType, selectedAction, { board: boardData });

      } else if (selectedAction === 'as_list') {
        // Create new list in selected board
        const listData = converter.convert(entity, 'list');
        await adapter.addToTarget(selectedTarget, listData, { action: 'as_list' });
        toast.success(`Created list in board "${selectedTarget.name}"`, { id: toastId });
        onSuccess?.(selectedTargetType, selectedAction, { board: selectedTarget, list: listData });

      } else if (selectedAction === 'as_card') {
        // Create new card in selected list
        const cardData = converter.convert(entity, 'card');
        await adapter.addToTarget(selectedTarget, cardData, { action: 'as_card', listId: selectedList.id });
        toast.success(`Created card in list "${selectedList.title}"`, { id: toastId });
        onSuccess?.(selectedTargetType, selectedAction, { board: selectedTarget, list: selectedList, card: cardData });

      } else if (selectedAction === 'new_session' || selectedAction === 'new_note') {
        // Create new session/note
        const data = converter.convert(entity, selectedTargetType);
        await adapter.addToTarget({} as any, data, { action: selectedAction });
        toast.success(`Created ${config.label} successfully`, { id: toastId });
        onSuccess?.(selectedTargetType, selectedAction, { data });

      } else if (selectedAction === 'to_session' || selectedAction === 'to_prompt' || selectedAction === 'to_note' || selectedAction === 'to_favorite') {
        // Add to existing target
        const data = converter.convert(entity, selectedTargetType);
        await adapter.addToTarget(selectedTarget, data, { action: selectedAction });
        toast.success(`Added to ${config.label} "${selectedTarget.name}"`, { id: toastId });
        onSuccess?.(selectedTargetType, selectedAction, { target: selectedTarget, data });

      }

      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to target';
      toast.error(message, { id: toastId });
      console.error('Error adding to target:', error);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  /**
   * Handle Board Target Picker selection (for "Add to Existing Card")
   */
  const handleBoardTargetPickerSelect = async (board: any, list: any, card: any) => {
    const converter = getConverter();
    if (!converter) return;

    const toastId = toast.loading('Adding attachment...');

    try {
      const cardData = converter.convert(entity, 'card');

      // Attach to existing card
      await BoardTargetAdapter.addToTarget(board, {
        attachments: cardData.attachments || [],
        tags: cardData.tags || [],
      }, { action: 'to_card', listId: list.id, cardId: card.id });

      toast.success(`Attached to card "${card.title}"`, { id: toastId });
      onSuccess?.('board', 'to_card', { board, list, card });
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to attach to card';
      toast.error(message, { id: toastId });
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  if (!isOpen) return null;

  const currentConfig = selectedTargetType ? targetConfigs[selectedTargetType] : null;
  const currentAction = selectedAction && currentConfig
    ? currentConfig.actions.find(a => a.id === selectedAction)
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-ind-panel border border-ind-border rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-ind-border">
            <div className="flex items-center gap-2">
              {/* Back button - show when not on main menu and actionMenuItems exist */}
              {currentStep !== 'main_menu' && actionMenuItems && actionMenuItems.length > 0 && (
                <button
                  onClick={() => {
                    setCurrentStep('main_menu');
                    setSelectedTargetType(null);
                    setSelectedAction(null);
                    setSelectedTarget(null);
                    setSelectedList(null);
                  }}
                  className="p-1 hover:bg-ind-bg rounded transition-colors"
                  title="Back to main menu"
                >
                  <ArrowLeft className="w-5 h-5 text-ind-text-muted" />
                </button>
              )}
              <h2 className="text-lg font-semibold text-ind-text">
                {currentStep === 'main_menu' ? `${entityType} Actions` : `Add ${entityType} to Target`}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-ind-bg rounded transition-colors"
            >
              <X className="w-5 h-5 text-ind-text-muted" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Main Menu (if actionMenuItems provided) */}
            {currentStep === 'main_menu' && actionMenuItems && actionMenuItems.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-ind-text-muted uppercase tracking-wide mb-2 block">
                  What would you like to do?
                </label>
                <div className="space-y-2">
                  {actionMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isFlowAction = item.type === 'flow';

                    return (
                      <button
                        key={item.id}
                        onClick={async () => {
                          if (isFlowAction) {
                            // Flow action: transition to target selection
                            setCurrentStep('target_type');
                          } else {
                            // Immediate action: execute and close
                            if (item.onClick) {
                              await item.onClick();
                            }
                            // Brief delay to show action completed before closing
                            setTimeout(() => {
                              onClose();
                            }, 200);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded border border-ind-border text-ind-text hover:bg-ind-bg transition-colors"
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${item.iconClassName || ''}`} />
                        <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                        {isFlowAction && <ChevronRight className="w-4 h-4 text-ind-text-muted" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 1: Target Type Selector */}
            {currentStep !== 'main_menu' && (
              <div>
                <label className="text-sm font-semibold text-ind-text-muted uppercase tracking-wide mb-2 block">
                  Step 1: Select Target Type
                </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {availableTargets.map((targetType) => {
                  const config = targetConfigs[targetType];
                  const Icon = config.icon;
                  const isSelected = selectedTargetType === targetType;

                  return (
                    <button
                      key={targetType}
                      onClick={() => {
                        setSelectedTargetType(targetType);
                        setSelectedAction(null);
                        setSelectedTarget(null);
                        setSelectedList(null);
                      }}
                      className={`flex flex-col items-center gap-2 p-3 rounded border transition-colors ${
                        isSelected
                          ? 'bg-ind-accent/20 border-ind-accent text-ind-accent'
                          : 'border-ind-border text-ind-text hover:bg-ind-bg'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            )}

            {/* Step 2: Action Selector */}
            {currentStep !== 'main_menu' && selectedTargetType && currentConfig && (
              <div>
                <label className="text-sm font-semibold text-ind-text-muted uppercase tracking-wide mb-2 block">
                  Step 2: Select Action
                </label>
                <div className="space-y-2">
                  {currentConfig.actions.map((action) => {
                    const Icon = action.icon;
                    const isSelected = selectedAction === action.id;

                    return (
                      <button
                        key={action.id}
                        onClick={() => {
                          setSelectedAction(action.id);
                          setSelectedTarget(null);
                          setSelectedList(null);

                          // Auto-open Board Target Picker for "Add to Existing Card"
                          if (action.id === 'to_card') {
                            setShowBoardTargetPicker(true);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded border transition-colors ${
                          isSelected
                            ? 'bg-ind-accent/20 border-ind-accent text-ind-accent'
                            : 'border-ind-border text-ind-text hover:bg-ind-bg'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Target/List Selection (if required) */}
            {currentStep !== 'main_menu' && selectedAction && currentAction && currentAction.requiresTargetSelection && selectedAction !== 'to_card' && (
              <TargetSelector
                targetType={selectedTargetType!}
                action={selectedAction}
                config={currentConfig!}
                selectedTarget={selectedTarget}
                selectedList={selectedList}
                onSelectTarget={setSelectedTarget}
                onSelectList={setSelectedList}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-ind-border flex items-center justify-between">
            <div className="text-sm text-ind-text-muted">
              {selectedTargetType && (
                <span>
                  Target: <span className="font-medium text-ind-text">{currentConfig?.label}</span>
                  {selectedAction && ` → ${currentAction?.label}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-ind-text hover:bg-ind-bg rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToTarget}
                disabled={!selectedTargetType || !selectedAction || (currentAction?.requiresTargetSelection && !selectedTarget && selectedAction !== 'to_card')}
                className="px-4 py-2 text-sm font-medium bg-ind-accent hover:bg-ind-accent-hover text-black rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to {currentConfig?.label || 'Target'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Board Target Picker Modal (for "Add to Existing Card") */}
      {showBoardTargetPicker && (
        <BoardTargetPickerModal
          title={`Add ${entityType} to Existing Card`}
          isOpen={showBoardTargetPicker}
          onClose={() => setShowBoardTargetPicker(false)}
          onSelect={handleBoardTargetPickerSelect}
        />
      )}
    </>
  );
}

/**
 * Target Selector Component (Step 3)
 * Shows targets and nested items based on target type
 */
interface TargetSelectorProps {
  targetType: TargetType;
  action: string;
  config: TargetConfig;
  selectedTarget: any | null;
  selectedList: any | null;
  onSelectTarget: (target: any) => void;
  onSelectList: (list: any) => void;
}

function TargetSelector({
  targetType,
  action,
  config,
  selectedTarget,
  selectedList,
  onSelectTarget,
  onSelectList,
}: TargetSelectorProps) {
  const [targets, setTargets] = useState<any[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(true);
  const [lists, setLists] = useState<any[]>([]);
  const [listsLoading, setListsLoading] = useState(false);

  // Fetch targets on mount
  useEffect(() => {
    const fetchTargets = async () => {
      setTargetsLoading(true);
      try {
        const fetchedTargets = await config.adapter.fetchTargets();
        setTargets(Array.isArray(fetchedTargets) ? fetchedTargets : []);
      } catch (error) {
        console.error(`Error fetching ${targetType}s:`, error);
        setTargets([]);
      } finally {
        setTargetsLoading(false);
      }
    };
    fetchTargets();
  }, [targetType, config.adapter]);

  // Fetch lists when target is selected (for boards only)
  useEffect(() => {
    if (targetType === 'board' && selectedTarget && (action === 'as_card' || action === 'to_card')) {
      const fetchLists = async () => {
        setListsLoading(true);
        try {
          const fetchedLists = await config.adapter.fetchItems(selectedTarget.id);
          setLists(Array.isArray(fetchedLists) ? fetchedLists : []);
        } catch (error) {
          console.error('Error fetching lists:', error);
          setLists([]);
        } finally {
          setListsLoading(false);
        }
      };
      fetchLists();
    }
  }, [selectedTarget, targetType, action, config.adapter]);

  const needsNestedSelection = targetType === 'board' && (action === 'as_card');

  return (
    <div className="space-y-4">
      {/* Target Selection */}
      <div>
        <label className="text-sm font-semibold text-ind-text-muted uppercase tracking-wide mb-2 block">
          Step 3: Select {config.label}
        </label>
        {targetsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-ind-text-muted animate-spin" />
          </div>
        ) : targets.length === 0 ? (
          <div className="text-sm text-ind-text-muted text-center py-8">
            No {config.label.toLowerCase()}s found
          </div>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {targets.map((target) => (
              <button
                key={target.id}
                onClick={() => {
                  onSelectTarget(target);
                  onSelectList(null); // Reset list selection
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded transition-colors ${
                  selectedTarget?.id === target.id
                    ? 'bg-ind-accent/20 text-ind-accent'
                    : 'text-ind-text hover:bg-ind-bg'
                }`}
              >
                <config.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate">{target.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List Selection (for boards only) */}
      {needsNestedSelection && selectedTarget && (
        <div>
          <label className="text-sm font-semibold text-ind-text-muted uppercase tracking-wide mb-2 block">
            Step 4: Select List
          </label>
          {listsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-ind-text-muted animate-spin" />
            </div>
          ) : lists.length === 0 ? (
            <div className="text-sm text-ind-text-muted text-center py-8">
              No lists found in this board
            </div>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => onSelectList(list)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded transition-colors ${
                    selectedList?.id === list.id
                      ? 'bg-ind-accent/20 text-ind-accent'
                      : 'text-ind-text hover:bg-ind-bg'
                  }`}
                >
                  <List className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{list.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
