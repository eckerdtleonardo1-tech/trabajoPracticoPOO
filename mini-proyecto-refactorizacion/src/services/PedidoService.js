export class PedidoService {
  constructor(repositorio, notificador) {
    this.repositorio = repositorio;
    this.notificador = notificador;
    this.pedidos = [];
  }

  registrar(pedido, descuento, envio) {
    let total = 0;

    for (const producto of pedido.productos) {
      total += producto.precio;
    }

    // El descuento se aplica solo a los productos; el envio se suma despues
    total = descuento.aplicar(total);
    total += envio.costo();

    this.pedidos.push({ pedido, total });

    this.repositorio.guardar(this.pedidos);
    this.notificador.notificar(pedido);

    return total;
  }
}
