import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { LEAFLET_CSS, LEAFLET_JS } from '../leaflet/leafletBundle';

/**
 * Convierte un latitudeDelta aproximado a nivel de zoom en Leaflet (0 - 19)
 */
const latitudeDeltaToZoom = (delta) => {
    if (!delta || delta <= 0) return 17;
    const z = Math.round(Math.log2(360 / delta));
    return Math.min(Math.max(z, 3), 19);
};

const FreeMapView = forwardRef(function FreeMapView(
    {
        style,
        initialRegion,
        onRegionChangeComplete,
        onRegionChange,
        mapType = 'standard',
        showsUserLocation = true,
        userLocation,
        points = [],
        scrollEnabled = true,
        zoomEnabled = true,
        is3D = false,
        onMapReady,
    },
    ref
) {
    const webViewRef = useRef(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const pendingCommandsRef = useRef([]);

    const initialLat = initialRegion?.latitude ?? -0.22;
    const initialLng = initialRegion?.longitude ?? -78.51;
    const initialZoom = latitudeDeltaToZoom(initialRegion?.latitudeDelta || 0.001);

    // Enviar JavaScript seguro al WebView
    const execJS = useCallback((code) => {
        if (isMapLoaded && webViewRef.current) {
            webViewRef.current.injectJavaScript(`${code}; true;`);
        } else {
            pendingCommandsRef.current.push(code);
        }
    }, [isMapLoaded]);

    // Ejecutar comandos pendientes cuando el mapa esté listo
    useEffect(() => {
        if (isMapLoaded && pendingCommandsRef.current.length > 0) {
            const cmds = pendingCommandsRef.current.join(';\n');
            pendingCommandsRef.current = [];
            webViewRef.current?.injectJavaScript(`${cmds}; true;`);
        }
    }, [isMapLoaded]);

    // Métodos expuestos hacia el componente padre mediante ref
    useImperativeHandle(ref, () => ({
        animateToRegion: (region, duration = 500) => {
            if (!region) return;
            const lat = region.latitude;
            const lng = region.longitude;
            const zoom = latitudeDeltaToZoom(region.latitudeDelta);
            const durationSec = Math.max(duration / 1000, 0.4);
            execJS(`window.flyToRegion(${lat}, ${lng}, ${zoom}, ${durationSec})`);
        },
        animateCamera: ({ pitch = 0 }) => {
            execJS(`window.toggle3D(${pitch > 0})`);
        },
        fitBounds: (coords) => {
            if (!coords || coords.length === 0) return;
            execJS(`window.fitCoords(${JSON.stringify(coords)})`);
        },
    }), [execJS]);

    // Sincronizar vértices del polígono
    useEffect(() => {
        execJS(`window.updatePoints(${JSON.stringify(points || [])})`);
    }, [points, execJS]);

    // Sincronizar ubicación del usuario
    useEffect(() => {
        if (showsUserLocation && userLocation) {
            execJS(`window.updateUserLocation(${userLocation.latitude}, ${userLocation.longitude})`);
        } else if (!showsUserLocation) {
            execJS(`window.updateUserLocation(null, null)`);
        }
    }, [showsUserLocation, userLocation, execJS]);

    // Sincronizar tipo de mapa (standard / satellite / hybrid)
    useEffect(() => {
        execJS(`window.switchMapType('${mapType}')`);
    }, [mapType, execJS]);

    // Sincronizar interacción táctil
    useEffect(() => {
        execJS(`window.setInteractions(${Boolean(scrollEnabled)}, ${Boolean(zoomEnabled)})`);
    }, [scrollEnabled, zoomEnabled, execJS]);

    // Sincronizar perspectiva 3D
    useEffect(() => {
        execJS(`window.toggle3D(${Boolean(is3D)})`);
    }, [is3D, execJS]);

    // Procesar mensajes enviados desde el WebView
    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'mapReady') {
                setIsMapLoaded(true);
                if (onMapReady) onMapReady();
            } else if (data.type === 'regionChange') {
                if (onRegionChange) {
                    onRegionChange({
                        latitude: data.latitude,
                        longitude: data.longitude,
                        zoom: data.zoom,
                    });
                }
            } else if (data.type === 'regionChangeComplete') {
                if (onRegionChangeComplete) {
                    onRegionChangeComplete({
                        latitude: data.latitude,
                        longitude: data.longitude,
                        zoom: data.zoom,
                    });
                }
            }
        } catch {
            // Ignorar mensajes no JSON
        }
    };

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    ${LEAFLET_CSS}
  </style>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: #121212;
      overflow: hidden;
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }
    #map-wrapper {
      width: 100%;
      height: 100%;
      perspective: 900px;
    }
    #map {
      width: 100%;
      height: 100%;
      background-color: #1a1a1a;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #map.perspective-3d {
      transform: rotateX(45deg);
      transform-origin: center bottom;
    }
    .leaflet-control-attribution, .leaflet-control-zoom {
      display: none !important;
    }
    .custom-vertex-pin {
      width: 22px;
      height: 22px;
      border-radius: 11px;
      background-color: #1C1C1E;
      border: 2px solid #30D158;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.6);
    }
    .custom-vertex-pin span {
      font-size: 11px;
      font-weight: 800;
      color: #30D158;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1;
    }
    .user-loc-wrapper {
      position: relative;
      width: 24px;
      height: 24px;
    }
    .user-dot {
      position: absolute;
      top: 4px;
      left: 4px;
      width: 16px;
      height: 16px;
      border-radius: 8px;
      background-color: #0A84FF;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 0 10px rgba(10, 132, 255, 0.9);
    }
    .user-pulse {
      position: absolute;
      top: 0;
      left: 0;
      width: 24px;
      height: 24px;
      border-radius: 12px;
      background-color: rgba(10, 132, 255, 0.35);
      animation: pulse 2s infinite ease-out;
    }
    @keyframes pulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
  </style>
  <script>
    ${LEAFLET_JS}
  </script>
