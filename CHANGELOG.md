# Registro de Cambios y Nuevas Funcionalidades

## Versión Actual - [Fecha Actual]

### Nuevas Funcionalidades

#### Gestión de Plataformas y Credenciales
- **URLs de Casino**: Se ha añadido un campo para configurar la URL de cada plataforma en el panel de administración.
- **Acceso Directo**: Los jugadores ahora ven un botón "Ir al Casino" junto a sus credenciales que abre la plataforma en una nueva pestaña.
- **Gestión de Usuarios**: Los administradores pueden asignar credenciales de plataforma (Usuario/Contraseña) directamente desde el panel de gestión de jugadores.

#### Sistema de Pagos y Transacciones
- **Múltiples Métodos de Depósito**:
  1. **Manual**: Transferencia tradicional con comprobante.
  2. **Automática**: Sistema inteligente con montos decimales únicos (ej. $10.000,04) para identificación automática.
  3. **MercadoPago**: Integración nativa (si está configurada).
- **Verificación Automática**: El sistema ahora verifica automáticamente el estado de los depósitos automáticos cada 3 segundos sin necesidad de recargar la página.
- **Configuración MP**: Nueva sección en el panel de administración (Pestaña Configuración) para ingresar las credenciales de MercadoPago (Access Token y Public Key) del sistema global.
- **Logging**: Se ha implementado un registro interno de transacciones para auditoría.

#### Chat de Soporte
- **Diseño Desplegable**: El chat ahora es un widget flotante en la esquina inferior derecha que se puede expandir o colapsar.
- **Interfaz Mejorada**: Rediseño visual con colores oscuros y coherentes con la plataforma (negro/dorado), eliminando el fondo blanco y textos duplicados.
- **Botón Flotante**: Icono animado para abrir el chat fácilmente.

#### Seguridad y Gestión de Cuentas
- **Eliminación de Usuarios**: Los administradores ahora pueden eliminar usuarios desde el listado de jugadores (con confirmación de seguridad).
- **Cambio de Contraseña**:
  - Los jugadores pueden cambiar su propia contraseña de acceso desde el panel.
  - Los administradores pueden restablecer contraseñas si es necesario.
- **Validación de Datos**: Se han reforzado las validaciones en todos los formularios (creación de usuarios, CVUs, depósitos).

#### Mejoras Generales
- **WhatsApp**: Campo de WhatsApp añadido al registro de usuarios.
- **Titular de Cuenta**: Campo "Nombre del Titular" añadido al registro de CVUs bancarios.
- **Correcciones de Errores**: Solucionados problemas de tipos (TypeScript), duplicación de textos y errores de carga en componentes.

### Instrucciones de Configuración Rápida

1. **MercadoPago**:
   - Ir al Panel Admin > Configuración.
   - Ingresar el `Access Token` y `Public Key` de su cuenta de MercadoPago.
   - Guardar cambios.

2. **Plataformas**:
   - Ir al Panel Admin > Plataformas.
   - Crear o Editar una plataforma agregando su URL oficial.

3. **CVUs**:
   - Al crear un CVU, asegúrese de incluir el nombre del titular para mayor claridad del usuario.
