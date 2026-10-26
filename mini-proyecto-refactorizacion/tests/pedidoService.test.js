import { describe, expect, test } from "@jest/globals";
import { Producto } from "../src/models/Producto.js";
import { Pedido } from "../src/models/Pedido.js";
import { PedidoService } from "../src/services/PedidoService.js";
import { RepositorioLocalStorage } from "../src/services/RepositorioLocalStorage.js";
import { NotificadorConsola } from "../src/services/NotificadorConsola.js";
import { DescuentoNormal, DescuentoPremium, DescuentoVip } from "../src/services/descuentos.js";
import { EnvioNormal, EnvioExpress } from "../src/services/envios.js";

// Se usan las implementaciones reales: los tests no verifican ni simulan
// la persistencia ni la notificacion.
function crearService() {
  return new PedidoService(new RepositorioLocalStorage(), new NotificadorConsola());
}

describe("PedidoService: caracterizacion antes de refactorizar", () => {
  test("cliente normal con envio normal paga subtotal mas 1000", () => {
    const pedido = new Pedido(
      { nombre: "Ana", email: "ana@example.com" },
      [new Producto(1, "Cuaderno", 3000), new Producto(2, "Lapicera", 1000)],
    );
    const service = crearService();

    const total = service.registrar(pedido, new DescuentoNormal(), new EnvioNormal());

    expect(total).toBe(5000);
  });

  test("cliente premium recibe 10% de descuento sobre los productos", () => {
    const pedido = new Pedido(
      { nombre: "Ana", email: "ana@example.com" },
      [new Producto(1, "Cuaderno", 3000), new Producto(2, "Lapicera", 1000)],
    );
    const service = crearService();

    const total = service.registrar(pedido, new DescuentoPremium(), new EnvioNormal());

    // 4000 - 10% = 3600, mas 1000 de envio
    expect(total).toBe(4600);
  });

  test("cliente VIP recibe 20% de descuento sobre los productos", () => {
    const pedido = new Pedido(
      { nombre: "Ana", email: "ana@example.com" },
      [new Producto(1, "Cuaderno", 3000), new Producto(2, "Lapicera", 1000)],
    );
    const service = crearService();

    const total = service.registrar(pedido, new DescuentoVip(), new EnvioNormal());

    // 4000 - 20% = 3200, mas 1000 de envio
    expect(total).toBe(4200);
  });

  test("envio express agrega 2000", () => {
    const pedido = new Pedido(
      { nombre: "Ana", email: "ana@example.com" },
      [new Producto(1, "Cuaderno", 3000), new Producto(2, "Lapicera", 1000)],
    );
    const service = crearService();

    const total = service.registrar(pedido, new DescuentoNormal(), new EnvioExpress());

    expect(total).toBe(6000);
  });

  test("el descuento no se aplica al costo de envio", () => {
    const pedido = new Pedido(
      { nombre: "Ana", email: "ana@example.com" },
      [new Producto(1, "Cuaderno", 3000), new Producto(2, "Lapicera", 1000)],
    );
    const service = crearService();

    const total = service.registrar(pedido, new DescuentoPremium(), new EnvioExpress());

    // 3600 + 2000. Si el descuento incluyera el envio daria (4000 + 2000) * 0.9 = 5400
    expect(total).toBe(5600);
  });

  test("combina distintos tipos de cliente y envio", () => {
    const pedido = new Pedido(
      { nombre: "Ana", email: "ana@example.com" },
      [new Producto(1, "Cuaderno", 3000), new Producto(2, "Lapicera", 1000)],
    );
    const service = crearService();

    const total = service.registrar(pedido, new DescuentoVip(), new EnvioExpress());

    // 4000 - 20% = 3200, mas 2000 de envio
    expect(total).toBe(5200);
  });

  test("conserva correctamente un total con decimales", () => {
    const pedido = new Pedido(
      { nombre: "Ana", email: "ana@example.com" },
      [new Producto(1, "Regla", 999.99)],
    );
    const service = crearService();

    const total = service.registrar(pedido, new DescuentoPremium(), new EnvioNormal());

    // 999.99 - 10% = 899.991, mas 1000 de envio
    expect(total).toBeCloseTo(1899.991);
  });

  test("registra el pedido y el total en memoria", () => {
    const pedido = new Pedido(
      { nombre: "Ana", email: "ana@example.com" },
      [new Producto(1, "Cuaderno", 3000), new Producto(2, "Lapicera", 1000)],
    );
    const service = crearService();

    service.registrar(pedido, new DescuentoNormal(), new EnvioNormal());

    expect(service.pedidos.length).toBe(1);
    expect(service.pedidos[0].pedido).toBe(pedido);
    expect(service.pedidos[0].total).toBe(5000);
  });

  test("conserva dos pedidos registrados con la misma instancia", () => {
    const pedido1 = new Pedido(
      { nombre: "Ana", email: "ana@example.com" },
      [new Producto(1, "Cuaderno", 3000)],
    );
    const pedido2 = new Pedido(
      { nombre: "Juan", email: "juan@example.com" },
      [new Producto(2, "Lapicera", 1000)],
    );
    const service = crearService();

    service.registrar(pedido1, new DescuentoNormal(), new EnvioNormal());
    service.registrar(pedido2, new DescuentoVip(), new EnvioExpress());

    expect(service.pedidos.length).toBe(2);
    expect(service.pedidos[0].pedido).toBe(pedido1);
    expect(service.pedidos[0].total).toBe(4000);
    expect(service.pedidos[1].pedido).toBe(pedido2);
    expect(service.pedidos[1].total).toBe(2800);
  });

  // Casos propios
  test("pedido con un solo producto paga su precio mas el envio", () => {
    const pedido = new Pedido(
      { nombre: "Ana", email: "ana@example.com" },
      [new Producto(1, "Mochila", 2500)],
    );
    const service = crearService();

    const total = service.registrar(pedido, new DescuentoNormal(), new EnvioNormal());

    expect(total).toBe(3500);
  });

  test("el mismo producto repetido se cobra una vez por cada aparicion", () => {
    const cuaderno = new Producto(1, "Cuaderno", 3000);
    const pedido = new Pedido(
      { nombre: "Ana", email: "ana@example.com" },
      [cuaderno, cuaderno],
    );
    const service = crearService();

    const total = service.registrar(pedido, new DescuentoNormal(), new EnvioNormal());

    expect(total).toBe(7000);
  });
});
