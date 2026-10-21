export class Pedido {
  constructor(cliente, productos = []) {
    this.cliente = cliente;
    this.productos = productos;
  }
}
