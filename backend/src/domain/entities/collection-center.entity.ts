export class CollectionCenter {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly lat: number,
    public readonly lng: number,
    public readonly stockInfo: string,
    public readonly contacto: string,
    public readonly createdAt: Date = new Date(),
    public readonly estadoId: number | null = null,
  ) {}
}
