let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function playAlarmSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    const frequencies = [880, 660, 880, 660]
    const totalDuration = 2

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'square'
      osc.frequency.setValueAtTime(freq, now + i * 0.5)

      gain.gain.setValueAtTime(0.3, now + i * 0.5)
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.5 + 0.4)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.5)
      osc.stop(now + i * 0.5 + 0.4)
    })

    return totalDuration
  } catch {
    return 0
  }
}

export function playGentleTone() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(523, now)
    osc.frequency.linearRampToValueAtTime(659, now + 0.3)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.8)
  } catch {
    // silent fallback
  }
}
