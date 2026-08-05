import { useCallback, useMemo, useState } from "react";

import { FERTILIZANTES, PESO_SACO_KG } from "../fertilizantes";
import { NUTRIENTES } from "../nutrientes";

const EPSILON = 0.000001;

const crearValoresPorFertilizante = (valoresIniciales = {}) =>
  FERTILIZANTES.reduce((acc, fertilizante) => {
    acc[fertilizante.nombre] = valoresIniciales[fertilizante.nombre] ?? "";
    return acc;
  }, {});

const crearValoresPorNutriente = (valoresIniciales = {}) =>
  NUTRIENTES.reduce((acc, nutriente) => {
    acc[nutriente.key] = valoresIniciales[nutriente.key] ?? "";
    return acc;
  }, {});

const SACOS_EJEMPLO_EXCEL = {
  "10-30-10": "4",
  UREA: "1.75",
  POTASA: "1",
};

const NIVEL_RECOMENDADO_EJEMPLO = {
  N: "60",
  P: "60",
  K: "50",
  S: "20",
  Mg: "20",
  Ca: "0",
};

export const VALORES_EJEMPLO_EXCEL = {
  largoMetros: "60",
  anchoMetros: "55",
  distanciaEntreSurcos: "1.2",
  distanciaEntrePlantas: "0.5",
  sacosPorHectarea: crearValoresPorFertilizante(SACOS_EJEMPLO_EXCEL),
  nivelRecomendado: crearValoresPorNutriente(NIVEL_RECOMENDADO_EJEMPLO),
};

export function convertirTextoANumero(valor) {
  const textoOriginal = String(valor ?? "").trim();
  const textoNormalizado = textoOriginal.replace(",", ".");

  if (!textoNormalizado) {
    return { valido: true, vacio: true, numero: 0 };
  }

  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(textoNormalizado)) {
    return { valido: false, vacio: false, numero: null };
  }

  const numero = Number(textoNormalizado);

  if (!Number.isFinite(numero)) {
    return { valido: false, vacio: false, numero: null };
  }

  return { valido: true, vacio: false, numero };
}

export const calcularAreaParcela = (largoMetros, anchoMetros) =>
  largoMetros * anchoMetros;

export const calcularAreaHectareas = (areaM2) => areaM2 / 10000;

export const calcularKgPorHectarea = (sacosPorHectarea) =>
  sacosPorHectarea * PESO_SACO_KG;

export const calcularIngredienteActivo = (kgPorHectarea, porcentajeNutriente) =>
  kgPorHectarea * (porcentajeNutriente / 100);

export const calcularCostoPorHectarea = (sacosPorHectarea, precioSaco) =>
  sacosPorHectarea * precioSaco;

export const calcularSacosParcela = (sacosPorHectarea, areaM2) =>
  (sacosPorHectarea * areaM2) / 10000;

export const calcularKgParcela = (kgPorHectarea, areaM2) =>
  (kgPorHectarea * areaM2) / 10000;

export const calcularCostoParcela = (costoPorHectarea, areaM2) =>
  (costoPorHectarea * areaM2) / 10000;

export const calcularNumeroSurcos = (anchoMetros, distanciaEntreSurcos) =>
  anchoMetros / distanciaEntreSurcos;

export const calcularSitiosPorSurco = (largoMetros, distanciaEntrePlantas) =>
  largoMetros / distanciaEntrePlantas;

export const calcularKgMezclaPorSurco = (totalKgParcela, numeroSurcos) =>
  numeroSurcos > 0 ? totalKgParcela / numeroSurcos : 0;

const crearNutrientesEnCero = () =>
  NUTRIENTES.reduce((acc, nutriente) => {
    acc[nutriente.key] = 0;
    return acc;
  }, {});

const obtenerEstadoPorDiferencia = (diferencia) => {
  if (Math.abs(diferencia) <= EPSILON) return "Completo";
  return diferencia > 0 ? "Faltante" : "Exceso";
};

