# Tienda Aula: entrega del equipo

Trabajo práctico de refactorización, SOLID y testing sobre el proyecto
**Tienda Aula**. El código está en
[mini-proyecto-refactorizacion/](mini-proyecto-refactorizacion/) y la consigna
original del docente, en su
[README](mini-proyecto-refactorizacion/README.md).

## Integrantes

| Integrante | Autor en los commits |
| --- | --- |
| Leonardo Matias Eckerdt | Leonardo |
| Fabrizio Perez Leal | Fabrizio Perez |

Cada etapa o paso tiene su propio commit, alternando entre los dos:

| Etapa | Qué se hizo | Integrante | Commit |
| --- | --- | --- | --- |
| Inicio | Copia del proyecto inicial | Leonardo | `427007f` |
| 1 | Investigar sin editar (diagnóstico en `respuestas.md`) | Fabrizio | `f6e4055` |
| 2 | Caracterizar con Jest | Leonardo | `09bea98` |
| 3, paso 1 | Separar persistencia y notificación | Fabrizio | `364ccfc` |
| 3, paso 2 | Descuentos y envíos como estrategias | Leonardo | `33ee261` |
| 4, paso 1 | Tests de Mayorista y Retiro en Local (fallando) | Leonardo | `b582103` |
| 4, paso 2 | Implementar Mayorista y Retiro en Local | Fabrizio | `c406a2e` |
| 4, paso 3 | Opciones nuevas en la interfaz | Leonardo | `75aa987` |

## Descripción del sistema

Tienda Aula es una aplicación web (JavaScript con Vite) para registrar
productos, armar un pedido y confirmarlo con un cliente, un tipo de cliente y
una modalidad de envío. `PedidoService` calcula el total: suma los precios,
aplica el descuento del cliente sobre los productos y **después** suma el
envío. El pedido se guarda en localStorage y se simula un email por consola.

Reglas vigentes (las marcadas con * se agregaron en la Etapa 4):

| Tipo de cliente | Descuento sobre productos |
| --- | --- |
| Normal | 0% |
| Premium | 10% |
| VIP | 20% |
| Mayorista* | 25% |

| Envío | Costo |
| --- | --- |
| Normal | $1000 |
| Express | $2000 |
| Retiro en local* | $0 |

Archivos principales:

```text
respuestas.md                          diagnóstico de la Etapa 1
mini-proyecto-refactorizacion/
  index.html                           interfaz
  src/
    main.js                            punto de entrada: interfaz y cableado
    models/Producto.js, Pedido.js      datos, sin lógica
    services/PedidoService.js          lógica central del pedido
    services/descuentos.js             estrategias de descuento
    services/envios.js                 estrategias de envío
    services/RepositorioLocalStorage.js  persistencia
    services/NotificadorConsola.js     notificación simulada
  tests/
    modelos.test.js
    pedidoService.test.js
    ampliaciones.test.js
```

## Problemas detectados y evidencia

El diagnóstico completo de la Etapa 1 está en [respuestas.md](respuestas.md).
Así era `registrar` en el proyecto inicial:

```js
registrar(pedido, tipoCliente, tipoEnvio) {
  let total = 0;
  for (const producto of pedido.productos) {
    total += producto.precio;
  }
  if (tipoCliente === "premium") {
    total *= 0.9;
  }
  if (tipoCliente === "vip") {
    total *= 0.8;
  }
  let costoEnvio = 0;
  if (tipoEnvio === "normal") {
    costoEnvio = 1000;
  }
  if (tipoEnvio === "express") {
    costoEnvio = 2000;
  }
  total += costoEnvio;
  this.pedidos.push({ pedido, total });
  localStorage.setItem("pedidos", JSON.stringify(this.pedidos));
  console.log(`Email enviado a ${pedido.cliente.email}`);
  return total;
}
```

1. **`registrar` hacía todo.** Sumaba, descontaba, calculaba el envío, guardaba
   y notificaba. Son cinco tareas que cambian por motivos distintos (decisiones
   comerciales, logística, almacenamiento, forma de avisar) y todas obligaban a
   editar la misma función.
2. **Dependía de herramientas concretas.** Usaba `localStorage` y `console.log`
   directamente. Fuera del navegador (por ejemplo, en Node.js) `localStorage` no
   existe y el servicio se rompe.
