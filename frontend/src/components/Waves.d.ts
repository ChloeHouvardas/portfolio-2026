import type { CSSProperties } from 'react'

export interface WavesProps {
  lineColor?: string
  backgroundColor?: string
  waveSpeedX?: number
  waveSpeedY?: number
  waveAmpX?: number
  waveAmpY?: number
  xGap?: number
  yGap?: number
  friction?: number
  tension?: number
  maxCursorMove?: number
  style?: CSSProperties
  className?: string
}

export default function Waves(props: WavesProps): JSX.Element
