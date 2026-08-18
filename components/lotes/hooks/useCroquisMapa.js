import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';
import { lotesService } from '../../../services/lotes';
import { crearLoteLocal, crearProyectoLocal } from '../../../db';

export const useCroquisMapa = (editLoteId = null, onLoteSaved = null) => {
    const mapRef = useRef(null);

    const [location, setLocation] = useState(null);
    const [points, setPoints] = useState([]);
    const [gpsAccuracy, setGpsAccuracy] = useState('Buscando...');
    const [isTracking, setIsTracking] = useState(false);
    const isTrackingRef = useRef(false);
    const [locationSubscription, setLocationSubscription] = useState(null);
    const [crosshairLocation, setCrosshairLocation] = useState(null);
    const [mapType, setMapType] = useState('hybrid');
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editLoteData, setEditLoteData] = useState(null);

    const [mostrarCondiciones, setMostrarCondiciones] = useState(false);

    const [form, setForm] = useState({
        nombreLote: '',
        cultivoAnterior: '',
        tipoRiego: 'secano',
        topografia: 'Plana',
        estadoVerificacion: 'pendiente',
    });

    const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const [dbProvincias, setDbProvincias] = useState([]);
    const [isSelectorVisible, setIsSelectorVisible] = useState(false);
    const [selectorType, setSelectorType] = useState(null);
    const [selectorOptions, setSelectorOptions] = useState([]);

    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState({
        provincia: null,
        canton: null,
        estacion: null,
    });

    // Imagen capturada del mapa para el lote
    const [imagenUrlLote, setImagenUrlLote] = useState(null);

    // Cargar lote existente para edición
    useEffect(() => {
        if (editLoteId) {
            cargarLoteParaEdicion(editLoteId);
        }
    }, [editLoteId]);

    const cargarLoteParaEdicion = async (id) => {
        try {
            const lote = await lotesService.obtenerLote(id);
            if (lote) {
                setIsEditMode(true);
                setEditLoteData(lote);

                // Pre-llenar formulario
                updateForm('nombreLote', lote.nombre_lote || '');
                updateForm('cultivoAnterior', lote.ubicacion_manual || '');
                updateForm('estadoVerificacion', lote.estado_verificacion || 'pendiente');

                // Cargar vértices si existen
                if (lote.vertices && lote.vertices.length > 0) {
                    const pts = lote.vertices.map(v => ({
                        latitude: v[1],
                        longitude: v[0],
                    }));
                    setPoints(pts);

                    // Centrar mapa en el polígono
                    if (pts.length > 0) {
                        const avgLat = pts.reduce((sum, p) => sum + p.latitude, 0) / pts.length;
                        const avgLng = pts.reduce((sum, p) => sum + p.longitude, 0) / pts.length;
                        setLocation({
                            latitude: avgLat,
                            longitude: avgLng,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        });
                    }
                }
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar el lote para edición');
        }
    };

    useEffect(() => {
        let isMounted = true;
        const inicializarMapa = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación.');
                    return;
                }

                let loc = await Location.getLastKnownPositionAsync({});
                if (!loc) {
                    loc = await Promise.race([
                        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout GPS')), 4000))
                    ]);
                }

                if (isMounted && loc) {
                    const initReg = {
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                        latitudeDelta: 0.001,
                        longitudeDelta: 0.001
                    };
                    setLocation(initReg);
                    setCrosshairLocation(initReg);
                    setGpsAccuracy(`±${loc.coords.accuracy.toFixed(1)}m`);
                }
            } catch (error) {
                if (isMounted) {
                    const fallback = { latitude: -0.3641, longitude: -78.5351, latitudeDelta: 0.005, longitudeDelta: 0.005 };
                    setLocation(fallback);
                    setCrosshairLocation(fallback);
                    setGpsAccuracy('Offline');
                }
            }
        };
        inicializarMapa();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (showForm) {
            lotesService.obtenerProvincias()
                .then(provs => {
                    setDbProvincias(provs);
                })
                .catch(() => {
                    // Error cargando provincias
                });
        }
    }, [showForm]);

    const rotarTipoMapa = () => {
        setMapType((prevType) => {
            if (prevType === 'hybrid') return 'standard';
            if (prevType === 'standard') return 'satellite';
            return 'hybrid';
        });
    };

    const centrarEnGPS = async () => {
        try {
            let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
            const reg = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.001,
                longitudeDelta: 0.001
            };
            mapRef.current?.animateToRegion(reg, 1000);
            setGpsAccuracy(`±${loc.coords.accuracy.toFixed(1)}m`);
        } catch (error) {
            // Error al centrar GPS
        }
    };

    const toggleTracking = async () => {
        if (isTracking) {
            if (locationSubscription) {
                locationSubscription.remove();
                setLocationSubscription(null);
            }
            setIsTracking(false);
            isTrackingRef.current = false;
        } else {
            setIsTracking(true);
            isTrackingRef.current = true;
            try {
                const sub = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 2000, distanceInterval: 2 },
                    (newLoc) => {
                        if (!isTrackingRef.current) return;
                        const acc = newLoc.coords.accuracy;
                        setGpsAccuracy(`±${acc.toFixed(1)}m`);
                        const reg = {
                            latitude: newLoc.coords.latitude,
                            longitude: newLoc.coords.longitude,
                            latitudeDelta: 0.001,
                            longitudeDelta: 0.001
                        };
                        mapRef.current?.animateToRegion(reg, 500);
                        if (acc <= 25) {
                            setPoints(prev => [...prev, {
                                latitude: newLoc.coords.latitude,
                                longitude: newLoc.coords.longitude
                            }]);
                        }
                    }
                );
                setLocationSubscription(sub);
            } catch (error) {
                setIsTracking(false);
                isTrackingRef.current = false;
            }
        }
    };

    const agregarVerticeManual = () => {
        if (crosshairLocation) {
            setPoints(prev => [...prev, crosshairLocation]);
        }
    };

    const deshacerUltimoPunto = () => {
        setPoints(prev => prev.slice(0, -1));
    };

    const preGuardarLote = () => {
        if (isTracking) {
            Alert.alert('Rastreo Activo', 'Detenga el modo caminata antes de guardar.');
            return;
        }
        // En modo edición no requiere mínimo de puntos
        if (!isEditMode && points.length < 3) {
            Alert.alert('Geometría Inválida', 'Un polígono requiere al menos 3 vértices.');
            return;
        }
        setShowForm(true);
    };

    const abrirSelector = async (tipo) => {
        setSelectorType(tipo);

        if (tipo === 'provincia') {
            setSelectorOptions(dbProvincias);
        } else if (tipo === 'canton') {
            if (!ubicacionSeleccionada.provincia) {
                Alert.alert('Atención', 'Seleccione una provincia primero.');
                return;
            }
            const provinciaId = ubicacionSeleccionada.provincia.id || ubicacionSeleccionada.provincia.uuid_movil;
            if (!provinciaId) {
                Alert.alert('Error', 'La provincia seleccionada no tiene un identificador válido.');
                return;
            }
            const cantones = await lotesService.obtenerCantones(provinciaId);
            setSelectorOptions(cantones);
        } else if (tipo === 'estacion') {
            const estaciones = await lotesService.obtenerEstaciones();
            setSelectorOptions(estaciones);
        } else if (tipo === 'tipo_riego') {
            setSelectorOptions([
                { id: 'secano', name: 'Sin Riego (Secano)' },
                { id: 'gravedad', name: 'Por Gravedad' },
                { id: 'goteo', name: 'Sistema de Goteo' },
                { id: 'aspersión', name: 'Por Aspersión' },
                { id: 'microaspersión', name: 'Microaspersión' },
            ]);
        } else if (tipo === 'estado_verificacion') {
            setSelectorOptions([
                { id: 'pendiente', name: 'Pendiente' },
                { id: 'verificado', name: 'Activo' },
            ]);
        }
        setIsSelectorVisible(true);
    };

    const handleSelectOption = (item) => {
        if (selectorType === 'provincia') {
            // province_id es bigint, usar solo el id numérico
            setUbicacionSeleccionada({ provincia: { id: item.id, name: item.name }, canton: null, estacion: null });
        } else if (selectorType === 'canton') {
            // canton_id es bigint, usar solo el id numérico
            setUbicacionSeleccionada(prev => ({ ...prev, canton: { id: item.id, name: item.name }, estacion: null }));
        } else if (selectorType === 'estacion') {
            // location_id es bigint, usar solo el id numérico
            setUbicacionSeleccionada(prev => ({ ...prev, estacion: { id: item.id, name: item.name } }));
        } else if (selectorType === 'tipo_riego') {
            updateForm('tipoRiego', item.id);
        } else if (selectorType === 'estado_verificacion') {
            updateForm('estadoVerificacion', item.id);
        }
        setIsSelectorVisible(false);
    };

    const confirmarGuardado = async () => {
        if (!form.nombreLote.trim() || !ubicacionSeleccionada.provincia || !ubicacionSeleccionada.canton) {
            Alert.alert('Datos Incompletos', 'Asigne un nombre, provincia y cantón al lote.');
            return;
        }

        setIsSaving(true);
        try {
            if (isEditMode && editLoteId) {
                // MODO EDICION - Actualizar lote existente
                const datosActualizacion = {
                    nombre_lote: form.nombreLote.trim(),
                    estado_verificacion: form.estadoVerificacion,
                };

                const resultado = await lotesService.actualizarLote(editLoteId, datosActualizacion);

                if (resultado && resultado.data) {
                    Alert.alert('Éxito', 'Lote actualizado correctamente.');
                    setShowForm(false);
                    if (onLoteSaved) {
                        onLoteSaved(form.nombreLote, false);
                    }
                } else {
                    Alert.alert('Error', resultado?.message || resultado?.error || 'No se pudo actualizar el lote.');
                }
            } else {
                // MODO CREACION - Crear nuevo lote
                const uuidLote = Crypto.randomUUID();
                const uuidProyecto = Crypto.randomUUID();

                // 1. Guardar lote LOCALMENTE primero (offline-first)
                const datosLoteLocal = {
                    nombre_lote: form.nombreLote.trim(),
                    coordenadas: points,
                    ubicacion_manual: form.cultivoAnterior.trim() || null,
                    estado_verificacion: form.estadoVerificacion || 'pendiente',
                    provincia_id: ubicacionSeleccionada.provincia.id,
                    canton_id: ubicacionSeleccionada.canton.id,
                    estacion_id: ubicacionSeleccionada.estacion?.id || null,
                    altitud: null,
                    imagen_url: imagenUrlLote,
                    vertices_count: points.length,
                };

                let loteCreado;
                try {
                    loteCreado = await crearLoteLocal(datosLoteLocal);
                } catch (loteError) {
                    // console removed
                    Alert.alert('Error', 'No se pudo guardar el lote localmente.');
                    setIsSaving(false);
                    return;
                }

                // 2. Guardar proyecto LOCALMENTE con referencia al lote
                const datosProyectoLocal = {
                    uuid_movil: uuidProyecto,
                    titulo: `Proyecto - ${form.nombreLote.trim()}`,
                    descripcion: form.cultivoAnterior.trim() || 'Sin descripción',
                    variedad: 'Por definir',
                    fecha_siembra: null,
                    estado: 'pendiente',
                    tipo_acolchado: null,
                    tipo_ensayo: null,
                    diseno_experimental: null,
                    financiamiento: null,
                    colaborador_nombre: null,
                    colaborador_telefono: null,
                    colaborador_celular: null,
                };

                let proyectoCreado;
                try {
                    proyectoCreado = await crearProyectoLocal(datosProyectoLocal, { loteUuid: loteCreado.uuid_movil });
                } catch (proyError) {
                    // console removed
                    // El lote ya está creado, el proyecto es secundario
                }

                // 3. Sincronizar con API en segundo plano
                const datosLoteApi = {
                    uuid_movil: loteCreado.uuid_movil,
                    nombre_lote: form.nombreLote.trim(),
                    coordenadas: points,
                    ubicacion_manual: form.cultivoAnterior.trim() || null,
                    estado_verificacion: form.estadoVerificacion || 'pendiente',
                    province_id: ubicacionSeleccionada.provincia.id,
                    canton_id: ubicacionSeleccionada.canton.id,
                    location_id: ubicacionSeleccionada.estacion?.id || null,
                    altitud: null,
                    imagen_url: imagenUrlLote,
                    vertices_count: points.length,
                    proyectos: [
                        {
                            uuid_movil: uuidProyecto,
                            titulo: `Proyecto - ${form.nombreLote.trim()}`,
                            descripcion: form.cultivoAnterior.trim() || 'Sin descripción',
                            variedad: 'Por definir',
                            tipo_riego: form.tipoRiego,
                            topografia: form.topografia,
                        }
                    ],
                };

                try {
                    await lotesService.crearLote(datosLoteApi);
                } catch (apiError) {
                    // console.log removed
                }

                Alert.alert('Éxito', 'Lote guardado correctamente.');
                setShowForm(false);
                setPoints([]);
                setForm({ nombreLote: '', cultivoAnterior: '', tipoRiego: 'secano', topografia: 'Plana' });
                setUbicacionSeleccionada({ provincia: null, canton: null, estacion: null });
                setImagenUrlLote(null);
                if (onLoteSaved) {
                    onLoteSaved(form.nombreLote, true);
                }
            }

        } catch (error) {
            Alert.alert('Error Crítico', 'No se pudo guardar la geometría.');
        } finally {
            setIsSaving(false);
        }
    };

    return {
        mapRef,
        location,
        points,
        isSaving,
        gpsAccuracy,
        isTracking,
        showForm,
        setShowForm,
        form,
        updateForm,
        isSelectorVisible,
        setIsSelectorVisible,
        selectorType,
        selectorOptions,
        ubicacionSeleccionada,
        setCrosshairLocation,
        centrarEnGPS,
        toggleTracking,
        agregarVerticeManual,
        deshacerUltimoPunto,
        preGuardarLote,
        abrirSelector,
        handleSelectOption,
        confirmarGuardado,
        mostrarCondiciones,
        setMostrarCondiciones,
        mapType,
        rotarTipoMapa,
        isEditMode,
        editLoteData,
        imagenUrlLote,
        setImagenUrlLote,
    };
};
