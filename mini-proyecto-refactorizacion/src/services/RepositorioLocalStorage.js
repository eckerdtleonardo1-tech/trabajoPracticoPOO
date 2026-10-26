export class RepositorioLocalStorage {
  guardar(pedidos) {
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
  }
}
