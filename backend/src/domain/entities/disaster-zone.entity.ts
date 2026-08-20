export type DisasterEventType =
  | 'DESLAVE'
  | 'TERREMOTO'
  | 'INUNDACION'
  | 'HURACAN'
  | 'TORNADO'
  | 'INCENDIO'
  | 'VOLCAN'
  | 'TSUNAMI'
  | 'SEQUIA'
  | 'HELADA'
  | 'EPIDEMIA'
  | 'COLAPSO';

export class DisasterZone {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly tipo: DisasterEventType,
    public readonly lat: number,
    public readonly lng: number,
    public readonly radioMetros: number,
    public readonly createdAt: Date = new Date(),
    public readonly estadoId: number | null = null,
  ) {}
}
