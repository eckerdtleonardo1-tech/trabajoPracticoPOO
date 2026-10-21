# Tienda Aula: refactorizacion, SOLID y testing

Proyecto inicial para alumnos, basado en el material **Mini Proyecto:
Refactorizacion, SOLID y Testing**. No incluye la solucion refactorizada.

## Objetivo

Analizar codigo orientado a objetos que funciona, proteger su comportamiento con
Jest y mejorar su diseno con cambios pequenos y justificados. SOLID es una
herramienta de razonamiento, no una lista de cinco requisitos obligatorios.

Modalidad: equipos de 2 o 3 integrantes. Duracion orientativa: Cada integrante debe participar con commits individuales.

## Preparacion y ejecucion

Necesitan Node.js 20.19+ o 22.12+, npm, un navegador y Git para registrar el proceso.

```sh
npm install
npm run dev
```

Abrir la direccion que muestra Vite. No abrir el HTML directamente: se utilizan
modulos y una hoja de estilos importada desde JavaScript.

```sh
npm test
npm run test:watch
npm run test:coverage
npm run build
npm run preview
```

`build` genera la aplicacion en `dist`; `preview` permite revisarla despues de
compilar. En una copia con `package-lock.json`, pueden usar `npm ci` para
instalar exactamente las dependencias registradas.

En VS Code tambien pueden ejecutar las tareas **Iniciar Tienda Aula** y
**Compilar Tienda Aula**, incluidas en `.vscode/tasks.json`.

## Que incluye

- Interfaz para registrar productos, agregarlos o quitarlos de un pedido y
  confirmar pedidos con un cliente y una modalidad de envio.
- Modelos sencillos `Producto` y `Pedido`.
- `PedidoService` funcional con las responsabilidades mezcladas del material.
- Una prueba resuelta como ejemplo y 12 pruebas pendientes con `test.todo`.
- Persistencia en localStorage y notificacion **simulada** con `console.log`.

La interfaz es un apoyo para observar el sistema; no es la arquitectura que
deben copiar ni reemplaza las pruebas unitarias.

### Comportamiento inicial

| Tipo de cliente | Descuento sobre productos |
| --- | --- |
| Normal | 0% |
| Premium | 10% |
| VIP | 20% |

| Envio | Costo |
| --- | --- |
| Normal | $1000 |
| Express | $2000 |

El servicio suma los precios, aplica el descuento y **despues** agrega el envio.
Por ejemplo: productos por $4000, cliente Premium y envio Express dan $5600.
Cada aparicion de un producto en el pedido representa una unidad.

El servicio retorna el total numerico, agrega `{ pedido, total }` a su arreglo
y serializa el arreglo completo con la clave `pedidos`. Finalmente escribe
`Email enviado a <email>` en la consola. No hay servidor ni envio real de correo.

### Limites conocidos: observar antes de corregir

- Usar solamente nombres y emails ficticios. Los pedidos quedan en el navegador;
  pueden borrar la clave `pedidos` desde las herramientas de desarrollo.
- El catalogo y el carrito viven en memoria. Al recargar se reinician.
- El servicio guarda en localStorage, pero no lee pedidos anteriores al iniciar.
  El primer registro luego de recargar reemplaza el historial persistido.
- La interfaz valida campos y exige productos; el servicio inicial no valida
  directamente esas entradas. No confundir ambas capas.
- Un tipo de cliente no reconocido no recibe descuento y un envio no reconocido
  agrega cero. No son opciones ofrecidas por la interfaz.
- No hay redondeo monetario en el servicio. La interfaz solo formatea la
  visualizacion a dos decimales. En tests con decimales usen `toBeCloseTo`.
- Si localStorage falla, el servicio ya agrego el pedido a su memoria.
  La interfaz informa el error; el registro no es atomico.

Estos limites no son arreglos obligatorios. Primero caractericen lo existente.
Cambiar una regla de negocio o el manejo de fallos requiere acordarlo y
documentarlo: no se debe ocultar como una refactorizacion.

## Recorrido de trabajo

**Entender -> Crear test -> Ejecutar -> Refactorizar -> Ejecutar -> Commit.**

### Etapa 1: investigar sin editar

Ejecuten la interfaz, registren dos pedidos y revisen la consola y localStorage.
Lean `src/services/PedidoService.js` y respondan:

1. Que tareas realiza `registrar` y cuales pueden cambiar independientemente.
2. De que dependencias concretas depende.
3. Que habria que modificar si aparecieran nuevos descuentos o envios.
4. Que comportamientos necesitan proteger antes de modificarlo.
5. Por que los modelos sencillos no necesitan necesariamente mas clases.

Entregable: un diagnostico breve, con evidencias del codigo, no solo siglas.

### Etapa 2: caracterizar con Jest

