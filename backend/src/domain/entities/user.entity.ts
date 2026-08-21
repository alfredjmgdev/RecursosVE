export enum UserRole {
  COORDINADOR = 'COORDINADOR',
  BRIGADISTA = 'BRIGADISTA',
  DONANTE = 'DONANTE',
  TRANSPORTISTA = 'TRANSPORTISTA',
}

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly nombre: string,
    public readonly rol: UserRole,
    public readonly campamentoAsignado?: string,
  ) {}
}
