import { useEffect } from 'react'
import L, { Point, LatLngExpression, Icon, DomUtil, Marker } from 'leaflet'
import { useLeafletContext } from '@react-leaflet/core'


const planeImage : string = "./media/wings.png"
const proto_setPos = (L.Marker as any).prototype._setPos


type WingsMarkerProps = {
    position: LatLngExpression,
    rotation?: number,
    track?: boolean
}


const planeIcon : Icon = new Icon({
    iconUrl: planeImage,
    iconSize: new Point(32, 32),
    iconAnchor: new Point(16, 16)
});


// Based on [https://github.com/bbecquet/Leaflet.RotatedMarker]
const _WingsMarker = L.Marker.include({
    _setPos: function (pos : Point) {
        proto_setPos.call(this, pos);
        this._setRotation();
    },
    _setRotation: function () {
        if(this.options.rotation){
            this._icon.style[DomUtil.TRANSFORM+'Origin'] = "center";
            if(DomUtil.TRANSFORM === 'msTransform') {
                // for IE 9, use the 2D rotation
                this._icon.style[DomUtil.TRANSFORM] = 'rotate(' + this.options.rotation + 'deg)';
            } else {
                // for modern browsers, prefer the 3D accelerated version
                this._icon.style[DomUtil.TRANSFORM] += ' rotateZ(' + this.options.rotation + 'deg)';
            }
        }
    }
});

export function WingsMarker(props : WingsMarkerProps) {

    const context = useLeafletContext()
  
    useEffect(() => {
        // Props
        const propTrack : boolean = props.track || false;
        const propRotation : number = (135 + (props.rotation || 0)) % 360;
        // Base markers
        const container = context.layerContainer || context.map;
        const marker = new _WingsMarker(props.position, {icon: planeIcon, rotation: propRotation});
        // Map tracking
        if (propTrack) { context.map.panTo(props.position, {duration: 1.0}); }
        // Add to parent layer
        container.addLayer(marker)
  
        return () => {
            container.removeLayer(marker)
        }
    })
  
    return null
}



