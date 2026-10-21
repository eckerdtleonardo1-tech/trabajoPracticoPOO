export class PedidoService {
  constructor() {
    this.pedidos = [];
  }

  registrar(pedido, tipoCliente, tipoEnvio) {
    let total = 0;

    for (const producto of pedido.productos) {
      total += producto.precio;
    }

    if (tipoCliente === "premium") {
      total *= 0.9;
    }

    if (tipoCliente === "vip") {
      total *= 0.8;
    }

    let costoEnvio = 0;

    if (tipoEnvio === "normal") {
      costoEnvio = 1000;
    }

    if (tipoEnvio === "express") {
      costoEnvio = 2000;
    }

    total += costoEnvio;
    this.pedidos.push({ pedido, total });

    localStorage.setItem("pedidos", JSON.stringify(this.pedidos));
    console.log(`Email enviado a ${pedido.cliente.email}`);

    return total;
  }
}
