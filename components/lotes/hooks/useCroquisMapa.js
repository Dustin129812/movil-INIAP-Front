import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { lotesService } from '../../../services/lotesService';

export const useCroquisMapa = () => {
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

    const [mostrarCondiciones, setMostrarCondiciones] = useState(false);

    const [form, setForm] = useState({
        nombreLote: '',
        cultivoAnterior: '',
        tipoRiego: 'secano',
        topografia: 'Plana',
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
            lotesService.obtenerProvincias().then(setDbProvincias).catch(e => console.log(e));
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
            console.log('Error al centrar:', error);
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
        if (points.length < 3) {
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
            console.log('Abriendo canton, provincia:', ubicacionSeleccionada.provincia);
            if (!ubicacionSeleccionada.provincia) {
                Alert.alert('Atención', 'Seleccione una provincia primero.');
                return;
            }
            console.log('Obteniendo cantones para provincia:', ubicacionSeleccionada.provincia.id);
            const cantones = await lotesService.obtenerCantones(ubicacionSeleccionada.provincia.id);
            console.log('Cantones recibidos:', cantones);
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
        }
        setIsSelectorVisible(true);
    };

    const handleSelectOption = (item) => {
        console.log('Seleccionando item:', selectorType, item);
        if (selectorType === 'provincia') {
            setUbicacionSeleccionada({ provincia: item, canton: null, estacion: null });
        } else if (selectorType === 'canton') {
            setUbicacionSeleccionada(prev => ({ ...prev, canton: item, estacion: null }));
        } else if (selectorType === 'estacion') {
            setUbicacionSeleccionada(prev => ({ ...prev, estacion: item }));
        } else if (selectorType === 'tipo_riego') {
            updateForm('tipoRiego', item.id);
        }
        setIsSelectorVisible(false);
    };

    const confirmarGuardado = async () => {
        console.log('Validando - nombreLote:', form.nombreLote);
        console.log('Validando - provincia:', ubicacionSeleccionada.provincia);
        console.log('Validando - canton:', ubicacionSeleccionada.canton);

        if (!form.nombreLote.trim() || !ubicacionSeleccionada.provincia || !ubicacionSeleccionada.canton) {
            Alert.alert('Datos Incompletos', 'Asigne un nombre, provincia y cantón al lote.');
            return;
        }

        setIsSaving(true);
        try {
            const datosLote = {
                nombre_lote: form.nombreLote,
                coordenadas: points,
                ubicacion: ubicacionSeleccionada,
                condiciones_terreno: {
                    cultivo_anterior: form.cultivoAnterior.trim() || 'Ninguno/Desconocido',
                    tipo_riego: form.tipoRiego,
                    topografia: form.topografia,
                },
            };

            const resultado = await lotesService.crearLote(datosLote);

            if (resultado.success) {
                Alert.alert('Éxito', 'Lote guardado correctamente.');
                setShowForm(false);
                setPoints([]);
                setForm({ nombreLote: '', cultivoAnterior: '', tipoRiego: 'secano', topografia: 'Plana' });
                setUbicacionSeleccionada({ provincia: null, canton: null, estacion: null });
            } else {
                Alert.alert('Error', resultado.message || 'No se pudo guardar el lote.');
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
    };
};
