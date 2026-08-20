export enum UserRole {
  COORDINADOR = 'COORDINADOR',
  BRIGADISTA = 'BRIGADISTA',
  DONANTE = 'DONANTE',
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  campamentoAsignado?: string;
}

export interface AuthResultFrontend {
  user: User;
  token: string;
}
