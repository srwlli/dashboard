'use client';

import { useState } from 'react';

export interface FilterConfig {
  status?: string[];
  priority?: string[];
  project?: string[];
  category?: string[];
  search?: string;
}

interface FilterBarProps {
  onFilterChange: (filters: FilterConfig) => void;
  statusOptions?: string[];
  priorityOptions?: string[];
  projectOptions?: string[];
  categoryOptions?: string[];
  showSearch?: boolean;
}

export function FilterBar({
  onFilterChange,
  statusOptions = [],
  priorityOptions = [],
  projectOptions = [],
  categoryOptions = [],
  showSearch = true,
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<string[]>([]);
  const [activePriority, setActivePriority] = useState<string[]>([]);
  const [activeProject, setActiveProject] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string[]>([]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFilterChange({
      search: value || undefined,
      status: activeStatus.length > 0 ? activeStatus : undefined,
      priority: activePriority.length > 0 ? activePriority : undefined,
      project: activeProject.length > 0 ? activeProject : undefined,
      category: activeCategory.length > 0 ? activeCategory : undefined,
    });
  };

  const toggleStatus = (status: string) => {
    const updated = activeStatus.includes(status)
      ? activeStatus.filter((s) => s !== status)
      : [...activeStatus, status];
    setActiveStatus(updated);
    onFilterChange({
      status: updated.length > 0 ? updated : undefined,
      priority: activePriority.length > 0 ? activePriority : undefined,
      project: activeProject.length > 0 ? activeProject : undefined,
      category: activeCategory.length > 0 ? activeCategory : undefined,
      search: searchQuery || undefined,
    });
  };

  const togglePriority = (priority: string) => {
    const updated = activePriority.includes(priority)
      ? activePriority.filter((p) => p !== priority)
      : [...activePriority, priority];
    setActivePriority(updated);
    onFilterChange({
      status: activeStatus.length > 0 ? activeStatus : undefined,
      priority: updated.length > 0 ? updated : undefined,
      project: activeProject.length > 0 ? activeProject : undefined,
      category: activeCategory.length > 0 ? activeCategory : undefined,
      search: searchQuery || undefined,
    });
  };

  const toggleProject = (project: string) => {
    const updated = activeProject.includes(project)
      ? activeProject.filter((p) => p !== project)
      : [...activeProject, project];
    setActiveProject(updated);
    onFilterChange({
      status: activeStatus.length > 0 ? activeStatus : undefined,
      priority: activePriority.length > 0 ? activePriority : undefined,
      project: updated.length > 0 ? updated : undefined,
      category: activeCategory.length > 0 ? activeCategory : undefined,
      search: searchQuery || undefined,
    });
  };

  const toggleCategory = (category: string) => {
    const updated = activeCategory.includes(category)
      ? activeCategory.filter((c) => c !== category)
      : [...activeCategory, category];
    setActiveCategory(updated);
    onFilterChange({
      status: activeStatus.length > 0 ? activeStatus : undefined,
      priority: activePriority.length > 0 ? activePriority : undefined,
      project: activeProject.length > 0 ? activeProject : undefined,
      category: updated.length > 0 ? updated : undefined,
      search: searchQuery || undefined,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveStatus([]);
    setActivePriority([]);
    setActiveProject([]);
    setActiveCategory([]);
    onFilterChange({});
  };

  const hasActiveFilters =
    searchQuery ||
    activeStatus.length > 0 ||
    activePriority.length > 0 ||
    activeProject.length > 0 ||
    activeCategory.length > 0;

  return (
    <div className="space-y-3 p-4 rounded-lg bg-ind-panel border border-ind-border/50">
      {showSearch && (
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="
              w-full px-3 py-2 rounded
              bg-ind-bg border border-ind-border
              text-ind-text placeholder-ind-text-muted
              focus:outline-none focus:border-ind-accent focus:ring-1 focus:ring-ind-accent/30
              transition-colors duration-200
            "
          />
        </div>
      )}

      <div className="space-y-3">
        {statusOptions.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-ind-text-muted block mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`
                    text-xs px-3 py-1 rounded-full
                    transition-all duration-200
                    ${
                      activeStatus.includes(status)
                        ? 'bg-ind-accent text-ind-panel font-semibold'
                        : 'bg-ind-bg text-ind-text-muted border border-ind-border hover:border-ind-accent/50'
                    }
                  `}
                >
                  {status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {priorityOptions.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-ind-text-muted block mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((priority) => (
                <button
                  key={priority}
                  onClick={() => togglePriority(priority)}
                  className={`
                    text-xs px-3 py-1 rounded-full
                    transition-all duration-200
                    ${
                      activePriority.includes(priority)
                        ? 'bg-ind-accent text-ind-panel font-semibold'
                        : 'bg-ind-bg text-ind-text-muted border border-ind-border hover:border-ind-accent/50'
                    }
                  `}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        )}

        {projectOptions.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-ind-text-muted block mb-2">
              Project
            </label>
            <div className="flex flex-wrap gap-2">
              {projectOptions.map((project) => (
                <button
                  key={project}
                  onClick={() => toggleProject(project)}
                  className={`
                    text-xs px-3 py-1 rounded-full
                    transition-all duration-200
                    ${
                      activeProject.includes(project)
                        ? 'bg-ind-accent text-ind-panel font-semibold'
                        : 'bg-ind-bg text-ind-text-muted border border-ind-border hover:border-ind-accent/50'
                    }
                  `}
                >
                  {project}
                </button>
              ))}
            </div>
          </div>
        )}

        {categoryOptions.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-ind-text-muted block mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`
                    text-xs px-3 py-1 rounded-full
                    transition-all duration-200
                    ${
                      activeCategory.includes(category)
                        ? 'bg-ind-accent text-ind-panel font-semibold'
                        : 'bg-ind-bg text-ind-text-muted border border-ind-border hover:border-ind-accent/50'
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="
            w-full text-xs py-2 rounded
            text-ind-text-muted hover:text-ind-text
            border border-ind-border/50 hover:border-ind-border
            transition-colors duration-200
          "
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default FilterBar;