3. **Cada descuento o envío nuevo era otro `if`.** Para agregar un tipo de
   cliente había que abrir `registrar` y tocar código que ya funcionaba.
4. **Qué había que proteger antes de tocarlo:** los porcentajes de cada cliente,
   los costos de envío, el caso normal y, sobre todo, el orden del cálculo:
   primero el descuento sobre los productos y después el envío.
5. **Los modelos no eran el problema.** `Producto` y `Pedido` solo guardan
   datos; agregarles clases complicaría el código sin beneficio.

## Refactorizaciones realizadas y por qué

Primero (Etapa 2) protegimos el comportamiento con tests. Después (Etapa 3)
atacamos un problema por vez y corrimos los tests después de cada cambio.

### Etapa 3, paso 1: separar persistencia y notificación (problemas 1 y 2)

- `RepositorioLocalStorage` guarda la lista de pedidos en localStorage con la
  clave `pedidos`.
- `NotificadorConsola` simula el aviso escribiendo `Email enviado a <email>` en
  la consola.
- `PedidoService` recibe ambos en el constructor y ya no usa `localStorage` ni
  `console.log`.
- `main.js` crea los dos objetos y se los pasa al servicio.
- Se mantuvo el orden original: primero memoria, después guardar, por último
  notificar.

### Etapa 3, paso 2: descuentos y envíos como estrategias (problemas 1 y 3)

- Cada tipo de cliente es una clase con `aplicar(subtotal)`: `DescuentoNormal`,
  `DescuentoPremium` y `DescuentoVip`.
- Cada envío es una clase con `costo()`: `EnvioNormal` y `EnvioExpress`.
- `registrar` recibe esos objetos en lugar de textos y ya no tiene `if`.
- `main.js` traduce el valor de cada `<select>` al objeto que corresponde, con
  dos mapas: `descuentos` y `envios`.

Así quedó la lógica central:

```js
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
```

### Etapa 4: Mayorista y Retiro en Local

Primero escribimos 6 tests en `tests/ampliaciones.test.js` y comprobamos que
fallaran. Después agregamos `DescuentoMayorista` (`subtotal * 0.75`) y
`EnvioRetiroLocal` (`0`), los registramos en los mapas de `main.js` y sumamos
las opciones en `index.html`. No hizo falta modificar `PedidoService` ni las
estrategias anteriores:

```text
$ git diff --stat --relative=mini-proyecto-refactorizacion 33ee261 75aa987
 index.html                 |  2 ++
 src/main.js                | 11 ++++++--
 src/services/descuentos.js |  6 ++++
 src/services/envios.js     |  6 ++++
 tests/ampliaciones.test.js | 69 ++++++++++++++++++++++++++++++++++++++++++++++
 5 files changed, 92 insertions(+), 2 deletions(-)
```

`PedidoService.js` no aparece. Las 2 líneas borradas son los `import` de
`main.js`, reescritos para sumar las clases nuevas.

### Qué hace cada componente

| Componente | Qué hace | Por qué está separado |
| --- | --- | --- |
| `PedidoService` | Suma los productos, aplica el descuento, suma el envío, guarda el pedido en memoria y delega guardar y notificar. | Es la lógica central; no debería cambiar por cada regla nueva. |
| `DescuentoNormal` / `Premium` / `Vip` / `Mayorista` | Reciben el subtotal y lo devuelven con su descuento: 0%, 10%, 20% o 25%. | Los descuentos cambian por decisiones comerciales. |
| `EnvioNormal` / `Express` / `RetiroLocal` | Devuelven el costo del envío: $1000, $2000 o $0. | Los costos de envío cambian por logística. |
| `RepositorioLocalStorage` | Guarda la lista completa de pedidos en localStorage con la clave `pedidos`. | Puede cambiar dónde se guarda (base de datos, servidor). |
| `NotificadorConsola` | Simula el email escribiendo `Email enviado a <email>` en la consola. | Puede cambiar cómo se avisa (email real, SMS). |
| `main.js` | Crea las implementaciones concretas y las conecta con el servicio. | Es el único lugar que conoce las clases concretas. |

