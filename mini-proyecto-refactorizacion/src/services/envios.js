// Contrato: costo() devuelve el costo del envio, un numero mayor o igual a 0,
// sin lanzar errores.

export class EnvioNormal {
  costo() {
    return 1000;
  }
}

export class EnvioExpress {
  costo() {
    return 2000;
  }
}

export class EnvioRetiroLocal {
  costo() {
    return 0;
  }
}
