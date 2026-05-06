import { useLocation } from 'wouter';
import { trpc } from '../lib/trpc';
import { useEditorStore } from '../store/editorStore';
import { LabelProject } from '../store/editorStore';
import { toast } from 'sonner';

export default function Projects() {
  const [, navigate] = useLocation();
  const { setProject } = useEditorStore();
  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery();
  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success('Projeto excluído!');
      refetch();
    },
  });

  const openProject = (projectData: string) => {
    try {
      const parsed: LabelProject = JSON.parse(projectData);
      setProject(parsed);
      navigate('/editor');
    } catch {
      toast.error('Erro ao abrir projeto');
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Header */}
      <div className="h-14 bg-[#1a1a2e] border-b border-[#2d2d3d] flex items-center px-6 gap-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <span className="text-white font-bold text-lg">Rotulabel</span>
        <div className="flex-1" />
        <button
          onClick={() => navigate('/editor')}
          className="px-4 py-2 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded text-sm font-medium hover:from-[#6d28d9] hover:to-[#5b21b6] transition-all"
        >
          + Novo Rótulo
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-3 py-2 text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          Início
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">Meus Projetos</h1>
        <p className="text-[#64748b] mb-8">Seus rótulos salvos</p>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-[#1e1e2e] rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && (!projects || projects.length === 0) && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20">📋</div>
            <p className="text-[#64748b] text-lg mb-4">Nenhum projeto salvo ainda</p>
            <button
              onClick={() => navigate('/editor')}
              className="px-6 py-3 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-lg font-medium hover:from-[#6d28d9] hover:to-[#5b21b6] transition-all"
            >
              Criar Primeiro Rótulo
            </button>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects.map(project => (
              <div
                key={project.id}
                className="bg-[#1e1e2e] rounded-xl border border-[#2d2d3d] hover:border-[#7c3aed] transition-all group overflow-hidden"
              >
                <div
                  className="h-36 bg-gradient-to-br from-[#7c3aed]/20 to-[#4c1d95]/20 flex items-center justify-center cursor-pointer"
                  onClick={() => openProject(project.data)}
                >
                  <div className="text-4xl opacity-30">🏷️</div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-white truncate">{project.name}</p>
                  <p className="text-xs text-[#64748b] mt-1">
                    {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openProject(project.data)}
                      className="flex-1 py-1.5 text-xs bg-[#7c3aed]/20 hover:bg-[#7c3aed]/40 text-[#7c3aed] rounded transition-all"
                    >
                      Abrir
                    </button>
                    <button
                      onClick={() => deleteProject.mutate({ id: project.id })}
                      className="py-1.5 px-2 text-xs bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
