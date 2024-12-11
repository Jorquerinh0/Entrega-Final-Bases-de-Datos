import express from 'express';
import { neon } from '@neondatabase/serverless';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de la conexión a Neon
const neonConnectionString =
  'postgresql://neondb_owner:gthSdMJpZC08@ep-quiet-hill-a5kugwj9.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(neonConnectionString);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'indexpre.html'));
});

app.get('/historial', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'historial.html'));
});

app.get('/historial', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'modificaciones.html'));
});

const consultas = {
  empleados: 'SELECT * FROM empleados',
  reservas: 'SELECT * FROM reservas',
  habitaciones: 'SELECT * FROM habitaciones',
  facturas: 'SELECT * FROM facturas',
  servicios: 'SELECT * FROM servicios',
  proveedores: 'SELECT * FROM proveedores',
  mantenimiento: 'SELECT * FROM mantenimiento',
};

Object.entries(consultas).forEach(([nombre, query]) => {
  app.get(
    `/consulta${nombre.charAt(0).toUpperCase() + nombre.slice(1)}`,
    async (req, res) => {
      try {
        const result = await sql(query);
        res.json(result);
      } catch (error) {
        console.error(`Error al consultar ${nombre}:`, error);
        res.status(500).send(`Error al consultar ${nombre}.`);
      }
    }
  );
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Consultas para mostrar todos los huespedes
app.get('/consultaListarHuespedes', async (req, res) => {
  try {
    const result = await sql('SELECT * FROM huesped');
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al ejecutar la consulta.');
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ver habitaciones disponibles
app.get('/consultaHabitacionesDisponibles', async (req, res) => {
  try {
    const result = await sql(
      "SELECT * FROM habitaciones WHERE estado = 'Disponible'"
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al ejecutar la consulta.');
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ver reservas confirmadas
app.get('/consultaReservasConfirmadas', async (req, res) => {
  try {
    const result = await sql(
      "SELECT r.id_reserva, h.nombre, r.fecha_ingreso, r.fecha_salida, r.estado FROM reservas r JOIN huesped h ON r.id_huesped = h.id_huesped WHERE r.estado = 'CONFIRMADA'"
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al ejecutar la consulta.');
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Consulta historial de facturas por cliente especifico
app.get('/consultaHistorialFacturas', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('Por favor, proporcione un ID de cliente.');
  }

  try {
    const result = await sql(
      `SELECT h.nombre, f.id_factura, f.fecha, f.monto_total, f.estado_pago, f.id_huesped FROM facturas f JOIN huesped h ON f.id_huesped = h.id_huesped WHERE f.id_huesped = $1`,
      [id]
    );

    if (result.length === 0) {
      return res
        .status(404)
        .send('No se encontraron facturas para este cliente.');
    }

    res.json(result);
  } catch (error) {
    console.error('Error al ejecutar la consulta del historial:', error);
    res.status(500).send('Error al ejecutar la consulta del historial.');
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ver ingresos totales
app.get('/consultaIngresosTotales', async (req, res) => {
  try {
    const result = await sql(
      `SELECT SUM(monto_total) AS ingreso_total FROM Facturas WHERE estado_pago = TRUE;`
    );
    res.json(result[0]); // Enviar solo el objeto con el ingreso total
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    res.status(500).send('Error al ejecutar la consulta.');
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ver el detalle del mantenimiento de habitacion
app.get('/consultaDetalleMantenimiento', async (req, res) => {
  try {
    const result = await sql(
      `SELECT m.fecha_mantenimiento, m.descripcion, h.tipo, m.id_habitacion FROM mantenimiento m JOIN habitaciones h ON m.id_habitacion = h.id_habitacion;`
    );
    res.json(result);
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    res.status(500).send('Error al ejecutar la consulta.');
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ver lista de proovedores y productos
app.get('/consultaProveedorProducto', async (req, res) => {
  try {
    const result = await sql(`SELECT * FROM proveedores`);
    res.json(result);
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    res.status(500).send('Error al ejecutar la consulta.');
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ver servicios ofrecidos por el hotel
app.get('/consultaServicios', async (req, res) => {
  try {
    const result = await sql(`SELECT * FROM servicios;`);
    res.json(result);
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    res.status(500).send('Error al ejecutar la consulta.');
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ver lista de empleados y sus salarios
app.get('/consultaSalariosEmpleados', async (req, res) => {
  try {
    const result = await sql(`SELECT nombre, cargo, salario FROM empleados;`);
    res.json(result);
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    res.status(500).send('Error al ejecutar la consulta.');
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ver habitaciones en mantenimiento
app.get('/consultaHabitacionMantenimiento', async (req, res) => {
  try {
    const result = await sql(
      "SELECT * FROM habitaciones WHERE estado = 'Mantenimiento' "
    );
    res.json(result);
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    res.status(500).send('Error al ejecutar la consulta.');
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Consulta reserva en rango de fecha
app.get('/consultaReservasPorFechas', async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ error: 'Faltan parámetros de fecha' });
  }

  try {
    const query = `
      SELECT * FROM reservas 
      WHERE (fecha_ingreso BETWEEN $1 AND $2 OR fecha_salida BETWEEN $1 AND $2)
      OR (fecha_ingreso <= $1 AND fecha_salida >= $2)
    `;
    const reservas = await sql(query, [fechaInicio, fechaFin]);

    res.json(reservas);
  } catch (error) {
    console.error('Error al consultar las reservas:', error);
    res.status(500).json({ error: 'Error al consultar las reservas.' });
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Realizar reserva
app.post('/reservarInteractivo', async (req, res) => {
  const { nombre, email, telefono, direccion, fechaIngreso, fechaSalida } =
    req.body;

  if (
    !nombre ||
    !email ||
    !telefono ||
    !direccion ||
    !fechaIngreso ||
    !fechaSalida
  ) {
    return res.status(400).send('Faltan datos para completar la reserva.');
  }

  try {
    // Insertar al huésped si no existe
    const huespedQuery = `
      INSERT INTO huesped (nombre, email, telefono, direccion) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id_huesped
    `;
    const huespedValues = [nombre, email, telefono, direccion];
    const resHuesped = await sql(huespedQuery, huespedValues);
    const idHuesped = resHuesped[0].id_huesped;

    // Insertar la reserva con el estado pendiente
    const reservaQuery = `
      INSERT INTO reservas (fecha_ingreso, fecha_salida, estado, id_huesped) 
      VALUES ($1, $2, 'pendiente', $3)
      RETURNING id_reserva
    `;
    const reservaValues = [fechaIngreso, fechaSalida, idHuesped];
    const resReserva = await sql(reservaQuery, reservaValues);

    const idReserva = resReserva[0].id_reserva;

    // Responder con el id de la reserva realizada
    res.json({ mensaje: 'Reserva realizada con éxito', id_reserva: idReserva });
  } catch (error) {
    console.error('Error al realizar la reserva:', error);
    res.status(500).send('Hubo un error al procesar la reserva.');
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Cambio de estado de la habitación
app.post('/cambiarEstadoHabitacion', async (req, res) => {
  const { idHabitacion, nuevoEstado } = req.body;

  if (!idHabitacion || !nuevoEstado) {
    return res
      .status(400)
      .json({ error: 'Faltan datos para cambiar el estado de la habitación.' });
  }

  const estadosValidos = ['Ocupada', 'Disponible', 'Mantenimiento'];
  if (!estadosValidos.includes(nuevoEstado)) {
    return res.status(400).json({
      error:
        'Estado no válido. Debe ser "Ocupada", "Disponible" o "Mantenimiento".',
    });
  }

  try {
    const queryVerificarExistencia =
      'SELECT id_habitacion FROM habitaciones WHERE id_habitacion = $1';
    const resultadoExistencia = await sql(queryVerificarExistencia, [
      idHabitacion,
    ]);

    if (resultadoExistencia.rowCount === 0) {
      return res
        .status(404)
        .json({ error: 'La habitación con ese ID no existe.' });
    }

    const queryActualizarEstado =
      'UPDATE habitaciones SET estado = $1 WHERE id_habitacion = $2';
    const resultadoActualizacion = await sql(queryActualizarEstado, [
      nuevoEstado,
      idHabitacion,
    ]);

    if (resultadoActualizacion.rowCount === 0) {
      return res
        .status(500)
        .json({ error: 'No se pudo actualizar el estado de la habitación.' });
    }

    res.json({
      message: `El estado de la habitación ${idHabitacion} ha sido actualizado a ${nuevoEstado}.`,
    });
  } catch (error) {
    console.error('Error al cambiar el estado de la habitación:', error);
    res
      .status(500)
      .json({ error: 'Error interno del servidor al cambiar el estado.' });
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ruta para actualizar el sueldo de un empleado
app.put('/editarSueldoEmpleado/:id', async (req, res) => {
  const idEmpleado = req.params.id;
  const { nuevoSueldo } = req.body;

  if (isNaN(nuevoSueldo) || nuevoSueldo <= 0) {
    return res.status(400).json({
      error: 'El sueldo debe ser un número positivo válido.',
    });
  }

  try {
    const empleadoExistente = await sql(
      'SELECT * FROM empleados WHERE id_empleado = $1',
      [idEmpleado]
    );

    if (empleadoExistente.rowCount === 0) {
      return res
        .status(404)
        .json({ error: `No se encontró un empleado con ID ${idEmpleado}.` });
    }

    const actualizarSueldo = await sql(
      'UPDATE empleados SET salario = $1 WHERE id_empleado = $2',
      [nuevoSueldo, idEmpleado]
    );

    if (actualizarSueldo.rowCount > 0) {
      return res.status(200).json({
        message: `El sueldo del empleado con ID ${idEmpleado} ha sido actualizado a ${nuevoSueldo}.`,
      });
    } else {
      return res
        .status(500)
        .json({ error: 'No se pudo actualizar el sueldo.' });
    }
  } catch (error) {
    console.error('Error al editar el sueldo del empleado:', error);
    res.status(500).json({
      error: 'Ocurrió un error al intentar editar el sueldo del empleado.',
    });
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ruta para eliminar un empleado por su ID
app.delete('/eliminarEmpleado/:id', async (req, res) => {
  const idEmpleado = req.params.id;

  try {
    if (isNaN(idEmpleado)) {
      return res
        .status(400)
        .json({ error: 'El ID del empleado debe ser un número.' });
    }

    const empleadoExistente = await sql(
      'SELECT * FROM Empleados WHERE id_empleado = $1',
      [idEmpleado]
    );

    if (empleadoExistente.rowCount === 0) {
      return res
        .status(404)
        .json({ error: `No se encontró un empleado con ID ${idEmpleado}.` });
    }

    const eliminarEmpleado = await sql(
      'DELETE FROM Empleados WHERE id_empleado = $1',
      [idEmpleado]
    );

    if (eliminarEmpleado.rowCount > 0) {
      return res.status(200).json({
        message: `El empleado con ID ${idEmpleado} ha sido eliminado.`,
      });
    } else {
      return res.status(500).json({ error: '' });
    }
  } catch (error) {
    console.error('Error al eliminar el empleado:', error);
    res
      .status(500)
      .json({ error: 'Ocurrió un error al intentar eliminar el empleado.' });
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ruta para eliminar un proveedor por su ID
app.delete('/eliminarProveedor/:id', async (req, res) => {
  const idProveedor = req.params.id;

  try {
    if (isNaN(idProveedor)) {
      return res
        .status(400)
        .json({ error: 'El ID del proveedor debe ser un número.' });
    }

    const proveedorExistente = await sql(
      'SELECT * FROM proveedores WHERE id_proveedor = $1',
      [idProveedor]
    );

    if (proveedorExistente.rowCount === 0) {
      return res
        .status(404)
        .json({ error: `No se encontró un proveedor con ID ${idProveedor}.` });
    }

    const eliminarProveedor = await sql(
      'DELETE FROM proveedores WHERE id_proveedor = $1',
      [idProveedor]
    );

    if (eliminarProveedor.rowCount > 0) {
      return res.status(200).json({
        message: `El proveedor con ID ${idProveedor} ha sido eliminado.`,
      });
    } else {
      return res.status(500).json({ error: '' });
    }
  } catch (error) {
    console.error('Error al eliminar el proveedor:', error);
    res
      .status(500)
      .json({ error: 'Ocurrió un error al intentar eliminar el proveedor.' });
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ruta para eliminar un servicio por su ID
app.delete('/eliminarServicio/:id', async (req, res) => {
  const idServicio = req.params.id;

  try {
    if (isNaN(idServicio)) {
      return res
        .status(400)
        .json({ error: 'El ID del servicio debe ser un número.' });
    }

    const servicioExistente = await sql(
      'SELECT * FROM servicios WHERE id_servicio = $1',
      [idServicio]
    );

    if (servicioExistente.rowCount === 0) {
      return res
        .status(404)
        .json({ error: `No se encontró un servicio con ID ${idServicio}.` });
    }

    const eliminarServicio = await sql(
      'DELETE FROM servicios WHERE id_servicio = $1',
      [idServicio]
    );

    if (eliminarServicio.rowCount > 0) {
      return res.status(200).json({
        message: `El servicio con ID ${idServicio} ha sido eliminado.`,
      });
    } else {
      return res.status(500).json({ error: '' });
    }
  } catch (error) {
    console.error('Error al eliminar el servicio:', error);
    res
      .status(500)
      .json({ error: 'Ocurrió un error al intentar eliminar el servicio.' });
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ruta para cambiar el estado de una factura
app.put('/cambiarEstadoFactura/:id', async (req, res) => {
  const idFactura = req.params.id;
  const { estado } = req.body;

  try {
    if (isNaN(idFactura)) {
      return res
        .status(400)
        .json({ error: 'El ID de la factura debe ser un número.' });
    }

    if (typeof estado !== 'boolean') {
      return res.status(400).json({
        error: 'El estado debe ser un valor booleano (true o false).',
      });
    }

    const facturaExistente = await sql(
      'SELECT * FROM facturas WHERE id_factura = $1',
      [idFactura]
    );

    if (facturaExistente.rowCount === 0) {
      return res
        .status(404)
        .json({ error: `No se encontró una factura con ID ${idFactura}.` });
    }

    const actualizarEstado = await sql(
      'UPDATE facturas SET estado_pago = $1 WHERE id_factura = $2',
      [estado, idFactura]
    );

    if (actualizarEstado.rowCount > 0) {
      return res.status(200).json({
        message: `El estado de la factura con ID ${idFactura} ha sido actualizado a ${estado}.`,
      });
    } else {
      return res.status(500).json({ error: '' });
    }
  } catch (error) {
    console.error('Error al cambiar el estado de la factura:', error);
    res.status(500).json({
      error: 'Ocurrió un error al intentar cambiar el estado de la factura.',
    });
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ruta para cambiar el estado de una reserva
app.put('/cambiarEstadoReserva/:id', async (req, res) => {
  const idReserva = req.params.id;
  const { estado } = req.body;

  try {
    if (isNaN(idReserva)) {
      return res
        .status(400)
        .json({ error: 'El ID de la reserva debe ser un número.' });
    }

    const estadosValidos = ['Cancelado', 'En curso', 'Confirmada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error:
          'El estado debe ser uno de los siguientes: Cancelado, En curso, Confirmada.',
      });
    }

    const reservaExistente = await sql(
      'SELECT * FROM reservas WHERE id_reserva = $1',
      [idReserva]
    );

    if (reservaExistente.rowCount === 0) {
      return res
        .status(404)
        .json({ error: `No se encontró una reserva con ID ${idReserva}.` });
    }

    const actualizarEstado = await sql(
      'UPDATE reservas SET estado = $1 WHERE id_reserva = $2',
      [estado, idReserva]
    );

    if (actualizarEstado.rowCount > 0) {
      return res.status(200).json({
        message: `El estado de la reserva con ID ${idReserva} ha sido actualizado a ${estado}.`,
      });
    } else {
      return res.status(500).json({ error: '' });
    }
  } catch (error) {
    console.error('Error al cambiar el estado de la reserva:', error);
    res.status(500).json({
      error: 'Ocurrió un error al intentar cambiar el estado de la reserva.',
    });
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ruta para editar los datos de un huésped
app.put('/editarHuesped/:id', async (req, res) => {
  const idHuesped = req.params.id;
  const { nombre, email, direccion, telefono } = req.body;

  try {
    if (isNaN(idHuesped)) {
      return res
        .status(400)
        .json({ error: 'El ID del huésped debe ser un número.' });
    }

    const huespedExistente = await sql(
      'SELECT * FROM huesped WHERE id_huesped = $1',
      [idHuesped]
    );

    if (huespedExistente.rowCount === 0) {
      return res
        .status(404)
        .json({ error: `No se encontró un huésped con ID ${idHuesped}.` });
    }

    const actualizarHuesped = await sql(
      'UPDATE huesped SET nombre = $1, email = $2, direccion = $3, telefono = $4 WHERE id_huesped = $5',
      [nombre, email, direccion, telefono, idHuesped]
    );

    if (actualizarHuesped.rowCount > 0) {
      return res.status(200).json({
        message: `Los datos del huésped con ID ${idHuesped} han sido actualizados.`,
      });
    } else {
      return res.status(500).json({ error: '' });
    }
  } catch (error) {
    console.error('Error al editar los datos del huésped:', error);
    res.status(500).json({
      error: 'Ocurrió un error al intentar editar los datos del huésped.',
    });
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Ruta para actualizar el cargo de un empleado
app.put('/editarCargoEmpleado/:id', async (req, res) => {
  const idEmpleado = req.params.id;
  const { cargo } = req.body;

  const cargosValidos = [
    'Recepcionista',
    'Gerente General',
    'Limpiador',
    'Conserje',
    'Chef Ejecutivo',
  ];

  if (!cargosValidos.includes(cargo)) {
    return res.status(400).json({
      error:
        'Cargo inválido. Los cargos válidos son: Recepcionista, Gerente General, Limpiador, Conserje y Chef Ejecutivo.',
    });
  }

  try {
    const empleadoExistente = await sql(
      'SELECT * FROM empleados WHERE id_empleado = $1',
      [idEmpleado]
    );

    if (empleadoExistente.rowCount === 0) {
      return res
        .status(404)
        .json({ error: `No se encontró un empleado con ID ${idEmpleado}.` });
    }

    // Actualizar el cargo del empleado
    const actualizarCargo = await sql(
      'UPDATE empleados SET cargo = $1 WHERE id_empleado = $2',
      [cargo, idEmpleado]
    );

    if (actualizarCargo.rowCount > 0) {
      return res.status(200).json({
        message: `El cargo del empleado con ID ${idEmpleado} ha sido actualizado a ${cargo}.`,
      });
    } else {
      return res.status(500).json({ error: '' });
    }
  } catch (error) {
    console.error('Error al editar el cargo del empleado:', error);
    res.status(500).json({
      error: 'Ocurrió un error al intentar editar el cargo del empleado.',
    });
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
