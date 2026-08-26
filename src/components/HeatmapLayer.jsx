import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

if (typeof window !== 'undefined' && !window.L) {
  window.L = L
}

export default function HeatmapLayer({ points = [], options = {} }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !points || points.length === 0) return

    const heatLayerFunction = L.heatLayer || (window.L && window.L.heatLayer)
    if (typeof heatLayerFunction !== 'function') {
      console.warn('L.heatLayer is not a function. Heatmap cannot be rendered.')
      return
    }

    const defaultGradient = {
      0.2: '#3b82f6', // blue
      0.4: '#06b6d4', // cyan
      0.6: '#22c55e', // green
      0.8: '#eab308', // yellow
      0.95: '#ef4444'  // red
    }

    const heatLayer = heatLayerFunction(points, {
      radius: options.radius ?? 32,
      blur: options.blur ?? 20,
      maxZoom: options.maxZoom ?? 16,
      max: options.max ?? 1.0,
      minOpacity: options.minOpacity ?? 0.5,
      gradient: options.gradient || defaultGradient
    })

    heatLayer.addTo(map)

    return () => {
      try {
        map.removeLayer(heatLayer)
      } catch (_err) {
        // Safe cleanup if map is already destroyed
      }
    }
  }, [map, points, options])

  return null
}
