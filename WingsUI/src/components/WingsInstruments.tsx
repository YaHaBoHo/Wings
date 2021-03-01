/*
* ReactJS implementation of sebmatton's jQuery Flight Indicators
* Original : https://github.com/sebmatton/jQuery-Flight-Indicators
*/

import { Component } from 'react'
import './css/WingsInstruments.css'
import InstrumentBox from "./img/fi_box.svg"
import InstrumentRing from "./img/fi_circle.svg"
import InstrumentNeedle from "./img/fi_needle.svg"
import InstrumentNeedleShort from "./img/fi_needle_small.svg"
import InstrumentNeedleLong from "./img/fi_needle_long.svg"
import AltitudePressure from './img/altitude_pressure.svg'
import AltitudeFace from './img/altitude_ticks.svg'
import HorizonBack from "./img/horizon_back.svg"
import HorizonBall from "./img/horizon_ball.svg"
import HorizonCircle from "./img/horizon_circle.svg"
import HorizonFace from "./img/horizon_mechanics.svg"
import VerticalSpeedFace from "./img/vertical_mechanics.svg"
import AirSpeedFace from "./img/speed_mechanics.svg"
import CompassAirplane from "./img/heading_mechanics.svg"
import CompassFace from "./img/heading_yaw.svg"


// Config
const PITCH_BOUNDS : number = 25;


// Helpers
function clamp(v : number, vmin : number, vmax : number){
  return Math.max(Math.min(v, vmax), vmin)
}
function getRotate(angle: number){
  return `rotateZ(${angle}deg)`
}


// Attitude
type AttituteProps = { pitch: number, roll: number}
export class Attitute extends Component<AttituteProps,{}> {
  render(){
    const roll : number = -this.props.roll
    const pitch : number = 0.7*clamp(this.props.pitch, -PITCH_BOUNDS, PITCH_BOUNDS)
    return (
      <div className="instrumentBlock">
        <img src={InstrumentBox} className="instrumentLayer" alt="Attitude" />
        <img src={HorizonBack} className="instrumentLayer" alt="" />
        <img src={HorizonBall} className="instrumentLayer" style={{transform: getRotate(roll), top:`${pitch}%`}} alt="" />
        <img src={HorizonCircle} className="instrumentLayer" style={{transform: getRotate(roll)}} alt="" />
        <img src={HorizonFace} className="instrumentLayer" alt="" />
        <img src={InstrumentRing} className="instrumentLayer" alt="" />
      </div>
    )  
  }
}


// Altimeter
type AltimeterProps = { altitude: number }
export class Altimeter extends Component<AltimeterProps,{}> {
  render(){
    const altiLong : number = 90 + 0.0036 * this.props.altitude;
    const altiShort : number = 0.036 * (this.props.altitude % 10000);
    const altiMain : number = 90 + .36 * (this.props.altitude % 1000);
    // const pressure = 2 * (clamp(this.props.pressure, 975, 1040) - 990);
    return (
      <div className="instrumentBlock">
        <img src={InstrumentBox} className="instrumentLayer" alt="Altimeter" />
        <img src={AltitudePressure} className="instrumentLayer" alt="" />
        <img src={AltitudeFace} className="instrumentLayer" alt="" />
        <img src={InstrumentNeedleLong} className="instrumentLayer" style={{transform: getRotate(altiLong)}} alt="" />
        <img src={InstrumentNeedle} className="instrumentLayer" style={{transform: getRotate(altiMain)}} alt="" />
        <img src={InstrumentNeedleShort} className="instrumentLayer" style={{transform: getRotate(altiShort)}} alt="" />
        <img src={InstrumentRing} className="instrumentLayer" alt="" />
      </div>
    )  
  }
}



// Vertical speed
type VerticalSpeedProps = { vspeed: number }
export class VerticalSpeed extends Component<VerticalSpeedProps,{}> {
  render(){
    const vspeed = 0.09 * clamp(this.props.vspeed, -2000, 2000);
    return (
      <div className="instrumentBlock">
        <img src={InstrumentBox} className="instrumentLayer" alt="Vertical speed" />
        <img src={VerticalSpeedFace} className="instrumentLayer" alt="" />
        <img src={InstrumentNeedle} className="instrumentLayer" style={{transform: getRotate(vspeed)}} alt="" />
        <img src={InstrumentRing} className="instrumentLayer" alt="" />
      </div>
    )  
  }
}


// Air speed
type AirSpeedProps = { speed: number }
export class AirSpeed extends Component<AirSpeedProps,{}> {
  render(){
    const speed = 90 + 2 * clamp(this.props.speed, 0, 160);
    return (
      <div className="instrumentBlock">
        <img src={InstrumentBox} className="instrumentLayer" alt="Air speed" />
        <img src={AirSpeedFace} className="instrumentLayer" alt="" />
        <img src={InstrumentNeedle} className="instrumentLayer" style={{transform: getRotate(speed)}} alt="" />
        <img src={InstrumentRing} className="instrumentLayer" alt="" />
      </div>
    ) 
  }
}


// Compass
type CompassProps = { heading: number }
export class Compass extends Component<CompassProps,{}> {
  render(){
    const heading = -clamp(this.props.heading, 0, 360);
    return (
      <div className="instrumentBlock">
        <img src={InstrumentBox} className="instrumentLayer" alt="Compass" />
        <img src={CompassFace} className="instrumentLayer" style={{transform: getRotate(heading)}} alt="" />
        <img src={CompassAirplane} className="instrumentLayer" alt="" />
        <img src={InstrumentRing} className="instrumentLayer" alt="" />
      </div>
    ) 
  }
}
