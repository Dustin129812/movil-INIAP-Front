export interface Usuario {
  ID: number;
  NOMBRE: string;
  CORREO: string;
}

export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface DatosRegistro {
  name: string;
  email: string;
  password: string;
  uuid: string;
  modelo?: string;
  sistema_operativo?: string;
}

export interface RespuestaAuth {
  success: boolean;
  message?: string;
  ID?: number;
  NOMBRE?: string;
  CORREO?: string;
  TOKEN?: string;
}