### Lo que no hicimos, a propósito

- No creamos clases base abstractas, fábricas ni interfaces. El contrato de
  cada estrategia está escrito como comentario arriba de `descuentos.js` y
  `envios.js`.
- No separamos la suma de productos: es un `for` de tres líneas sin un motivo
  propio para cambiar.
- No tocamos `Producto` ni `Pedido` (problema 5).
- No corregimos los límites conocidos (ver
  [Cambios de comportamiento acordados](#cambios-de-comportamiento-acordados)).

## Principios utilizados y decisiones que los justifican

- **SRP (responsabilidad única).** `registrar` tenía cinco motivos para cambiar.
  Ahora guardar y notificar tienen su propia clase, y descuentos y envíos son
  estrategias. `PedidoService` solo cambia si cambia la forma de armar un pedido.
- **OCP (abierto/cerrado).** El servicio llama a `descuento.aplicar(...)` y a
  `envio.costo()` sin preguntar de qué tipo son. La prueba es la Etapa 4:
  Mayorista y Retiro en Local se agregaron con clases nuevas, sin modificar
  `PedidoService` ni las estrategias existentes. Usamos polimorfismo solo acá,
  porque es donde hay comportamiento que varía.
- **LSP (sustitución de Liskov).** Todo envío cumple el mismo contrato: `costo()`
  devuelve un número mayor o igual a 0 y no lanza errores. Por eso
  `EnvioRetiroLocal` reemplaza a `EnvioNormal` sin que el servicio lo note.
  Un envío que siempre lanza un error **no** equivale a uno válido: tiene el
  mismo método, pero rompe lo que promete el contrato y `registrar` nunca
  puede terminar. Un costo de $0, en cambio, es un costo correcto.
- **ISP (segregación de interfaces).** Cada dependencia tiene un contrato chico:
  el repositorio solo `guardar(pedidos)` y el notificador solo
  `notificar(pedido)`. No creamos un contrato que mezcle guardar, notificar,
  imprimir y generar PDF.
- **DIP (inversión de dependencias).** `PedidoService` recibe el repositorio y
  el notificador por el constructor, y el descuento y el envío como parámetros
  de `registrar`. `main.js` decide qué implementaciones usar. Los tests usan las
  implementaciones reales, sin dobles de prueba: Jest corre con jsdom, que trae
  `localStorage`.

## Comportamientos preservados y pruebas que lo demuestran

`npm test`: 3 suites y 21 tests pasando, sin ningún `test.todo`.

| Archivo | Tests | Qué cubre |
| --- | --- | --- |
| `tests/modelos.test.js` | 4 | Etapa 2: `Producto` y `Pedido`, incluido que dos pedidos sin productos no comparten el mismo arreglo. |
| `tests/pedidoService.test.js` | 11 | Etapa 2: el ejemplo, los 8 `test.todo` convertidos y 2 casos propios. |
| `tests/ampliaciones.test.js` | 6 | Etapa 4: Mayorista y Retiro en Local. |

Casos del servicio. Salvo que se indique otra cosa, el pedido es Cuaderno
$3000 + Lapicera $1000 = $4000:

| Caso | Cuenta | Total esperado |
| --- | --- | --- |
| Normal + envío normal | 4000 + 1000 | 5000 |
| Premium + normal | 4000 × 0.9 + 1000 | 4600 |
| VIP + normal | 4000 × 0.8 + 1000 | 4200 |
| Normal + express | 4000 + 2000 | 6000 |
| Premium + express (el descuento no se aplica al envío) | 4000 × 0.9 + 2000 | 5600 |
| VIP + express | 4000 × 0.8 + 2000 | 5200 |
| Premium + normal, un producto de $999.99 | 999.99 × 0.9 + 1000 | ≈ 1899.991 (`toBeCloseTo`) |
| Registro en memoria | — | 1 pedido, total 5000 |
| Dos pedidos con la misma instancia | 3000 + 1000 y 1000 × 0.8 + 2000 | 4000 y 2800 |
| Propio: un solo producto de $2500 | 2500 + 1000 | 3500 |
| Propio: el mismo Cuaderno dos veces | 3000 + 3000 + 1000 | 7000 |
| Mayorista + normal | 4000 × 0.75 + 1000 | 4000 |
| Normal + retiro en local | 4000 + 0 | 4000 |
| Mayorista + retiro en local | 4000 × 0.75 + 0 | **3000** |
| Mayorista + express | 4000 × 0.75 + 2000 | 5000 |
| `new DescuentoMayorista().aplicar(4000)` | 4000 × 0.75 | 3000 |
| `new EnvioRetiroLocal().costo()` | — | 0 |

El caso Premium + express protege el orden del cálculo: si el descuento
incluyera el envío, daría (4000 + 2000) × 0.9 = 5400.

Cómo se ve que el comportamiento se preservó:

- Los tests de la Etapa 2 se commitearon (`09bea98`) **antes** de refactorizar.
- En la Etapa 3 solo cambió la preparación: `new PedidoService()` pasó a ser
  `crearService()` y los textos `"premium"`, `"express"` pasaron a objetos
  (`new DescuentoPremium()`, `new EnvioExpress()`). Ningún `expect` cambió:
  `git diff 09bea98 33ee261 -- mini-proyecto-refactorizacion/tests/` no tiene
  líneas con `expect` modificadas.
- Los tests de la Etapa 4 se escribieron primero y fallaron (`b582103`)
  mientras los 15 anteriores seguían pasando. Están en un archivo aparte
  porque el proyecto usa módulos ES: si un archivo importa una clase que
  todavía no existe, Jest no puede cargarlo entero.
- Los tests no verifican la consola ni localStorage y no usan mocks. Los
  mensajes `Email enviado a ...` que aparecen al correrlos son el email
  simulado del servicio.

Pedidos registrados desde la interfaz con Cuaderno + Lapicera ($4000):

| Cliente | Envío | Total esperado | Total obtenido |
| --- | --- | --- | --- |
| Mayorista | Retiro en local | $3000 | $3000 |
| Normal | Normal | $5000 | $5000 |
| Premium | Express | $5600 | $5600 |
| VIP | Normal | $4200 | $4200 |

## Cambios de comportamiento acordados

- **Reglas nuevas (Etapa 4, habilitadas por el docente):** cliente Mayorista
  con 25% de descuento y Retiro en Local con costo $0. Los porcentajes y costos
  anteriores no cambiaron.
- **API del servicio:** el constructor ahora recibe `(repositorio, notificador)`
  y `registrar` pasó de `registrar(pedido, "premium", "express")` a
  `registrar(pedido, new DescuentoPremium(), new EnvioExpress())`. `main.js` y
  los tests se adaptaron sin borrar expectativas.
- **Tipos no reconocidos:** antes, un cliente desconocido no tenía descuento y
  un envío desconocido sumaba $0. Ahora el servicio recibe objetos, así que ese
  caso ya no existe en el servicio. Si `main.js` recibiera una clave que no está
  en los mapas, pasaría `undefined`: `registrar` lanzaría un error antes de
  tocar la memoria y la interfaz mostraría su mensaje de error. Desde la
  interfaz no se puede provocar, porque los `<select>` solo ofrecen opciones
  válidas, y ningún test lo cubre.
- **Límites que dejamos igual, a propósito:** el historial no se lee de
  localStorage al iniciar, el servicio no redondea y el registro no es atómico
  si localStorage falla. Corregirlos sería cambiar el comportamiento, no
  refactorizar.

## Cómo ejecutar la aplicación y los tests

Requiere Node.js 20.19+ o 22.12+.

```sh
cd mini-proyecto-refactorizacion
npm install            # instalar dependencias (una vez)
npm run dev            # levantar la app y abrir la dirección que muestra Vite
npm test               # correr los 21 tests
npm run test:coverage  # tests con reporte de cobertura
npm run build          # compilar la app en dist/
npm run preview        # ver la versión compilada
```

Para probar a mano: con `npm run dev`, agregar Cuaderno y Lapicera al pedido,
completar nombre y email, elegir **Mayorista** y **Retiro en local** y
confirmar. El total tiene que ser $3000, y en la consola del navegador (F12)
aparece `Email enviado a <email>`.

Última verificación (30/10/2026): `npm test` da 3 suites y 21 tests pasando, y
`npm run build` compila sin errores.
