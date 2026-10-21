import { describe, expect, test } from "@jest/globals";
import { Producto } from "../src/models/Producto.js";
import { Pedido } from "../src/models/Pedido.js";
import { PedidoService } from "../src/services/PedidoService.js";

describe("PedidoService: caracterizacion antes de refactorizar", () => {
  test("cliente normal con envio normal paga subtotal mas 1000", () => {
    const pedido = new Pedido(
      { nombre: "Ana", email: "ana@example.com" },
      [new Producto(1, "Cuaderno", 3000), new Producto(2, "Lapicera", 1000)],
    );
    const service = new PedidoService();

    const total = service.registrar(pedido, "normal", "normal");

    expect(total).toBe(5000);
  });

  test.todo("cliente premium recibe 10% de descuento sobre los productos");
  test.todo("cliente VIP recibe 20% de descuento sobre los productos");
  test.todo("envio express agrega 2000");
  test.todo("el descuento no se aplica al costo de envio");
  test.todo("combina distintos tipos de cliente y envio");
  test.todo("conserva correctamente un total con decimales");
  test.todo("registra el pedido y el total en memoria");
  test.todo("conserva dos pedidos registrados con la misma instancia");
});
