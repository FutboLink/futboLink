/**
 * Plantilla maestra de emails de FutboLink.
 *
 * Centraliza el diseño común (contenedor, colores de marca, footer) que antes
 * estaba copypasteado inline en cada plantilla. NO define un diseño nuevo:
 * reproduce exactamente el markup existente para mantener consistencia visual.
 *
 * Paleta / estructura de marca:
 * - Contenedor: Arial, max-width 600px centrado, borde #ddd, radius 5px, padding 20px.
 * - CTA / acento: verde #27ae60.
 * - Títulos: #2c3e50. Texto: #34495e. Footer: gris #7f8c8d.
 */

export interface EmailCta {
  label: string;
  url: string;
}

export interface EmailLayoutOptions {
  /** Encabezado principal (h2 centrado). */
  title: string;
  /** Cuerpo como lista de párrafos de texto plano. Se ignora si se pasa `bodyHtml`. */
  paragraphs?: string[];
  /** Cuerpo como HTML crudo. Tiene prioridad sobre `paragraphs`. */
  bodyHtml?: string;
  /** Botón de acción opcional. */
  cta?: EmailCta;
  /** Texto de preview (preheader) oculto en el cuerpo del mail. */
  preheader?: string;
}

const renderParagraphs = (paragraphs: readonly string[]): string =>
  paragraphs.map((text) => `<p>${text}</p>`).join('\n          ');

const renderCta = (cta: EmailCta): string => `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${cta.url}"
             style="display: inline-block; padding: 12px 20px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            ${cta.label}
          </a>
        </div>`;

const renderPreheader = (preheader: string): string => `
      <span style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${preheader}</span>`;

/**
 * Devuelve el HTML completo de un email usando el diseño de marca de FutboLink.
 */
export function renderEmailLayout(options: EmailLayoutOptions): string {
  const { title, paragraphs, bodyHtml, cta, preheader } = options;

  const body = bodyHtml ?? renderParagraphs(paragraphs ?? []);
  const preheaderBlock = preheader ? renderPreheader(preheader) : '';
  const ctaBlock = cta ? renderCta(cta) : '';
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="es">
  <body style="margin: 0; padding: 0;">${preheaderBlock}
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #2c3e50; text-align: center;">${title}</h2>

        <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
          ${body}
        </div>
${ctaBlock}
        <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
          <p>FutboLink - Conectando el mundo del fútbol</p>
          <p>&copy; ${year} FutboLink. Todos los derechos reservados.</p>
        </div>
      </div>
  </body>
</html>`;
}
