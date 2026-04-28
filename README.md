# AyudaInvestigacion (MVP v0.1)

AyudaInvestigacion es una herramienta web gratuita para ayudar a estudiantes e investigadores noveles a crear el borrador inicial de proyectos de investigación (TFG, TFM, tesis, protocolos y estudios sanitarios/académicos).

## Descripción

Esta primera versión funciona 100% en navegador y sin backend.
Incluye un flujo guiado de 8 pasos y genera automáticamente:

- Título provisional.
- Pregunta de investigación inicial.
- Objetivo general.
- 3 objetivos específicos.
- Diseño metodológico sugerido.
- Variables mínimas recomendadas.
- Alertas metodológicas y éticas básicas.
- Checklist previo a revisión por tutor o comité ético.

## Cómo usar

1. Abre `index.html` en tu navegador.
2. Completa el formulario guiado (puedes dejar campos vacíos).
3. Pulsa **Generar borrador**.
4. Revisa el resultado y las advertencias.
5. Usa:
   - **Copiar resultado** para portapapeles.
   - **Descargar .txt** para guardar el borrador.
   - **Reiniciar formulario** para empezar de nuevo.

## Despliegue en GitHub Pages

Como el proyecto es estático (HTML/CSS/JS), se puede publicar directamente:

1. Sube los archivos al repositorio en la rama principal (`main` o la que uses para publicación).
2. En GitHub, ve a **Settings → Pages**.
3. En **Build and deployment**, selecciona:
   - **Source**: *Deploy from a branch*.
   - **Branch**: la rama deseada y carpeta `/ (root)`.
4. Guarda y espera a que GitHub Pages publique el sitio.

## Principios del proyecto

- Gratuito.
- Local-first.
- Sin APIs externas.
- Sin backend.
- Sin recopilación de datos personales.

## Marco de uso responsable

- Herramienta gratuita de apoyo metodológico para borradores iniciales.
- Funcionamiento local-first: el contenido se procesa en el navegador del usuario.
- No sustituye la supervisión de tutor, dirección académica ni evaluación por CEI/CEIm cuando aplique.
- Evita introducir datos personales reales si no es estrictamente necesario para la práctica o simulación.
- Revisa y valida siempre el resultado antes de usarlo en documentación oficial.

## Estado

- **MVP v0.1** (funcional inicial).

## Estructura

- `index.html` interfaz principal.
- `styles.css` estilos responsive.
- `script.js` lógica del formulario y motor de reglas.
- `ROADMAP.md` fases de evolución.
- `docs/metodologia.md` guía metodológica breve.
- `docs/etica.md` guía ética básica.

## Importante

Herramienta de apoyo. No sustituye la supervisión de un tutor, comité ético o metodólogo.
