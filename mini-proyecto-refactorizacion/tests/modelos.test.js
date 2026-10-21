import { describe, test } from "@jest/globals";

describe("Modelos: completar sin agregar responsabilidades innecesarias", () => {
  test.todo("Producto conserva su id, nombre y precio");
  test.todo("Pedido conserva su cliente y sus productos");
  test.todo("Pedido comienza con productos vacios cuando se omiten");
  test.todo("dos pedidos creados sin productos no comparten el mismo arreglo");
});
