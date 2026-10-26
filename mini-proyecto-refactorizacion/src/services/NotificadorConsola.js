// Notificacion simulada: no envia ningun email real.
export class NotificadorConsola {
  notificar(pedido) {
    console.log(`Email enviado a ${pedido.cliente.email}`);
  }
}