</head>
<body>
  <div id="map-wrapper">
    <div id="map"></div>
  </div>

  <script>
    (function() {
      var initialLat = ${initialLat};
      var initialLng = ${initialLng};
      var initialZoom = ${initialZoom};
      var currentType = '${mapType}';

      // 1. Inicializar mapa Leaflet
      var map = L.map('map', {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: true,
        zoomAnimation: true
      });

      // 2. Capas de mapa Gratuitas (Sin API Key)
      // Capa Calles estándar: OpenStreetMap
      var standardLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      });

      // Capa Satelital gratuita de alta resolución: Esri World Imagery
      var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      });

      // Capa Híbrida: Satélite Esri + Nombres/Límites CartoDB
      var hybridBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      });
      var hybridLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      });
      var hybridLayer = L.layerGroup([hybridBase, hybridLabels]);

      // Activar capa inicial
      if (currentType === 'satellite') {
        satelliteLayer.addTo(map);
      } else if (currentType === 'hybrid') {
        hybridLayer.addTo(map);
      } else {
        standardLayer.addTo(map);
      }

      // Grupos de elementos
      var markersGroup = L.layerGroup().addTo(map);
      var polygonGroup = L.layerGroup().addTo(map);
      var userGroup = L.layerGroup().addTo(map);

      // Eventos de movimiento de mapa hacia React Native
      var moveThrottle = false;
      map.on('move', function() {
        if (!moveThrottle) {
          moveThrottle = true;
          setTimeout(function() { moveThrottle = false; }, 100);
          var c = map.getCenter();
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'regionChange',
              latitude: c.lat,
              longitude: c.lng,
              zoom: map.getZoom()
            }));
          }
        }
      });

      map.on('moveend', function() {
        var c = map.getCenter();
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'regionChangeComplete',
            latitude: c.lat,
            longitude: c.lng,
            zoom: map.getZoom()
          }));
        }
      });

      // Funciones globales invocadas desde React Native
      window.updatePoints = function(pts) {
        markersGroup.clearLayers();
        polygonGroup.clearLayers();
        if (!pts || !pts.length) return;

        pts.forEach(function(p, i) {
          var icon = L.divIcon({
            className: 'custom-vertex-pin-wrap',
            html: '<div class="custom-vertex-pin"><span>' + (i + 1) + '</span></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          L.marker([p.latitude, p.longitude], { icon: icon, interactive: false }).addTo(markersGroup);
        });

        if (pts.length >= 3) {
          var latlngs = pts.map(function(p) { return [p.latitude, p.longitude]; });
          L.polygon(latlngs, {
            color: '#30D158',
            weight: 2.5,
            fillColor: '#30D158',
            fillOpacity: 0.25
          }).addTo(polygonGroup);
        } else if (pts.length === 2) {
          L.polyline([
            [pts[0].latitude, pts[0].longitude],
            [pts[1].latitude, pts[1].longitude]
          ], {
            color: '#30D158',
            weight: 2.5,
            dashArray: '5, 5'
          }).addTo(polygonGroup);
        }
      };

      window.updateUserLocation = function(lat, lng) {
        userGroup.clearLayers();
        if (lat == null || lng == null) return;
        var icon = L.divIcon({
          className: 'user-loc-wrap',
          html: '<div class="user-pulse"></div><div class="user-dot"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        L.marker([lat, lng], { icon: icon, interactive: false }).addTo(userGroup);
      };

      window.switchMapType = function(type) {
        map.removeLayer(standardLayer);
        map.removeLayer(satelliteLayer);
        map.removeLayer(hybridLayer);

        if (type === 'satellite') {
          satelliteLayer.addTo(map);
        } else if (type === 'hybrid') {
          hybridLayer.addTo(map);
        } else {
          standardLayer.addTo(map);
        }
      };

      window.flyToRegion = function(lat, lng, zoom, durationSec) {
        map.flyTo([lat, lng], zoom, { duration: durationSec || 0.6 });
      };

      window.fitCoords = function(coords) {
        if (!coords || !coords.length) return;
        var bounds = L.latLngBounds(coords.map(function(c) { return [c.latitude, c.longitude]; }));
        map.fitBounds(bounds, { padding: [30, 30] });
      };

      window.toggle3D = function(is3d) {
        var el = document.getElementById('map');
        if (is3d) {
          el.classList.add('perspective-3d');
        } else {
          el.classList.remove('perspective-3d');
        }
        setTimeout(function() { map.invalidateSize(); }, 350);
      };

      window.setInteractions = function(scrollable, zoomable) {
        if (scrollable) {
          map.dragging.enable();
        } else {
          map.dragging.disable();
        }
        if (zoomable) {
          map.touchZoom.enable();
          map.scrollWheelZoom.enable();
          map.doubleClickZoom.enable();
        } else {
          map.touchZoom.disable();
          map.scrollWheelZoom.disable();
          map.doubleClickZoom.disable();
        }
      };

      // Inicializar con puntos si ya se recibieron
      window.updatePoints(${JSON.stringify(points || [])});
      ${showsUserLocation && userLocation ? `window.updateUserLocation(${userLocation.latitude}, ${userLocation.longitude});` : ''}

      // Notificar a React Native que el mapa está cargado
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
      }
    })();
  </script>
</body>
</html>`;

    return (
        <View style={[styles.container, style]}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                style={styles.webview}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={false}
                scalesPageToFit={true}
                scrollEnabled={false}
                bounces={false}
                overScrollMode="never"
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                androidHardwareAccelerationDisabled={false}
            />
        </View>
    );
});

export default FreeMapView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        overflow: 'hidden',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});
