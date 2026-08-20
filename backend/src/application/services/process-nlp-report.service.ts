import { Injectable } from '@nestjs/common';
import { NlpExtractedEntity, ProcessNlpReportUseCase } from '../../domain/ports/in/process-nlp-report.use-case';
import { ResourceCategory } from '../../domain/entities/report.entity';

@Injectable()
export class ProcessNlpReportService implements ProcessNlpReportUseCase {
  private readonly ollamaUrls = [
    process.env.OLLAMA_HOST || 'http://ollama:11434',
    'http://host.docker.internal:11434',
    'http://localhost:11434',
  ];

  async execute(text: string): Promise<NlpExtractedEntity> {
    const prompt = `Sos el Agente 1 (NLP Captura) de RecursosVE, un sistema de logística de desastres en Venezuela.
Tu objetivo es analizar un reporte informal de emergencia y extraer las entidades estructuradas estrictamente en formato JSON válido, sin ningún texto alrededor ni markdown.

Devolvé únicamente un objeto JSON con este formato exacto:
{
  "categoria": "MEDICAMENTO" | "AGUA" | "ALIMENTO" | "ROPA" | "ABRIGO" | "OTRO",
  "item": "Nombre específico del recurso (ej: Insulina, Agua Potable, Paracetamol, Carpas, Mantas)",
  "cantidadRequerida": número entero (ej: 50),
  "unidad": "unidad de medida (dosis, litros, cajas, unidades, paquetes, etc.)",
  "poblacionVulnerable": true o false (true si hay niños, ancianos, heridos, enfermos o embarazadas),
  "horasSinCobertura": número entero de horas,
  "campamento": "Nombre del campamento, barrio o zona mencionada",
  "estadoNombre": "Nombre de alguno de los estados de Venezuela (ej: La Guaira, Caracas, Aragua, Zulia, Miranda, Apure, etc.)"
}

Mensaje de emergencia a analizar:
"${text}"`;

    for (const url of this.ollamaUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(`${url}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || 'qwen2.5:1.5b',
            prompt,
            stream: false,
            options: {
              temperature: 0.1,
            },
          }),
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = (await response.json()) as { response?: string };
          const rawResponse = data.response || '';
          const parsed = this.cleanAndParseJson(rawResponse, text);
          if (parsed) {
            return {
              ...parsed,
              rawText: text,
              rawNlpResponse: rawResponse,
              source: 'OLLAMA_QWEN2.5',
            };
          }
        }
      } catch (error) {
        // Try next Ollama URL
      }
    }

    // Fallback heuristic if Ollama service is unreachable
    return this.fallbackHeuristic(text);
  }

  private cleanAndParseJson(rawText: string, text: string): Omit<NlpExtractedEntity, 'rawText' | 'source'> | null {
    try {
      // Clean JSON delimiters ```json ... ```
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1) return null;

      const jsonStr = cleaned.slice(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

      const categoriaStr = String(parsed.categoria || '').toUpperCase();
      let categoria = ResourceCategory.OTRO;
      if (Object.values(ResourceCategory).includes(categoriaStr as ResourceCategory)) {
        categoria = categoriaStr as ResourceCategory;
      } else if (text.toLowerCase().includes('agua')) {
        categoria = ResourceCategory.AGUA;
      } else if (text.toLowerCase().includes('insulina') || text.toLowerCase().includes('medicin')) {
        categoria = ResourceCategory.MEDICAMENTO;
      }

      return {
        categoria,
        item: String(parsed.item || 'Insumo de emergencia'),
        cantidadRequerida: Math.max(1, parseInt(String(parsed.cantidadRequerida || '20'), 10)),
        unidad: String(parsed.unidad || 'unidades'),
        poblacionVulnerable: Boolean(parsed.poblacionVulnerable),
        horasSinCobertura: Math.max(1, parseInt(String(parsed.horasSinCobertura || '24'), 10)),
        campamento: String(parsed.campamento || 'Campamento de Emergencia'),
        estadoNombre: String(parsed.estadoNombre || 'La Guaira'),
      };
    } catch (e) {
      return null;
    }
  }

  private fallbackHeuristic(text: string): NlpExtractedEntity {
    const lower = text.toLowerCase();
    let categoria = ResourceCategory.OTRO;
    let item = 'Insumo de Emergencia';
    let unidad = 'unidades';

    if (lower.includes('agua') || lower.includes('potable') || lower.includes('litro')) {
      categoria = ResourceCategory.AGUA;
      item = 'Agua Potable';
      unidad = 'litros';
    } else if (lower.includes('insulina') || lower.includes('medicina') || lower.includes('analgésico') || lower.includes('dosis')) {
      categoria = ResourceCategory.MEDICAMENTO;
      item = 'Medicamentos de Emergencia';
      unidad = 'dosis';
    } else if (lower.includes('arroz') || lower.includes('comida') || lower.includes('alimento')) {
      categoria = ResourceCategory.ALIMENTO;
      item = 'Alimentos No Perecederos';
      unidad = 'kg';
    } else if (lower.includes('manta') || lower.includes('carpa') || lower.includes('cobija')) {
      categoria = ResourceCategory.ABRIGO;
      item = 'Mantas y Carpas';
      unidad = 'unidades';
    }

    const matchNumber = text.match(/\b\d+\b/);
    const cantidadRequerida = matchNumber ? parseInt(matchNumber[0], 10) : 30;

    const poblacionVulnerable = lower.includes('niño') || lower.includes('bebé') || lower.includes('anciano') || lower.includes('herido') || lower.includes('enfermo');

    return {
      categoria,
      item,
      cantidadRequerida,
      unidad,
      poblacionVulnerable,
      horasSinCobertura: 24,
      campamento: 'Campamento de Emergencia',
      estadoNombre: 'La Guaira',
      rawText: text,
      source: 'HEURISTIC_FALLBACK',
    };
  }
}
