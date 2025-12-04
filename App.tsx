import React, { useState, useRef, useEffect } from 'react';
import { generateAppIdeas, generateArchitecture } from './services/gemini';
import { AppIdea, ArchitectureDetails, SavedProject } from './types';
import { IdeaCard } from './components/IdeaCard';
import { ArchitectureView } from './components/ArchitectureView';
import { ChatInterface } from './components/ChatInterface';
import { SavedProjectsSidebar } from './components/SavedProjectsSidebar';
import { Button } from './components/Button';
import { Sparkles, Layers, Terminal, Github, Cpu, HardDrive } from 'lucide-react';

const SUGGESTED_NICHES = [
  "E-commerce",
  "Healthcare Management",
  "Fintech & Banking",
  "Education (LMS)",
  "Real Estate",
  "IoT Dashboard"
];

const App: React.FC = () => {
  const [niche, setNiche] = useState<string>('');
  const [ideas, setIdeas] = useState<AppIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<AppIdea | null>(null);
  const [architecture, setArchitecture] = useState<ArchitectureDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [archLoading, setArchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Saved Projects State
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const ideasSectionRef = useRef<HTMLDivElement>(null);
  const archSectionRef = useRef<HTMLDivElement>(null);

  // Load saved projects from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('stackideator_projects');
    if (saved) {
      try {
        setSavedProjects(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved projects', e);
      }
    }
  }, []);

  const handleSaveProject = () => {
    if (!selectedIdea || !architecture) return;
    
    const newProject: SavedProject = {
      id: Date.now().toString(),
      idea: selectedIdea,
      architecture: architecture,
      createdAt: Date.now()
    };

    const updatedProjects = [newProject, ...savedProjects];
    setSavedProjects(updatedProjects);
    localStorage.setItem('stackideator_projects', JSON.stringify(updatedProjects));
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = savedProjects.filter(p => p.id !== projectId);
    setSavedProjects(updatedProjects);
    localStorage.setItem('stackideator_projects', JSON.stringify(updatedProjects));
  };

  const handleLoadProject = (project: SavedProject) => {
    setSelectedIdea(project.idea);
    setArchitecture(project.architecture);
    setIsSidebarOpen(false);
    setTimeout(() => {
      archSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleGenerateIdeas = async () => {
    if (!niche.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedIdea(null);
    setArchitecture(null);
    
    try {
      const generatedIdeas = await generateAppIdeas(niche);
      setIdeas(generatedIdeas);
      setTimeout(() => {
        ideasSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError("Failed to generate ideas. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIdea = async (idea: AppIdea) => {
    setSelectedIdea(idea);
    setArchitecture(null);
    setArchLoading(true);
    
    // Scroll to arch section immediately
    setTimeout(() => {
        archSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const arch = await generateArchitecture(idea.title, idea.description);
      setArchitecture(arch);
    } catch (err) {
      setError("Failed to generate architecture details.");
    } finally {
      setArchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      
      <SavedProjectsSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projects={savedProjects}
        onLoad={handleLoadProject}
        onDelete={handleDeleteProject}
      />

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-sky-400">
              StackIdeator
            </span>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-2 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-all"
             >
                <HardDrive className="w-4 h-4" />
                <span className="hidden sm:inline">Saved Projects</span>
                <span className="bg-indigo-600 text-white text-[10px] px-1.5 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
                  {savedProjects.length}
                </span>
             </button>
             <span className="h-6 w-px bg-slate-700 hidden sm:block"></span>
             <span className="text-xs font-medium px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 hidden sm:flex items-center gap-1">
                <Cpu className="w-3 h-3" /> Gemini 2.5 Flash
             </span>
             <a href="#" className="text-slate-400 hover:text-white transition-colors">
               <Github className="w-5 h-5" />
             </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-sm font-medium">
             <Sparkles className="w-4 h-4" /> AI-Powered Full-Stack Architect
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Build your next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-indigo-500">
              Spring Boot + React
            </span> app.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Stuck on ideas? Let our AI architect generate complete project concepts, including database schemas, backend modules, and frontend component structures tailored to your niche.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="Enter a niche (e.g., 'Fitness Tracker', 'Inventory System')"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-slate-500"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()}
            />
            <Button 
              onClick={handleGenerateIdeas} 
              isLoading={loading}
              className="min-w-[140px]"
            >
              Generate Ideas
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {SUGGESTED_NICHES.map((s, i) => (
              <button 
                key={i}
                onClick={() => setNiche(s)}
                className="text-xs bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 px-3 py-1.5 rounded-full border border-slate-700 hover:border-indigo-500/50 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
          
          {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Ideas Grid */}
        {ideas.length > 0 && (
          <div ref={ideasSectionRef} className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Terminal className="w-6 h-6 text-indigo-500" /> Generated Projects
              </h2>
              <span className="text-sm text-slate-500">Select an idea to see architecture</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ideas.map((idea) => (
                <IdeaCard 
                  key={idea.id} 
                  idea={idea} 
                  onSelect={handleSelectIdea}
                  isSelected={selectedIdea?.id === idea.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Architecture & Chat View */}
        <div ref={archSectionRef} className="min-h-[400px]">
          {archLoading && (
            <div className="w-full h-64 flex flex-col items-center justify-center space-y-4 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
               <p className="text-slate-400 animate-pulse">Designing database schema & API structure...</p>
            </div>
          )}

          {selectedIdea && architecture && !archLoading && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                 <ArchitectureView 
                    idea={selectedIdea} 
                    architecture={architecture} 
                    onSave={handleSaveProject}
                 />
              </div>
              <div className="xl:col-span-1">
                 <div className="sticky top-24">
                   <ChatInterface idea={selectedIdea} architecture={architecture} />
                 </div>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} StackIdeator. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;