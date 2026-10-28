import { describe, expect, test } from "@jest/globals";
import { Producto } from "../src/models/Producto.js";
import { Pedido } from "../src/models/Pedido.js";
import { PedidoService } from "../src/services/PedidoService.js";
import { RepositorioLocalStorage } from "../src/services/RepositorioLocalStorage.js";
import { NotificadorConsola } from "../src/services/NotificadorConsola.js";
import { DescuentoNormal, DescuentoMayorista } from "../src/services/descuentos.js";
import { EnvioNormal, EnvioExpress, EnvioRetiroLocal } from "../src/services/envios.js";

// Se usan las implementaciones reales: los tests no verifican ni simulan
// la persistencia ni la notificacion.
function crearService() {
  return new PedidoService(new RepositorioLocalStorage(), new NotificadorConsola());
}

function crearPedido() {
  return new Pedido(
    { nombre: "Ana", email: "ana@example.com" },
    [new Producto(1, "Cuaderno", 3000), new Producto(2, "Lapicera", 1000)],
  );
}

describe("Etapa 4: cliente Mayorista y Retiro en Local", () => {
  test("cliente mayorista recibe 25% de descuento sobre los productos", () => {
    const service = crearService();

    const total = service.registrar(crearPedido(), new DescuentoMayorista(), new EnvioNormal());

    // 4000 - 25% = 3000, mas 1000 de envio
    expect(total).toBe(4000);
  });

  test("retiro en local no agrega costo de envio", () => {
    const service = crearService();

    const total = service.registrar(crearPedido(), new DescuentoNormal(), new EnvioRetiroLocal());

    // 4000 sin descuento, mas 0 de envio
    expect(total).toBe(4000);
  });

  test("mayorista con retiro en local paga solo los productos con descuento", () => {
    const service = crearService();

    const total = service.registrar(crearPedido(), new DescuentoMayorista(), new EnvioRetiroLocal());

    // 4000 - 25% = 3000, mas 0 de envio
    expect(total).toBe(3000);
  });

  test("el descuento mayorista no se aplica al costo de envio", () => {
    const service = crearService();

    const total = service.registrar(crearPedido(), new DescuentoMayorista(), new EnvioExpress());

    // 4000 - 25% = 3000, mas 2000 de envio sin descuento
    expect(total).toBe(5000);
  });

  test("DescuentoMayorista.aplicar devuelve el subtotal con 25% menos", () => {
    // 4000 - 25% = 3000
    expect(new DescuentoMayorista().aplicar(4000)).toBe(3000);
  });

  test("EnvioRetiroLocal.costo devuelve 0", () => {
    // retirar en el local no tiene costo
    expect(new EnvioRetiroLocal().costo()).toBe(0);
  });
});
