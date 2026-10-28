// Contrato: aplicar(subtotal) devuelve el subtotal con el descuento ya aplicado,
// sin lanzar errores.

export class DescuentoNormal {
  aplicar(subtotal) {
    return subtotal;
  }
}

export class DescuentoPremium {
  aplicar(subtotal) {
    return subtotal * 0.9;
  }
}

export class DescuentoVip {
  aplicar(subtotal) {
    return subtotal * 0.8;
  }
}

export class DescuentoMayorista {
  aplicar(subtotal) {
    return subtotal * 0.75;
  }
}
