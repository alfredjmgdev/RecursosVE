export class VenezuelaState {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly codigo: string,
    public readonly lat: number,
    public readonly lng: number,
    public readonly zoom: number,
  ) {}
}
