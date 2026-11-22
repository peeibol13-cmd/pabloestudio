# PabloEstudio – web y app

Contenido de la carpeta:

- `index.html`: la web completa (reservas incluidas).
- `manifest.webmanifest` y `sw.js`: hacen que se pueda instalar como app y abra sin conexión.
- `icons/`: iconos de la app.

## 1. Subirla a GitHub Pages (gratis)

1. Entra en github.com e inicia sesión (o crea una cuenta).
2. Pulsa **New repository**. Ponle un nombre, por ejemplo `pabloestudio`, déjalo en **Public** y pulsa **Create repository**.
3. Pulsa **uploading an existing file** y arrastra **todo el contenido de la carpeta** (`index.html`, `manifest.webmanifest`, `sw.js` y la carpeta `icons`). No subas el zip.
4. Pulsa **Commit changes**.
5. Ve a **Settings → Pages**. En **Source** elige **Deploy from a branch**, rama **main**, carpeta **/ (root)** y pulsa **Save**.
6. Espera 1 o 2 minutos. Tu web estará en `https://TU-USUARIO.github.io/pabloestudio/`.

## 2. Instalarla como app

- **Android (Chrome):** abre el enlace, menú de los tres puntos → **Instalar aplicación**.
- **iPhone (Safari):** abre el enlace, botón de compartir → **Añadir a pantalla de inicio**.
- **Ordenador (Chrome/Edge):** icono de instalar en la barra de direcciones.

Comparte el enlace con tus clientas o ponlo en tu Instagram.

## 3. Cambiar el horario y las citas ocupadas

Abre `index.html` en GitHub (icono del lápiz) y busca `HORARIO`. Verás esto:

    var A=[10,11,12,13,16,17,18,19],H={1:A,2:A,3:A,4:A,5:A,6:[10,11,12,13]},O=[];

- Cada número es la hora de inicio de una cita. `1` es lunes, `2` martes... `6` sábado. El domingo (`0`) no aparece, así que está cerrado.
- Para bloquear una hora ocupada, ponla dentro de `O`, por ejemplo: `O=["2026-11-24 10:00","2026-11-25 17:00"]`.

Después pulsa **Commit changes**. Para que el móvil recoja los cambios, en `sw.js` cambia `pbe-v1` por `pbe-v2` (y así en cada cambio).

## 4. Cambiar el número de WhatsApp

Busca `34622098402` en `index.html` y cámbialo (34 es el prefijo de España, seguido del móvil).

## 5. Reservas automáticas con aviso (Google Sheets + Apps Script, gratis)

Con esto, cuando una clienta reserva: la cita se apunta en una hoja de Google, **te llega un correo** (y, si quieres, un mensaje de Telegram) y **esa hora desaparece para las demás**.

1. Crea una **hoja de cálculo nueva** en Google Sheets (vacía).
2. Menú **Extensiones → Apps Script**. Borra lo que haya y pega todo el contenido de `apps-script/Codigo.gs`. Comprueba que el correo de arriba (`EMAIL`) es el tuyo.
3. Pulsa **Implementar → Nueva implementación → Tipo: Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.
   - Pulsa Implementar y **autoriza** los permisos (Google avisará de que la app no está verificada: pulsa Avanzado → Ir a proyecto).
4. Copia la **URL de la aplicación web** (acaba en `/exec`).
5. En `index.html` busca `var API="";` y pega la URL entre las comillas. Sube el cambio a GitHub (y sube el número de `sw.js`).

Cómo se maneja:
- Cada reserva sale como una fila en la pestaña **Citas**. Para **cancelar** una cita, cambia su **Estado** a `Cancelada` y la hora vuelve a quedar libre.
- Para **bloquear una hora** (por ejemplo, una cita que te han pedido por Instagram), añade una fila con el día (`2026-11-24`), la hora (`10:00`) y Estado `Bloqueada`.
- Si cambias algo del código de Apps Script, hay que hacer **Implementar → Administrar implementaciones → editar → Nueva versión**.

### Aviso instantáneo en Telegram (opcional)
1. En Telegram, habla con **@BotFather**, escribe `/newbot` y sigue los pasos. Te dará un **token**.
2. Abre tu bot nuevo y escríbele cualquier mensaje.
3. Habla con **@userinfobot** para ver tu **Id** (un número).
4. Pega el token y el Id en `TELEGRAM_TOKEN` y `TELEGRAM_CHAT_ID` del script, y haz una nueva versión de la implementación.

Ten en cuenta: la dirección de la reserva es pública, así que alguien podría llenar horas por fastidiar. Si pasa, las cancelas en la hoja.