Revisen la prueba de ejemplo y conviertan los `test.todo` en pruebas reales.
Cada test debe preparar datos, ejecutar una accion y verificar un resultado.
Un `todo` no ejecuta ninguna comprobacion: una suite verde con pendientes
**no significa que la actividad este completa**.

Usen una instancia nueva del servicio por caso, excepto cuando quieran comprobar
dos registros consecutivos en la misma instancia. Sigan el ejemplo: creen un
pedido, llamen a `registrar` y comparen el total con `expect(total).toBe(...)`.
Para comprobar cuantos pedidos hay en memoria pueden usar
`expect(service.pedidos.length).toBe(...)`.

Los tests se limitan a calculos, datos de los modelos y pedidos en memoria.
No deben comprobar mensajes de consola ni localStorage, ni simular dependencias.
Al ejecutar los tests pueden aparecer los mensajes de email simulado del
servicio; es normal y no tienen que ocultarlos ni verificarlos.

Agreguen casos sencillos propios, por ejemplo un pedido con un solo producto o
con el mismo producto repetido.

Antes de refactorizar, hagan un commit con las pruebas pasando. No introduzcan
las nuevas reglas de negocio todavia.

### Etapa 3: mejorar el diseno

Elijan un problema real por vez. No hay una arquitectura obligatoria.

- Separen responsabilidades cuando tengan motivos distintos para cambiar (SRP).
- Analicen comportamientos variables y usen polimorfismo donde aporte valor (OCP).
- Reciban al menos una dependencia desde afuera (DIP).
- Verifiquen que las implementaciones puedan sustituirse respetando su contrato
  (LSP). Debatan por que un envio que siempre lanza un error no equivale a uno valido.
- Eviten exigir a una dependencia operaciones que no necesita (ISP). No creen
  un contrato gigante que mezcle guardar, notificar, imprimir y generar PDF.

Despues de cada cambio, ejecuten los tests. Conserven las comprobaciones del
comportamiento original aunque deban adaptar su preparacion a una nueva API.
No borren expectativas para conseguir una suite verde.

Escriban en palabras que hace cada componente que decidan extraer.
Si separan persistencia o notificacion, comprueben su funcionamiento desde la
interfaz. No se pide crear dobles de prueba ni tests de esas dependencias.
Los tests de calculos deben seguir pasando.

La interfaz debe seguir funcionando: conecten las nuevas dependencias desde el
punto de entrada y adapten el acceso al historial si cambia la API publica.

### Etapa 4: ampliaciones a liberar por el docente

No implementar hasta que el docente habilite esta etapa:

1. Cliente **Mayorista**: 25% de descuento sobre productos.
2. **Retiro en Local**: costo de envio $0.

Primero escriban pruebas para las nuevas reglas y observen que fallen por el
comportamiento todavia no implementado. Luego agreguen las implementaciones.
Comprueben si necesitaron modificar las estrategias anteriores o la logica
central. El cableado en el punto de entrada puede cambiar.

Incorporen tambien las nuevas opciones en la interfaz. Verifiquen la combinacion:
productos por $4000 + Mayorista + Retiro en Local = **$3000**.
Las combinaciones anteriores deben seguir dando los mismos resultados.

### Etapa 5: verificar y explicar

- Pasan los tests originales y los de las ampliaciones.
- La aplicacion compila y permite registrar pedidos desde la interfaz.
- Los tests usan datos de ejemplo y comparaciones sencillas con `expect`.
- Al menos una dependencia se recibe desde afuera, sin exigir simularla en tests.
- Cada separacion tiene un motivo; no agregaron clases solo para nombrar SOLID.
- El README del equipo explica integrantes, diagnostico, cambios, principios
  justificados y comandos de ejecucion.
- El repositorio de GitHub muestra el proceso y la participacion individual.

## Git y entrega

Esta carpeta no viene inicializada como repositorio. Cada equipo debe crear su
propio repositorio, revisar lo que agrega y subirlo a GitHub. No subir
`node_modules`, `dist`, `coverage` ni datos personales.

```sh
git init
git add .
git commit -m "chore: agregar proyecto inicial"
```

Ejemplos de commits siguientes:

- `test: caracterizar descuentos y envios`
- `refactor: separar persistencia de pedidos`
- `test: probar servicio con dependencias en memoria`
- `feat: incorporar cliente mayorista`

No alcanza con un unico commit "proyecto terminado".

### Completar por el equipo en su entrega

- Integrantes:
- Descripcion del sistema:
- Problemas detectados y evidencia:
- Refactorizaciones realizadas y por que:
- Principios utilizados y decisiones que los justifican:
- Comportamientos preservados y pruebas que lo demuestran:
- Cambios de comportamiento acordados, si los hubo:
- Como ejecutar la aplicacion y los tests:
