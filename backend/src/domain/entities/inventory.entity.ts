import { GeoLocation, ResourceCategory } from './report.entity';

export class CommunityInventory {
  constructor(
    public readonly id: string,
    public readonly ubicacion: GeoLocation,
    public readonly categoria: ResourceCategory,
    public readonly item: string,
    public cantidadDisponible: number,
    public readonly unidad: string,
    public readonly contacto: string,
    public readonly createdAt: Date = new Date(),
    public expiraEn: Date = new Date(Date.now() + 48 * 60 * 60 * 1000), // Default 48h expiration
  ) {}

  public isExpired(): boolean {
    return new Date() > this.expiraEn;
  }
}
