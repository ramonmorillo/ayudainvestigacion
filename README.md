# AyudaInvestigacion (v0.2 en desarrollo)

AyudaInvestigacion es una herramienta web gratuita para ayudar a estudiantes e investigadores noveles a crear el borrador inicial de proyectos de investigación (TFG, TFM, tesis, protocolos y estudios sanitarios/académicos).

## Descripción

La versión actual funciona 100% en navegador y sin backend.
Incluye un flujo guiado de 8 pasos y genera automáticamente:

- Título provisional.
- Pregunta de investigación inicial.
- Justificación breve y objetivos.
- Diseño metodológico sugerido.
- Variables principales/secundarias por tipo de estudio.
- Análisis preliminar adaptado por reglas metodológicas.
- Alertas metodológicas y éticas básicas.
- Valoración metodológica inicial (semáforo).
- Recomendaciones de mejora y checklist previo al envío.

## Novedades v0.2

- Motor metodológico por reglas en `script.js` para adaptar el borrador según el tipo de estudio:
  - Observacional transversal
  - Cohorte
  - Casos y controles
  - Ensayo clínico
  - Cualitativo
  - Revisión sistemática
  - Scoping review
  - Delphi
- Nueva sección de **Valoración metodológica inicial** (rojo/amarillo/verde).
- Nueva sección de **Recomendaciones para mejorar antes de enviar al tutor o comité**.
- Estructura de salida ampliada a 13 apartados académicos.

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

- **v0.2 en desarrollo** (motor metodológico por reglas implementado).

## Estructura

- `index.html` interfaz principal.
- `styles.css` estilos responsive.
- `script.js` lógica del formulario y motor metodológico por reglas.
- `ROADMAP.md` fases de evolución.
- `docs/metodologia.md` guía metodológica breve.
- `docs/etica.md` guía ética básica.

## Importante

Herramienta de apoyo. No sustituye la supervisión de un tutor, comité ético o metodólogo.
