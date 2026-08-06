import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Circle, Text as SvgText } from 'react-native-svg';

const PADDING = 6;
const DOT_RADIUS = 2.5;
const WIDTH = 105 - PADDING * 2;
const HEIGHT = 75 - PADDING * 2;

/**
 * Componente que dibuja los vértices de un lote en miniatura
 * @param {Array} vertices - Array de coordenadas [[lng, lat], [lng, lat], ...]
 * @param {string} color - Color de las líneas
 */
export default function VerticesMap({ vertices, color = '#34C759' }) {
    if (!vertices || !Array.isArray(vertices) || vertices.length < 2) {
        return null;
    }

    // Los vértices vienen como [longitud, latitud]
    const points = vertices.map(v => {
        if (Array.isArray(v)) {
            return { lng: v[0] || 0, lat: v[1] || 0 };
        }
        if (typeof v === 'object') {
            return { lng: v.lng || v.longitude || 0, lat: v.lat || v.latitude || 0 };
        }
        return { lng: 0, lat: 0 };
    });

    // Calcular bounding box
    const lngs = points.map(p => p.lng);
    const lats = points.map(p => p.lat);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const lngRange = maxLng - minLng || 0.0001;
    const latRange = maxLat - minLat || 0.0001;

    // Escalar para ajustar al contenedor (85% para dejar margen)
    const scaleX = (WIDTH * 0.85) / lngRange;
    const scaleY = (HEIGHT * 0.85) / latRange;
    const scale = Math.min(scaleX, scaleY);

    // Offset para centrar
    const offsetX = (WIDTH - lngRange * scale) / 2;
    const offsetY = (HEIGHT - latRange * scale) / 2;

    // Transformar puntos escalados y centrados
    const transformedPoints = points.map(p => ({
        x: (p.lng - minLng) * scale + offsetX,
        y: HEIGHT - ((p.lat - minLat) * scale + offsetY), // Invertir Y porque SVG Y crece hacia abajo
    }));

    // Crear string para Polyline
    const polylinePoints = transformedPoints.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            {/* Línea que conecta los vértices (polígono cerrado) */}
            <Polyline
                points={polylinePoints}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={0.8}
            />
            {/* Puntos en cada vértice */}
            {transformedPoints.map((p, i) => (
                <Circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={i === 0 ? DOT_RADIUS + 1 : DOT_RADIUS}
                    fill={i === 0 ? color : '#FFFFFF'}
                    stroke={color}
                    strokeWidth={1}
                />
            ))}
        </Svg>
    );
}

/**
 * Helper para mostrar el conteo de vértices
 */
export function getVerticesInfo(item) {
    const vertices = item?.vertices || item?.coordenadas || item?.puntos || null;
    const count = vertices
        ? (Array.isArray(vertices) ? vertices.length : 0)
        : (item?.vertices_count || 0);

    // Obtener primer y último vértice para mostrar coords
    let firstCoord = null;
    let lastCoord = null;

    if (vertices && Array.isArray(vertices) && vertices.length > 0) {
        const first = vertices[0];
        const last = vertices[vertices.length - 1];

        if (Array.isArray(first)) {
            firstCoord = { lng: first[0], lat: first[1] };
            lastCoord = { lng: last[0], lat: last[1] };
        } else if (typeof first === 'object') {
            firstCoord = { lng: first.lng || first.longitude, lat: first.lat || first.latitude };
            lastCoord = { lng: last.lng || last.longitude, lat: last.lat || last.latitude };
        }
    }

    return { vertices, count, firstCoord, lastCoord };
}
