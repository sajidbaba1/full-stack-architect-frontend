import React from 'react';
import { X, Trash2, Calendar, ChevronRight, HardDrive } from 'lucide-react';
import { SavedProject } from '../types';

interface SavedProjectsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: SavedProject[];
  onLoad: (project: SavedProject) => void;
  onDelete: (projectId: string) => void;
}

export const SavedProjectsSidebar: React.FC<SavedProjectsSidebarProps> = ({
  isOpen,
  onClose,
  projects,
  onLoad,
  onDelete
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-500" />
              Saved Blueprints
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center p-6">
                <HardDrive className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium text-slate-400">No saved projects</p>
                <p className="text-sm mt-2">Generate architecture and click "Save Project" to store your blueprints here.</p>
              </div>
            ) : (
              projects.map((project) => (
                <div 
                  key={project.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-indigo-500/50 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                      {project.idea.title}
                    </h3>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {project.idea.tagline}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => onLoad(project)}
                      className="text-xs font-medium bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                    >
                      Load <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};