function leerNumeroCampo(valor, nombreCampo, opciones = {}) {
  const { requerido = false, mayorQueCero = false } = opciones;
  const numeroLeido = convertirTextoANumero(valor);

  if (!numeroLeido.valido) {
    return {
      ok: false,
      mensaje: `${nombreCampo} solo acepta números positivos.`,
    };
  }

  if (requerido && numeroLeido.vacio) {
    return {
      ok: false,
      mensaje: `Ingrese ${nombreCampo.toLowerCase()}.`,
    };
  }

  if (mayorQueCero && numeroLeido.numero <= 0) {
    return {
      ok: false,
      mensaje: `${nombreCampo} debe ser mayor que cero.`,
    };
  }

  return { ok: true, numero: numeroLeido.numero };
}

export function useCalculadora() {
  const [largoMetros, setLargoMetros] = useState(
    VALORES_EJEMPLO_EXCEL.largoMetros,
  );
  const [anchoMetros, setAnchoMetros] = useState(
    VALORES_EJEMPLO_EXCEL.anchoMetros,
  );
  const [distanciaEntreSurcos, setDistanciaEntreSurcos] = useState(
    VALORES_EJEMPLO_EXCEL.distanciaEntreSurcos,
  );
  const [distanciaEntrePlantas, setDistanciaEntrePlantas] = useState(
    VALORES_EJEMPLO_EXCEL.distanciaEntrePlantas,
  );
  const [sacosPorHectarea, setSacosPorHectarea] = useState(
    VALORES_EJEMPLO_EXCEL.sacosPorHectarea,
  );
  const [nivelRecomendado, setNivelRecomendado] = useState(
    VALORES_EJEMPLO_EXCEL.nivelRecomendado,
  );
  const [resultadoCalculo, setResultadoCalculo] = useState(null);
  const [mensajeError, setMensajeError] = useState("");

  const cambiarSacosPorHectarea = useCallback((nombreFertilizante, valor) => {
    setSacosPorHectarea((prev) => ({
      ...prev,
      [nombreFertilizante]: valor,
    }));
  }, []);

  const cambiarNivelRecomendado = useCallback((nutrienteKey, valor) => {
    setNivelRecomendado((prev) => ({
      ...prev,
      [nutrienteKey]: valor,
    }));
  }, []);

  const areaPreview = useMemo(() => {
    const largo = convertirTextoANumero(largoMetros);
    const ancho = convertirTextoANumero(anchoMetros);

    if (!largo.valido || !ancho.valido || largo.vacio || ancho.vacio) {
      return { areaM2: 0, areaHa: 0 };
    }

    const areaM2 = calcularAreaParcela(largo.numero, ancho.numero);
    return { areaM2, areaHa: calcularAreaHectareas(areaM2) };
  }, [largoMetros, anchoMetros]);

  const hayDatosEscritos = useMemo(() => {
    const hayDimensiones = [
      largoMetros,
      anchoMetros,
      distanciaEntreSurcos,
      distanciaEntrePlantas,
    ].some((valor) => String(valor).trim() !== "");
    const haySacos = Object.values(sacosPorHectarea).some(
      (valor) => String(valor).trim() !== "",
    );
    const hayRecomendados = Object.values(nivelRecomendado).some(
      (valor) => String(valor).trim() !== "",
    );

    return hayDimensiones || haySacos || hayRecomendados || !!resultadoCalculo;
  }, [
    largoMetros,
    anchoMetros,
    distanciaEntreSurcos,
    distanciaEntrePlantas,
    sacosPorHectarea,
    nivelRecomendado,
    resultadoCalculo,
  ]);

  const validarCalculo = useCallback(() => {
    const largo = leerNumeroCampo(largoMetros, "Largo de la parcela", {
      requerido: true,
      mayorQueCero: true,
    });
    if (!largo.ok) return largo;

    const ancho = leerNumeroCampo(anchoMetros, "Ancho de la parcela", {
      requerido: true,
      mayorQueCero: true,
    });
    if (!ancho.ok) return ancho;

    const distanciaSurcos = leerNumeroCampo(
      distanciaEntreSurcos,
      "La distancia entre surcos",
      { requerido: true, mayorQueCero: true },
    );
    if (!distanciaSurcos.ok) return distanciaSurcos;

    const distanciaPlantas = leerNumeroCampo(
      distanciaEntrePlantas,
      "La distancia entre plantas",
      { requerido: true, mayorQueCero: true },
    );
    if (!distanciaPlantas.ok) return distanciaPlantas;

    const sacosNumericos = {};
    let existeFertilizante = false;

    for (const fertilizante of FERTILIZANTES) {
      const valor = leerNumeroCampo(
        sacosPorHectarea[fertilizante.nombre],
        `Sacos de ${fertilizante.nombre}`,
      );
      if (!valor.ok) return valor;

      sacosNumericos[fertilizante.nombre] = valor.numero;
      if (valor.numero > 0) existeFertilizante = true;
    }

    if (!existeFertilizante) {
      return { ok: false, mensaje: "Ingrese al menos un fertilizante." };
    }

    const recomendadoNumerico = {};

    for (const nutriente of NUTRIENTES) {
      const valor = leerNumeroCampo(
        nivelRecomendado[nutriente.key],
        `Nivel recomendado de ${nutriente.nombre}`,
      );
      if (!valor.ok) return valor;

      recomendadoNumerico[nutriente.key] = valor.numero;
    }

    return {
      ok: true,
      datos: {
        largoMetros: largo.numero,
        anchoMetros: ancho.numero,
        distanciaEntreSurcos: distanciaSurcos.numero,
        distanciaEntrePlantas: distanciaPlantas.numero,
        sacosPorHectarea: sacosNumericos,
        nivelRecomendado: recomendadoNumerico,
      },
    };
  }, [
    largoMetros,
    anchoMetros,
    distanciaEntreSurcos,
    distanciaEntrePlantas,
    sacosPorHectarea,
    nivelRecomendado,
  ]);

  const calcular = useCallback(() => {
    const validacion = validarCalculo();

    if (!validacion.ok) {
      setMensajeError(validacion.mensaje);
      setResultadoCalculo(null);
      return { ok: false, mensaje: validacion.mensaje };
    }

    const datos = validacion.datos;
    const areaM2 = calcularAreaParcela(datos.largoMetros, datos.anchoMetros);
    const areaHa = calcularAreaHectareas(areaM2);
    const numeroSurcos = calcularNumeroSurcos(
      datos.anchoMetros,
      datos.distanciaEntreSurcos,
    );
    const sitiosPorSurco = calcularSitiosPorSurco(
      datos.largoMetros,
      datos.distanciaEntrePlantas,
    );

    const nivelObtenido = crearNutrientesEnCero();
    let totalSacosPorHectarea = 0;
    let totalKgPorHectarea = 0;
    let totalCostoPorHectarea = 0;
    let totalSacosParcela = 0;
    let totalKgParcela = 0;
    let totalCostoParcela = 0;

    const detallePorFertilizante = FERTILIZANTES.map((fertilizante) => {
      const sacos = datos.sacosPorHectarea[fertilizante.nombre];
      const kgPorHectarea = calcularKgPorHectarea(sacos);
      const costoPorHectarea = calcularCostoPorHectarea(
        sacos,
        fertilizante.precioSaco,
      );
      const sacosParcela = calcularSacosParcela(sacos, areaM2);
      const kgParcela = calcularKgParcela(kgPorHectarea, areaM2);
      const costoParcela = calcularCostoParcela(costoPorHectarea, areaM2);
      const aportes = crearNutrientesEnCero();

      NUTRIENTES.forEach((nutriente) => {
        // Excel: porcentaje * sacos * 0.5. Equivale a kg/ha * porcentaje / 100.
        const aporte = calcularIngredienteActivo(
          kgPorHectarea,
          fertilizante.composicion[nutriente.key],
        );
        aportes[nutriente.key] = aporte;
        nivelObtenido[nutriente.key] += aporte;
      });

      totalSacosPorHectarea += sacos;
      totalKgPorHectarea += kgPorHectarea;
      totalCostoPorHectarea += costoPorHectarea;
      totalSacosParcela += sacosParcela;
      totalKgParcela += kgParcela;
      totalCostoParcela += costoParcela;

      return {
        id: fertilizante.id,
        nombre: fertilizante.nombre,
        composicion: fertilizante.composicion,
        sacosPorHectarea: sacos,
        kgPorHectarea,
        precioSaco: fertilizante.precioSaco,
        costoPorHectarea,
        sacosParcela,
        kgParcela,
        costoParcela,
        aportes,
      };
    }).filter((detalle) => detalle.sacosPorHectarea > 0);

    const diferenciaNutrientes = NUTRIENTES.reduce((acc, nutriente) => {
      const recomendado = datos.nivelRecomendado[nutriente.key];
      const obtenido = nivelObtenido[nutriente.key];
      const diferencia = recomendado - obtenido;

      acc[nutriente.key] = {
        recomendado,
        obtenido,
        diferencia,
        estado: obtenerEstadoPorDiferencia(diferencia),
      };
      return acc;
    }, {});

    const resultado = {
      areaM2,
      areaHa,
      numeroSurcos,
      sitiosPorSurco,
      kgMezclaPorSurco: calcularKgMezclaPorSurco(
        totalKgParcela,
        numeroSurcos,
      ),
      nivelRecomendado: datos.nivelRecomendado,
      nivelObtenido,
      diferenciaNutrientes,
      detallePorFertilizante,
      totalSacosPorHectarea,
      totalKgPorHectarea,
      totalCostoPorHectarea,
      totalSacosParcela,
      totalKgParcela,
      totalCostoParcela,
    };

    setMensajeError("");
    setResultadoCalculo(resultado);
    return { ok: true, resultado };
  }, [validarCalculo]);

  const limpiarFormulario = useCallback(() => {
    setLargoMetros("");
    setAnchoMetros("");
    setDistanciaEntreSurcos("");
    setDistanciaEntrePlantas("");
    setSacosPorHectarea(crearValoresPorFertilizante());
    setNivelRecomendado(crearValoresPorNutriente());
    setResultadoCalculo(null);
    setMensajeError("");
  }, []);

  const limpiarCantidades = useCallback(() => {
    setSacosPorHectarea(crearValoresPorFertilizante());
    setResultadoCalculo(null);
    setMensajeError("");
  }, []);

  const restaurarEjemploExcel = useCallback(() => {
    setLargoMetros(VALORES_EJEMPLO_EXCEL.largoMetros);
    setAnchoMetros(VALORES_EJEMPLO_EXCEL.anchoMetros);
    setDistanciaEntreSurcos(VALORES_EJEMPLO_EXCEL.distanciaEntreSurcos);
    setDistanciaEntrePlantas(VALORES_EJEMPLO_EXCEL.distanciaEntrePlantas);
    setSacosPorHectarea(VALORES_EJEMPLO_EXCEL.sacosPorHectarea);
    setNivelRecomendado(VALORES_EJEMPLO_EXCEL.nivelRecomendado);
    setResultadoCalculo(null);
    setMensajeError("");
  }, []);

  return {
    largoMetros,
    setLargoMetros,
    anchoMetros,
    setAnchoMetros,
    distanciaEntreSurcos,
    setDistanciaEntreSurcos,
    distanciaEntrePlantas,
    setDistanciaEntrePlantas,
    sacosPorHectarea,
    cambiarSacosPorHectarea,
    nivelRecomendado,
    cambiarNivelRecomendado,
    areaPreview,
    resultadoCalculo,
    mensajeError,
    hayDatosEscritos,
    calcular,
    limpiarFormulario,
    limpiarCantidades,
    restaurarEjemploExcel,
  };
}
