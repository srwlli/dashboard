'use client';

/**
 * CardEditor Component
 *
 * Modal for creating and editing cards
 * Supports title, description (markdown), tags, and attachments (Phase 5)
 */

import { useState, useEffect } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import type { CardEditorProps, CardAttachment } from '@/types/boards';
import { AttachmentPicker } from './AttachmentPicker';

export function CardEditor({ card, listId, boardLists, onSave, onClose }: CardEditorProps) {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [tags, setTags] = useState<string[]>(card?.tags || []);
  const [attachments, setAttachments] = useState<CardAttachment[]>(card?.attachments || []);
  const [targetListId, setTargetListId] = useState(card?.listId || listId);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!card;

  async function handleSave() {
    // Validation
    if (!title.trim()) {
      setError('Card title is required');
      return;
    }

    setError('');
    setSaving(true);

    try {
      if (isEditing) {
        // Update existing card
        const updates: any = {
          title: title.trim(),
          description: description.trim() || undefined,
          tags,
          attachments,
        };

        // Include listId if card is being moved to a different list
        if (targetListId !== card?.listId) {
          updates.listId = targetListId;
        }

        await onSave(updates);
      } else {
        // Create new card
        await onSave({
          listId: targetListId, // Use targetListId instead of listId for new cards
          title: title.trim(),
          description: description.trim() || undefined,
          order: 0, // Will be set by parent
          tags,
          attachments,
        });
      }

      onClose();
    } catch (err) {
      console.error('Failed to save card:', err);
      setError('Failed to save card. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleAddAttachment(attachment: CardAttachment) {
    setAttachments([...attachments, attachment]);
  }

  function handleRemoveAttachment(id: string) {
    setAttachments(attachments.filter((att) => att.id !== id));
  }

  function handleAddTag() {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-ind-panel border-2 border-ind-border shadow-xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b-2 border-ind-border p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-ind-text">
            {isEditing ? 'Edit Card' : 'New Card'}
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-1 hover:bg-ind-border transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-ind-text-muted" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="card-title"
              className="block text-sm font-medium text-ind-text mb-2"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="card-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title..."
              disabled={saving}
              className="w-full px-3 py-2 bg-ind-bg border-2 border-ind-border text-ind-text placeholder:text-ind-text-muted focus:border-ind-accent outline-none transition-colors disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="card-description"
              className="block text-sm font-medium text-ind-text mb-2"
            >
              Description <span className="text-xs text-ind-text-muted font-normal">(optional, markdown supported)</span>
            </label>
            <textarea
              id="card-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter card description..."
              disabled={saving}
              rows={6}
              className="w-full px-3 py-2 bg-ind-bg border-2 border-ind-border text-ind-text placeholder:text-ind-text-muted focus:border-ind-accent outline-none transition-colors resize-none disabled:opacity-50"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-ind-text mb-2 flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-ind-accent" />
              Tags <span className="text-xs text-ind-text-muted font-normal">(optional)</span>
            </label>

            {/* Tag List */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs bg-ind-accent/10 text-ind-accent px-2 py-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      disabled={saving}
                      className="hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a tag..."
                disabled={saving}
                className="flex-1 px-3 py-2 bg-ind-bg border-2 border-ind-border text-ind-text placeholder:text-ind-text-muted focus:border-ind-accent outline-none transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleAddTag}
                disabled={saving || !newTag.trim()}
                className="px-4 py-2 bg-ind-accent hover:bg-ind-accent-hover text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Move to List - Only show when boardLists is provided (list-standalone view) */}
          {boardLists && boardLists.length > 1 && (
            <div>
              <label
                htmlFor="target-list"
                className="block text-sm font-medium text-ind-text mb-2"
              >
                Move to List <span className="text-xs text-ind-text-muted font-normal">(optional)</span>
              </label>
              <select
                id="target-list"
                value={targetListId}
                onChange={(e) => setTargetListId(e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 bg-ind-bg border-2 border-ind-border text-ind-text focus:border-ind-accent outline-none transition-colors disabled:opacity-50"
              >
                {boardLists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.title}
                    {list.id === listId && ' (current)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-ind-text mb-2">
              Attachments <span className="text-xs text-ind-text-muted font-normal">(optional)</span>
            </label>
            <AttachmentPicker
              attachments={attachments}
              onAdd={handleAddAttachment}
              onRemove={handleRemoveAttachment}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-ind-border p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-ind-text-muted hover:bg-ind-border transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-6 py-2 text-sm font-medium bg-ind-accent hover:bg-ind-accent-hover text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Card'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
