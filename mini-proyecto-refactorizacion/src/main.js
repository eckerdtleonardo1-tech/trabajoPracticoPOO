import "./styles.css";
import { Producto } from "./models/Producto.js";
import { Pedido } from "./models/Pedido.js";
import { PedidoService } from "./services/PedidoService.js";

const service = new PedidoService();
const catalogo = [
  new Producto(1, "Cuaderno", 3000),
  new Producto(2, "Lapicera", 1000),
  new Producto(3, "Mochila", 12000),
];
const carrito = [];
const moneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

const listaCatalogo = document.querySelector("#catalogo");
const listaCarrito = document.querySelector("#carrito");
const historial = document.querySelector("#historial");
const estado = document.querySelector("#estado");
const productoForm = document.querySelector("#producto-form");
const pedidoForm = document.querySelector("#pedido-form");
const nombreProducto = document.querySelector("#producto-nombre");
const precioProducto = document.querySelector("#producto-precio");
const nombreCliente = document.querySelector("#cliente-nombre");
const emailCliente = document.querySelector("#cliente-email");

function informarError(mensaje, error) {
  estado.textContent = mensaje;
  estado.className = "error";
  if (error) {
    console.error(mensaje, error);
  }
}

function renderCatalogo() {
  listaCatalogo.replaceChildren();
  for (const producto of catalogo) {
    const item = document.createElement("li");
    const texto = document.createElement("span");
    texto.textContent = `${producto.nombre} · ${moneda.format(producto.precio)}`;
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "secondary";
    boton.textContent = "Agregar";
    boton.setAttribute("aria-label", `Agregar ${producto.nombre}`);
    boton.addEventListener("click", () => {
      carrito.push(producto);
      renderCarrito();
    });
    item.append(texto, boton);
    listaCatalogo.append(item);
  }
}

function renderCarrito() {
  listaCarrito.replaceChildren();
  if (carrito.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Agregá al menos un producto del catálogo.";
    item.className = "muted";
    listaCarrito.append(item);
  }
  carrito.forEach((producto, indice) => {
    const item = document.createElement("li");
    const texto = document.createElement("span");
    texto.textContent = `${producto.nombre} · ${moneda.format(producto.precio)}`;
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "secondary";
    boton.textContent = "Quitar";
    boton.setAttribute("aria-label", `Quitar ${producto.nombre}`);
    boton.addEventListener("click", () => {
      carrito.splice(indice, 1);
      renderCarrito();
    });
    item.append(texto, boton);
    listaCarrito.append(item);
  });
  const subtotal = carrito.reduce((total, producto) => total + producto.precio, 0);
  document.querySelector("#subtotal").textContent = moneda.format(subtotal);
}

productoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nombre = nombreProducto.value.trim();
  const precio = precioProducto.valueAsNumber;
  if (!nombre || !Number.isFinite(precio) || precio <= 0) {
    informarError("Ingresá un nombre y un precio válido mayor que cero.");
    return;
  }
  catalogo.push(new Producto(catalogo.length + 1, nombre, precio));
  renderCatalogo();
  productoForm.reset();
  estado.className = "success";
  estado.textContent = `Producto registrado: ${nombre}.`;
});

pedidoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nombre = nombreCliente.value.trim();
  const email = emailCliente.value.trim();
  if (!nombre || !email || carrito.length === 0) {
    informarError("Completá los datos del cliente y agregá al menos un producto.");
    return;
  }
  const pedido = new Pedido({ nombre, email }, [...carrito]);
  const tipoCliente = document.querySelector("#tipo-cliente").value;
  const tipoEnvio = document.querySelector("#tipo-envio").value;
  let total;
  try {
    total = service.registrar(pedido, tipoCliente, tipoEnvio);
  } catch (error) {
    informarError(
      "No se completó el registro. Revisá la consola y localStorage antes de reintentar: el servicio inicial puede haber modificado su memoria.",
      error,
    );
    return;
  }

  if (service.pedidos.length === 1) {
    historial.replaceChildren();
  }
  const item = document.createElement("li");
  item.textContent = `${nombre} · ${tipoCliente} · envío ${tipoEnvio} · Total: ${moneda.format(total)}`;
  historial.append(item);
  estado.className = "success";
  estado.textContent = `Pedido registrado. Total: ${moneda.format(total)}. Notificación simulada en la consola.`;
  carrito.length = 0;
  renderCarrito();
});

renderCatalogo();
renderCarrito();
