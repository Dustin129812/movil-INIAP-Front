import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const PREFIJO_HISTORIAL = '@historial_calculadora';

const obtenerClaveHistorial = (propietarioId) => {
  if (!propietarioId) {
    throw new Error('No se pudo identificar al propietario del historial');
  }

  return `${PREFIJO_HISTORIAL}:${propietarioId}`;
};

export const obtenerHistorialCalculos = async (propietarioId) => {
  try {
    const clave = obtenerClaveHistorial(propietarioId);
    const historialGuardado = await AsyncStorage.getItem(clave);

    if (!historialGuardado) {
      return [];
    }

    const historial = JSON.parse(historialGuardado);

    if (!Array.isArray(historial)) {
      return [];
    }

    return historial.sort(
      (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
    );
  } catch (error) {
    console.error(
      '[HistorialCalculadora] Error obteniendo historial:',
      error
    );

    return [];
  }
};

export const guardarCalculoHistorial = async ({
  propietarioId,
  calculoId = null,
  titulo,
  datosEntrada,
  resultado,
}) => {
  try {
    const tituloLimpio = String(
      titulo ?? "",
    ).trim();

    if (!propietarioId) {
      return {
        success: false,
        message:
          "No se pudo identificar al propietario.",
      };
    }

    if (!tituloLimpio) {
      return {
        success: false,
        message:
          "Ingrese un título para guardar el cálculo.",
      };
    }

    if (!resultado) {
      return {
        success: false,
        message:
          "Primero debe realizar el cálculo.",
      };
    }

    const clave =
      obtenerClaveHistorial(
        propietarioId,
      );

    const historialActual =
      await obtenerHistorialCalculos(
        propietarioId,
      );

    const fechaActual =
      new Date().toISOString();

    if (calculoId) {
      const indiceCalculo =
        historialActual.findIndex(
          (calculo) =>
            String(calculo.id) ===
            String(calculoId),
        );

      if (indiceCalculo === -1) {
        return {
          success: false,
          message:
            "No se encontró el cálculo que desea actualizar.",
        };
      }

      const calculoAnterior =
        historialActual[indiceCalculo];

      const calculoActualizado = {
        ...calculoAnterior,

        titulo: tituloLimpio,

        datosEntrada: {
          ...datosEntrada,
        },

        resultado: {
          ...resultado,
        },

        fechaActualizacion:
          fechaActual,

        sincronizado: false,
      };

      const historialActualizado =
        historialActual.map(
          (calculo) => {
            if (
              String(calculo.id) ===
              String(calculoId)
            ) {
              return calculoActualizado;
            }

            return calculo;
          },
        );

      await AsyncStorage.setItem(
        clave,
        JSON.stringify(
          historialActualizado,
        ),
      );

      return {
        success: true,
        actualizado: true,
        calculo: calculoActualizado,
      };
    }

    const nuevoCalculo = {
      id: Crypto.randomUUID(),
      titulo: tituloLimpio,
      propietarioId,

      datosEntrada: {
        ...datosEntrada,
      },

      resultado: {
        ...resultado,
      },

      fechaCreacion: fechaActual,
      fechaActualizacion:
        fechaActual,

      sincronizado: false,
    };

    const historialActualizado = [
      nuevoCalculo,
      ...historialActual,
    ];

    await AsyncStorage.setItem(
      clave,
      JSON.stringify(
        historialActualizado,
      ),
    );

    return {
      success: true,
      actualizado: false,
      calculo: nuevoCalculo,
    };
  } catch (error) {
    console.error(
      "[HistorialCalculadora] Error guardando cálculo:",
      error,
    );

    return {
      success: false,
      message:
        "No se pudo guardar el cálculo.",
    };
  }
};

export const obtenerCalculoPorId = async (
  propietarioId,
  calculoId
) => {
  try {
    const historial = await obtenerHistorialCalculos(propietarioId);

    return (
      historial.find(
        (calculo) => String(calculo.id) === String(calculoId)
      ) ?? null
    );
  } catch {
    return null;
  }
};

export const actualizarTituloCalculo = async ({
  propietarioId,
  calculoId,
  titulo,
}) => {
  try {
    const tituloLimpio = String(titulo ?? '').trim();

    if (!tituloLimpio) {
      return {
        success: false,
        message: 'El título no puede estar vacío.',
      };
    }

    const clave = obtenerClaveHistorial(propietarioId);
    const historial = await obtenerHistorialCalculos(propietarioId);

    const calculoExiste = historial.some(
      (calculo) => String(calculo.id) === String(calculoId)
    );

    if (!calculoExiste) {
      return {
        success: false,
        message: 'No se encontró el cálculo.',
      };
    }

    const historialActualizado = historial.map((calculo) => {
      if (String(calculo.id) !== String(calculoId)) {
        return calculo;
      }

      return {
        ...calculo,
        titulo: tituloLimpio,
        fechaActualizacion: new Date().toISOString(),
        sincronizado: false,
      };
    });

    await AsyncStorage.setItem(
      clave,
      JSON.stringify(historialActualizado)
    );

    return { success: true };
  } catch {
    return {
      success: false,
      message: 'No se pudo actualizar el título.',
    };
  }
};

export const eliminarCalculoHistorial = async (
  propietarioId,
  calculoId
) => {
  try {
    const clave = obtenerClaveHistorial(propietarioId);
    const historial = await obtenerHistorialCalculos(propietarioId);

    const historialActualizado = historial.filter(
      (calculo) => String(calculo.id) !== String(calculoId)
    );

    await AsyncStorage.setItem(
      clave,
      JSON.stringify(historialActualizado)
    );

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: 'No se pudo eliminar el cálculo.',
    };
  }
};

export const limpiarHistorialCalculos = async (propietarioId) => {
  try {
    const clave = obtenerClaveHistorial(propietarioId);
    await AsyncStorage.removeItem(clave);

    return { success: true };
  } catch {
    return {
      success: false,
      message: 'No se pudo limpiar el historial.',
    };
  }
};

export default {
  obtenerHistorialCalculos,
  guardarCalculoHistorial,
  obtenerCalculoPorId,
  actualizarTituloCalculo,
  eliminarCalculoHistorial,
  limpiarHistorialCalculos,
};