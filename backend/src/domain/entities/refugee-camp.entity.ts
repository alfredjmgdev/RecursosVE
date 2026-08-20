export class RefugeeCamp {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly lat: number,
    public readonly lng: number,
    public readonly poblacion: number,
    public readonly familias: number,
    public readonly capacidad: number,
    public readonly coordinador: string,
    public readonly createdAt: Date = new Date(),
    public readonly estadoId: number | null = null,
  ) {}
}
