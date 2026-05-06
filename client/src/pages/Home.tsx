import { useLocation } from 'wouter';
import { trpc } from '../lib/trpc';
import { getLoginUrl } from '../const';

export default function Home() {
  const [, navigate] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();

  const features = [
    { icon: '🎨', title: 'Editor Canvas Profissional', desc: 'Drag-and-drop fluido com Konva.js. Mova, redimensione e rotacione elementos com precisão.' },
    { icon: '📋', title: 'Templates Prontos', desc: '6 templates pré-montados para Sono, Emagrecedor, Vitaminas, Performance, Feminino e mais.' },
    { icon: '🖼️', title: 'Banco de Imagens', desc: 'Ingredientes botânicos, cápsulas, texturas e selos prontos para usar no seu rótulo.' },
    { icon: '✨', title: 'Gradientes Avançados', desc: '12 gradientes profissionais com preview visual. Linear e radial com múltiplas cores.' },
    { icon: '🔤', title: '15 Fontes Premium', desc: 'Montserrat, Oswald, Raleway, Bebas Neue e mais. Tipografia profissional para rótulos.' },
    { icon: '📄', title: 'Exportação PDF', desc: 'Exporte seu rótulo em PDF de alta qualidade, pronto para impressão profissional.' },
  ];

  const categories = [
    { name: 'Sono & Relaxamento', color: '#7c3aed', bg: 'from-[#7c3aed]/20 to-[#4c1d95]/20' },
    { name: 'Emagrecedores', color: '#ef4444', bg: 'from-[#ef4444]/20 to-[#7f1d1d]/20' },
    { name: 'Vitaminas', color: '#16a34a', bg: 'from-[#16a34a]/20 to-[#14532d]/20' },
    { name: 'Performance', color: '#d97706', bg: 'from-[#d97706]/20 to-[#78350f]/20' },
    { name: 'Saúde Feminina', color: '#db2777', bg: 'from-[#db2777]/20 to-[#831843]/20' },
    { name: 'Personalizado', color: '#64748b', bg: 'from-[#64748b]/20 to-[#334155]/20' },
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Navigation */}
      <nav className="h-16 bg-[#1a1a2e]/80 backdrop-blur-sm border-b border-[#2d2d3d] sticky top-0 z-50 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] flex items-center justify-center shadow-lg shadow-[#7c3aed]/30">
            <span className="text-white font-black text-base">R</span>
          </div>
          <div>
            <span className="text-white font-bold text-lg">Rotulabel</span>
            <span className="text-[#7c3aed] text-xs ml-1 font-medium">PRO ✦</span>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-[#94a3b8]">Olá, {user.name || 'Designer'}</span>
              <button
                onClick={() => navigate('/projects')}
                className="px-3 py-2 text-sm text-[#94a3b8] hover:text-white transition-colors"
              >
                Meus Projetos
              </button>
              <button
                onClick={() => navigate('/editor')}
                className="px-4 py-2 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-lg text-sm font-medium hover:from-[#6d28d9] hover:to-[#5b21b6] transition-all shadow-lg shadow-[#7c3aed]/25"
              >
                Abrir Editor
              </button>
            </>
          ) : (
            <>
              <a href={getLoginUrl()} className="px-4 py-2 text-sm text-[#94a3b8] hover:text-white transition-colors">
                Entrar
              </a>
              <button
                onClick={() => navigate('/editor')}
                className="px-4 py-2 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-lg text-sm font-medium hover:from-[#6d28d9] hover:to-[#5b21b6] transition-all shadow-lg shadow-[#7c3aed]/25"
              >
                Começar Grátis
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/10 via-transparent to-[#4c1d95]/10 pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#7c3aed]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#4c1d95]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 py-20 text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#7c3aed]/10 border border-[#7c3aed]/30 rounded-full px-4 py-1.5 text-sm text-[#a78bfa] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse" />
            Editor profissional para nutracêuticos e suplementos
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Crie rótulos
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#6d28d9]">
              profissionais
            </span>
            em minutos
          </h1>

          <p className="text-xl text-[#94a3b8] mb-10 max-w-2xl mx-auto leading-relaxed">
            Editor estilo Canva com drag-and-drop, templates pré-prontos, banco de imagens botânicas, gradientes e exportação em PDF. Feito para designers de rótulos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/editor')}
              className="px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-xl text-base font-bold hover:from-[#6d28d9] hover:to-[#5b21b6] transition-all shadow-2xl shadow-[#7c3aed]/30 hover:shadow-[#7c3aed]/50 hover:-translate-y-0.5"
            >
              Abrir Editor Agora →
            </button>
            {user && (
              <button
                onClick={() => navigate('/projects')}
                className="px-8 py-4 bg-[#1e1e2e] border border-[#2d2d3d] hover:border-[#7c3aed] rounded-xl text-base font-medium text-[#94a3b8] hover:text-white transition-all"
              >
                Ver Meus Projetos
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-3">Templates por Categoria</h2>
        <p className="text-[#64748b] text-center mb-10">Comece com um template profissional e personalize</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => navigate('/editor')}
              className={`p-6 bg-gradient-to-br ${cat.bg} border border-[#2d2d3d] hover:border-[${cat.color}] rounded-xl text-left transition-all hover:-translate-y-0.5 group`}
            >
              <div
                className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center text-white font-bold text-sm"
                style={{ background: cat.color }}
              >
                {cat.name[0]}
              </div>
              <p className="font-semibold text-white">{cat.name}</p>
              <p className="text-xs text-[#64748b] mt-1 group-hover:text-[#94a3b8] transition-colors">Template pronto →</p>
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-[#1a1a2e]/50 border-y border-[#2d2d3d]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-3">Recursos Profissionais</h2>
          <p className="text-[#64748b] text-center mb-12">Tudo que você precisa para criar rótulos de alta qualidade</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 bg-[#1e1e2e] border border-[#2d2d3d] rounded-xl hover:border-[#7c3aed]/50 transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto para criar seu rótulo?</h2>
        <p className="text-[#64748b] mb-8">Comece agora com um template profissional</p>
        <button
          onClick={() => navigate('/editor')}
          className="px-10 py-4 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-xl text-base font-bold hover:from-[#6d28d9] hover:to-[#5b21b6] transition-all shadow-2xl shadow-[#7c3aed]/30"
        >
          Abrir Editor Gratuito →
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-[#2d2d3d] py-8 text-center text-sm text-[#64748b]">
        <p>Rotulabel — Editor Profissional de Rótulos para Nutracêuticos</p>
      </div>
    </div>
  );
}
