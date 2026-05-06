import { useState } from 'react';
import { useEditorStore, NutritionData } from '../../store/editorStore';

interface AnvisaModalProps {
  onClose: () => void;
}

const DEFAULT_WARNINGS = [
  'ESTE PRODUTO NÃO É UM MEDICAMENTO.',
  'NÃO EXCEDER A RECOMENDAÇÃO DIÁRIA DE CONSUMO.',
  'MANTENHA FORA DO ALCANCE DE CRIANÇAS.',
  'GESTANTES, LACTANTES E CRIANÇAS NÃO DEVEM CONSUMIR.',
  'NÃO CONTÉM GLÚTEN.',
  'NÃO CONTÉM AÇÚCARES.',
];

const DEFAULT_NUTRIENTS = [
  { name: 'Valor energético', amount: '0 kcal', dv: '0%' },
  { name: 'Carboidratos', amount: '0 g', dv: '0%' },
  { name: 'Proteínas', amount: '0 g', dv: '0%' },
  { name: 'Gorduras totais', amount: '0 g', dv: '0%' },
  { name: 'Fibra alimentar', amount: '0 g', dv: '0%' },
  { name: 'Sódio', amount: '0 mg', dv: '0%' },
];

export default function AnvisaModal({ onClose }: AnvisaModalProps) {
  const { addElement } = useEditorStore();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<NutritionData>({
    productName: '',
    brand: '',
    netQuantity: '',
    servingSize: '1 cápsula',
    servingsPerPackage: '60',
    ingredients: '',
    nutrients: DEFAULT_NUTRIENTS,
    warnings: [DEFAULT_WARNINGS[0], DEFAULT_WARNINGS[1], DEFAULT_WARNINGS[2]],
  });

  const updateField = (field: keyof NutritionData, value: string) => {
    setData(d => ({ ...d, [field]: value }));
  };

  const updateNutrient = (idx: number, field: 'name' | 'amount' | 'dv', value: string) => {
    const nutrients = [...data.nutrients];
    nutrients[idx] = { ...nutrients[idx], [field]: value };
    setData(d => ({ ...d, nutrients }));
  };

  const addNutrient = () => {
    setData(d => ({ ...d, nutrients: [...d.nutrients, { name: 'Nutriente', amount: '0 g', dv: '0%' }] }));
  };

  const removeNutrient = (idx: number) => {
    setData(d => ({ ...d, nutrients: d.nutrients.filter((_, i) => i !== idx) }));
  };

  const toggleWarning = (w: string) => {
    setData(d => ({
      ...d,
      warnings: d.warnings.includes(w) ? d.warnings.filter(x => x !== w) : [...d.warnings, w],
    }));
  };

  const handleGenerate = () => {
    // Generate nutrition table as a text element on canvas
    const lines: string[] = [];
    lines.push(`INFORMAÇÃO NUTRICIONAL`);
    lines.push(`Porção: ${data.servingSize} (${data.servingsPerPackage} porções por embalagem)`);
    lines.push('─'.repeat(30));
    lines.push(`${'Quantidade por porção'.padEnd(22)}%VD*`);
    lines.push('─'.repeat(30));
    data.nutrients.forEach(n => {
      lines.push(`${n.name.padEnd(20)} ${n.amount.padEnd(8)} ${n.dv}`);
    });
    lines.push('─'.repeat(30));
    lines.push('*% Valores Diários com base em uma dieta de 2.000 kcal.');
    if (data.ingredients) {
      lines.push('');
      lines.push(`INGREDIENTES: ${data.ingredients}`);
    }
    if (data.warnings.length > 0) {
      lines.push('');
      data.warnings.forEach(w => lines.push(w));
    }

    addElement({
      id: `el_${Date.now()}`,
      type: 'nutritionTable',
      x: 20,
      y: 20,
      width: 200,
      height: 300,
      text: lines.join('\n'),
      fontSize: 7,
      fontFamily: 'Inter',
      fontStyle: 'normal',
      fill: '#000000',
      align: 'left',
      tableData: data,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Tabela ANVISA</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 pt-4">
          <div className="flex gap-2 mb-1">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-violet-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-4">
            {step === 1 && 'Etapa 1 de 3 — Informações básicas'}
            {step === 2 && 'Etapa 2 de 3 — Tabela nutricional'}
            {step === 3 && 'Etapa 3 de 3 — Advertências obrigatórias'}
          </p>
        </div>

        {/* Content */}
        <div className="px-5 pb-5">
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome do produto</label>
                <input
                  type="text"
                  value={data.productName}
                  onChange={e => updateField('productName', e.target.value)}
                  placeholder="Ex: Ora Pro Nobis Cápsulas"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Marca</label>
                <input
                  type="text"
                  value={data.brand}
                  onChange={e => updateField('brand', e.target.value)}
                  placeholder="Ex: NaturalLab"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quantidade líquida</label>
                <input
                  type="text"
                  value={data.netQuantity}
                  onChange={e => updateField('netQuantity', e.target.value)}
                  placeholder="Ex: 30g, 60 cápsulas"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tamanho da porção</label>
                  <input
                    type="text"
                    value={data.servingSize}
                    onChange={e => updateField('servingSize', e.target.value)}
                    placeholder="Ex: 1 cápsula"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Porções por embalagem</label>
                  <input
                    type="text"
                    value={data.servingsPerPackage}
                    onChange={e => updateField('servingsPerPackage', e.target.value)}
                    placeholder="Ex: 60"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ingredientes</label>
                <textarea
                  value={data.ingredients}
                  onChange={e => updateField('ingredients', e.target.value)}
                  placeholder="Liste os ingredientes separados por vírgula..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-400 resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Informe os nutrientes e seus valores por porção.</p>
              <div className="space-y-2">
                {data.nutrients.map((n, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      value={n.name}
                      onChange={e => updateNutrient(idx, 'name', e.target.value)}
                      className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-violet-400"
                      placeholder="Nutriente"
                    />
                    <input
                      value={n.amount}
                      onChange={e => updateNutrient(idx, 'amount', e.target.value)}
                      className="w-20 border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-violet-400"
                      placeholder="Qtd"
                    />
                    <input
                      value={n.dv}
                      onChange={e => updateNutrient(idx, 'dv', e.target.value)}
                      className="w-14 border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-violet-400"
                      placeholder="%VD"
                    />
                    <button
                      onClick={() => removeNutrient(idx)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addNutrient}
                className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                Adicionar nutriente
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-3">Selecione as advertências obrigatórias para o seu produto.</p>
              {DEFAULT_WARNINGS.map((w) => (
                <label key={w} className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={data.warnings.includes(w)}
                    onChange={() => toggleWarning(w)}
                    className="mt-0.5 accent-violet-600"
                  />
                  <span className="text-xs text-gray-700 group-hover:text-gray-900 leading-relaxed">{w}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors"
            >
              Voltar
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="px-5 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="px-5 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
            >
              Gerar tabela no rótulo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
