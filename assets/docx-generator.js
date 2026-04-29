(function () {
  const esc = (s = '') => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  window.generateProtocolDocx = function generateProtocolDocx(values, draftData, readiness, mode = 'protocol') {
    const sections = Object.entries(draftData.sections || {})
      .map(([k, v]) => `<h3>${esc(k)}</h3><p>${esc(v)}</p>`)
      .join('');
    const pending = (draftData.pendingInfo || []).map((x) => `<li>${esc(x)}</li>`).join('') || '<li>No detectado</li>';
    const checklist = (draftData.checklist || []).map((x) => `<li>${esc(x)}</li>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>AyudaInvestigacion</title></head><body>
    <h1>${mode === 'readiness' ? 'Informe de madurez' : 'Protocolo de investigación'}</h1>
    <p><strong>Fecha:</strong> ${new Date().toISOString().slice(0, 10)}</p>
    <p><strong>Título:</strong> ${esc(values.title || 'Pendiente')}</p>
    <p><strong>Estado:</strong> ${esc(readiness.status)} (${readiness.completion}%)</p>
    <h2>Campos críticos pendientes</h2><ul>${pending}</ul>
    <h2>Desarrollo del borrador</h2>${sections}
    <h2>Checklist</h2><ul>${checklist}</ul>
    <p>Herramienta creada por Ramón Morillo. Abril de 2026.</p>
    </body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileBase = mode === 'readiness' ? 'informe_madurez_proyecto' : 'protocolo_investigacion';
    a.href = url;
    a.download = `${fileBase}_${new Date().toISOString().slice(0, 10)}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
})();
