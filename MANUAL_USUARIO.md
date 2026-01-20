# Manual de Usuario: Control de Mantenimiento CIA 12

Bienvenido al sistema de gestión de revisiones para Grupos Electrógenos y Remolques de la Sección de Sistemas. Esta aplicación permite registrar digitalmente las revisiones periódicas y descargar los datos consolidados en Excel.

## 1. Acceso a la Aplicación
Abra su navegador web y diríjase a la dirección web facilitada (ej: `https://controlgrupos.pythonanywhere.com`).
Al cargar, verá el **Menú Principal** con el título "CIA 12" y dos opciones:

![Menú Principal](public/logo.jpg)

## 2. Realizar una Revisión
Para comenzar a introducir datos, pulse el botón azul **"Iniciar Revisión"**.

### Paso 1: Seleccionar Vehículo
*   Aparecerá un menú desplegable titulado "Seleccionar Vehículo".
*   Pulse y elija el equipo que desea revisar de la lista (Grupos o Remolques).

### Paso 2: Rellenar Datos
Dependiendo del tipo de vehículo, verá distintos formularios.
*   **Fecha**: Se rellena automáticamente con la fecha de hoy (formato `dd/mm/aaaa`).
*   **Campos**: Rellene los datos observados (Horas, Aceite, Combustible, etc.).
    *   *Nota*: No es obligatorio rellenar todos los campos si alguno no aplica o no ha cambiado.

### Paso 3: Guardar
*   Pulse el botón azul **"Aceptar y Guardar"** al final del formulario.
*   Los datos se enviarán y el formulario se limpiará para el siguiente vehículo.
*   En la parte superior, el contador "Completados" aumentará (ej: 1/12).

## 3. Corregir Errores (Borrar última fila)
Si se ha equivocado al introducir los datos de un vehículo:
1.  Vuelva a seleccionar ese mismo vehículo en el desplegable.
2.  Pulse el botón rojo **"Borrar última fila"** situado encima del formulario.
3.  Confirme la acción en el mensaje que aparecerá.
4.  Esto eliminará el último registro introducido para ese vehículo en concreto, permitiéndole rellenarlo de nuevo.

## 4. Finalización de la Revisión
Cuando haya enviado los datos de **todos** los vehículos de la lista:
*   Aparecerá automáticamente un aviso indicando **"¡Revisión Completada!"**.
*   Pulse "Aceptar" para volver al menú principal.

## 5. Descargar el Informe (Excel)
Para obtener el archivo Excel actualizado con todas las revisiones añadidas:
1.  Vaya al **Menú Principal**.
2.  Pulse el botón verde **"Descargar Excel"**.
3.  El archivo `NOVEDADES SEMANALES...xlsx` se descargará automáticamente a su dispositivo.

---
**Soporte Técnico**:
Si la página no carga o no aparecen los datos actualizados, pruebe a recargar la página (F5 o deslizando hacia abajo en móvil).
