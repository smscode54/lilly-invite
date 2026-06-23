import { useEffect, useRef, useState, useCallback } from 'react'
import { skateDataUrl } from '../lib/skateDataUrl'
import Head from 'next/head'

const DEFAULTS = {
  party_name: "🎂 Lilly's 12th Birthday! 🎂",
  banner_datetime: 'SATURDAY · 19 JULY 2025 · 7:00PM',
  detail_when: 'Saturday 19th July 2025 · 7:00pm – 10:00pm',
  detail_where: 'Rollerworld SA · 123 Skate St, Adelaide SA 5000',
  detail_contact: "Sarah (Lilly's Mum) · 0400 000 000",
  detail_food: 'Pizza & cake included 🍕🎂 · Text Sarah re dietary needs',
  detail_skates: 'Hire included — just bring your socks & best moves 🕺',
  ticker: "🛼 Rollerskating Disco Party · Saturday 19 July · 7pm–10pm · Rollerworld SA · 🎉 Lilly's 12th · 🛼",
}

const PASS = process.env.NEXT_PUBLIC_HOST_PASSWORD || 'disco2025'

export default function Home() {
  const [screen, setScreen] = useState('intro') // intro | main | host
  const [panel, setPanel] = useState('details')
  const [details, setDetails] = useState(DEFAULTS)
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpDone, setRsvpDone] = useState(null) // null | 'yes' | 'no'
  const [rsvpErr, setRsvpErr] = useState(false)
  const [hostPw, setHostPw] = useState('')
  const [hostErr, setHostErr] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [rsvps, setRsvps] = useState([])
  const [editForm, setEditForm] = useState({})
  const [saveMsg, setSaveMsg] = useState(false)
  const [loading, setLoading] = useState(false)

  const bgRef = useRef(null)
  const floorRef = useRef(null)
  const ballRef = useRef(null)

  // Load party details on mount
  useEffect(() => {
    fetch('/api/details')
      .then(r => r.json())
      .then(d => { if (d && d.party_name) setDetails({ ...DEFAULTS, ...d }) })
      .catch(() => {})
  }, [])

  // Background ray animation
  useEffect(() => {
    const canvas = bgRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rays = [
      { c: 'rgba(192,64,255,', a: 0, s: 0.003 },
      { c: 'rgba(255,16,160,', a: 1.3, s: -0.0035 },
      { c: 'rgba(0,212,255,', a: 2.5, s: 0.004 },
      { c: 'rgba(255,215,0,', a: 3.8, s: -0.003 },
      { c: 'rgba(127,255,127,', a: 5, s: 0.0025 },
    ]
    let raf
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize); resize()
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2, cy = canvas.height * 0.12
      rays.forEach(r => {
        r.a += r.s
        const g = ctx.createLinearGradient(cx, cy, cx + Math.cos(r.a) * canvas.height * 1.6, cy + Math.sin(r.a) * canvas.height * 1.6)
        g.addColorStop(0, r.c + '0.28)'); g.addColorStop(0.4, r.c + '0.09)'); g.addColorStop(1, r.c + '0)')
        ctx.beginPath(); ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(r.a - 0.2) * canvas.height * 1.8, cy + Math.sin(r.a - 0.2) * canvas.height * 1.8)
        ctx.lineTo(cx + Math.cos(r.a + 0.2) * canvas.height * 1.8, cy + Math.sin(r.a + 0.2) * canvas.height * 1.8)
        ctx.closePath(); ctx.fillStyle = g; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  // Dance floor animation
  useEffect(() => {
    const canvas = floorRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const COLS = ['#ff2d78','#c040ff','#00f0ff','#ffd700','#7fff7f','#ff8c00','#ff00ff','#00ffcc']
    let tiles = [], t = 0, raf
    const build = () => {
      tiles = []
      const W = canvas.width, H = canvas.height, cols = 12, rows = 9, tw = W / cols
      for (let r = 0; r < rows; r++) {
        const p = (r + 1) / rows, y = H * Math.pow(p, 1.8), ny = H * Math.pow((r + 2) / rows, 1.8)
        for (let c = 0; c < cols; c++)
          tiles.push({ x: c * tw, y, w: tw, h: ny - y, color: COLS[Math.floor(Math.random() * COLS.length)], ph: Math.random() * Math.PI * 2, sp: 0.4 + Math.random() * 1.8 })
      }
    }
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight * 0.33; build() }
    window.addEventListener('resize', resize); resize()
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      tiles.forEach(e => {
        const br = 0.2 + 0.8 * Math.abs(Math.sin(t * e.sp + e.ph))
        ctx.globalAlpha = br * 0.9; ctx.fillStyle = e.color; ctx.fillRect(e.x + 1, e.y + 1, e.w - 2, e.h - 2)
        ctx.globalAlpha = br * 0.25; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.5; ctx.strokeRect(e.x + 1, e.y + 1, e.w - 2, e.h - 2)
      })
      ctx.globalAlpha = 1
      const g = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.4)
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height * 0.45)
      t += 0.022; raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  // 3D Disco ball
  useEffect(() => {
    const canvas = ballRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 220, H = 195, cx = 110, cy = 100, R = 78
    const C = ['#ff10a0','#c040ff','#00d4ff','#ffd700','#fff','#7fff7f','#ff8800']
    const tiles = []
    for (let ri = 0; ri < 16; ri++) {
      const phi = (ri + 0.5) / 16 * Math.PI, y3d = Math.cos(phi) * R, ringR = Math.sin(phi) * R
      const nc = Math.max(5, Math.round(20 * Math.sin(phi)))
      for (let ci = 0; ci < nc; ci++) tiles.push({ theta: (ci / nc) * Math.PI * 2, y3d, ringR, color: C[Math.floor(Math.random() * C.length)] })
    }
    let angle = 0, raf
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, 5); ctx.lineTo(cx, cy - R); ctx.stroke()
      const vis = []
      tiles.forEach(e => {
        const th = e.theta + angle, xd = Math.cos(th) * e.ringR, zd = Math.sin(th) * e.ringR
        if (zd > -5) vis.push({ ...e, x3d: xd, z3d: zd })
      })
      vis.sort((a, b) => a.z3d - b.z3d)
      vis.forEach(e => {
        const ef = Math.max(0.25, (e.z3d + R) / (2 * R)), tw = Math.max(1.5, 11 * ef), th = Math.max(1, 8 * ef)
        const l = Math.max(0, -e.x3d / R * 0.3 + -e.y3d / R * 0.5 + e.z3d / R * 0.75)
        ctx.save(); ctx.translate(cx + e.x3d, cy - e.y3d); ctx.rotate(Math.atan2(e.y3d, e.x3d) * 0.12)
        ctx.globalAlpha = ef * 0.92; ctx.fillStyle = e.color; ctx.fillRect(-tw / 2, -th / 2, tw, th)
        ctx.fillStyle = `rgba(255,255,255,${l * 0.55})`; ctx.fillRect(-tw / 2, -th / 2, tw * 0.55, th * 0.45)
        ctx.globalAlpha = 1; ctx.restore()
      })
      const rim = ctx.createRadialGradient(cx, cy, R * 0.65, cx, cy, R)
      rim.addColorStop(0, 'rgba(0,0,0,0)'); rim.addColorStop(1, 'rgba(0,0,20,0.75)')
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = rim; ctx.fill()
      const sh = ctx.createRadialGradient(cx - 28, cy - 30, 0, cx - 20, cy - 22, 32)
      sh.addColorStop(0, 'rgba(255,255,255,0.8)'); sh.addColorStop(0.4, 'rgba(255,255,255,0.25)'); sh.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = sh; ctx.fill()
      const bc = ['#ff10a0','#00d4ff','#c040ff','#ffd700','#7fff7f','#ff8800']
      for (let i = 0; i < 6; i++) {
        const a2 = angle * 1.8 + i * (Math.PI * 2 / 6), len = 40 + 22 * Math.sin(angle * 2.5 + i * 1.3)
        const x1 = cx + Math.cos(a2) * R * 0.92, y1 = cy + Math.sin(a2) * R * 0.92
        const x2 = cx + Math.cos(a2) * (R + len), y2 = cy + Math.sin(a2) * (R + len)
        const g = ctx.createLinearGradient(x1, y1, x2, y2)
        g.addColorStop(0, bc[i] + 'dd'); g.addColorStop(1, bc[i] + '00')
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = g; ctx.lineWidth = 2.5; ctx.stroke()
      }
      angle += 0.011; raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  const submitRSVP = async (choice) => {
    if (!rsvpName.trim()) { setRsvpErr(true); return }
    setRsvpErr(false); setLoading(true)
    try {
      await fetch('/api/rsvps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: rsvpName.trim(), coming: choice }) })
      setRsvpDone(choice)
    } catch { setRsvpDone(choice) }
    setLoading(false)
  }

  const hostLogin = async () => {
    if (hostPw !== PASS) { setHostErr(true); return }
    setHostErr(false); setAuthed(true)
    const r = await fetch('/api/rsvps').then(r => r.json()).catch(() => [])
    setRsvps(Array.isArray(r) ? r : [])
    const d = await fetch('/api/details').then(r => r.json()).catch(() => ({}))
    setEditForm({ ...DEFAULTS, ...d })
  }

  const saveDetails = async () => {
    await fetch('/api/details', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
    setDetails({ ...DEFAULTS, ...editForm })
    setSaveMsg(true); setTimeout(() => setSaveMsg(false), 3000)
  }

  const clearRsvps = async () => {
    if (!confirm('Clear all RSVPs?')) return
    await fetch('/api/rsvps', { method: 'DELETE' })
    setRsvps([])
  }

  const goHost = () => { setScreen('host'); setAuthed(false); setHostPw(''); setHostErr(false) }

  const yesCount = rsvps.filter(r => r.coming === 'yes').length
  const noCount = rsvps.filter(r => r.coming === 'no').length

  return (
    <>
      <Head>
        <title>Lilly's 12th Birthday Party!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Pacifico&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      </Head>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#05000f;font-family:'Space Mono',monospace;overflow-x:hidden;min-height:100vh;}
        .screen{display:none;min-height:100vh;flex-direction:column;}
        .screen.active{display:flex;}
        #bgCanvas{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;}
        #floorCanvas{position:fixed;bottom:0;left:0;width:100%;height:33%;pointer-events:none;z-index:0;opacity:0.5;}
        .above{position:relative;z-index:3;}
        .nt-lets{font-family:'Fredoka One',cursive;font-size:5.5rem;letter-spacing:4px;text-align:center;color:transparent;-webkit-text-stroke:2px #00f0ff;text-shadow:0 0 6px #00f0ff,0 0 12px #00f0ff88;line-height:1;animation:fl1 7s infinite;}
        .nt-roll{font-family:'Fredoka One',cursive;font-size:5.5rem;letter-spacing:4px;text-align:center;color:transparent;-webkit-text-stroke:2px #c040ff;text-shadow:0 0 6px #c040ff,0 0 12px #c040ff88;line-height:1;}
        .nt-party{font-family:'Pacifico',cursive;font-size:3.4rem;text-align:center;color:#fff;text-shadow:0 0 6px #fff,0 0 14px #ff2d78,0 0 28px #ff2d7866;margin:0.2rem 0;animation:fl2 9s infinite;}
        .nt-name{font-family:'Fredoka One',cursive;font-size:3.8rem;text-align:center;color:transparent;-webkit-text-stroke:2px #ffd700;text-shadow:0 0 6px #ffd700,0 0 14px #ffd70088;animation:fl3 5s infinite;margin-top:0.3rem;}
        @keyframes fl1{0%,18%,20%,54%,56%,100%{opacity:1;}19%,55%{opacity:0.75;}}
        @keyframes fl2{0%,88%,90%,100%{opacity:1;}89%{opacity:0.6;}}
        @keyframes fl3{0%,60%,62%,100%{opacity:1;}61%{opacity:0.65;}}
        .enter-btn{margin:1.2rem auto 0.5rem;padding:0.9rem 2.5rem;background:transparent;border:3px solid #ff2d78;border-radius:50px;font-family:'Fredoka One',cursive;font-size:1.4rem;color:#fff;cursor:pointer;box-shadow:0 0 18px #ff2d78,0 0 40px #ff2d7844,inset 0 0 18px #ff2d7811;text-shadow:0 0 10px #ff2d78;animation:btnp 2s ease-in-out infinite;display:block;}
        @keyframes btnp{0%,100%{box-shadow:0 0 18px #ff2d78,0 0 40px #ff2d7844;}50%{box-shadow:0 0 40px #ff2d78,0 0 80px #ff2d7866;}}
        .skate-img{width:230px;height:230px;object-fit:contain;display:block;margin:0.4rem auto;animation:sglow 3s ease-in-out infinite;}
        @keyframes sglow{0%,100%{filter:drop-shadow(0 0 8px #ff2d78) drop-shadow(0 0 18px #c040ffaa);}50%{filter:drop-shadow(0 0 20px #ff2d78) drop-shadow(0 0 40px #c040ffcc) drop-shadow(0 0 60px #00f0ff66);}}
        .top-bar{background:rgba(10,0,30,0.95);border-bottom:2px solid #c040ff;box-shadow:0 0 25px #c040ff44;padding:1rem;text-align:center;overflow:hidden;}
        .ticker-wrap{overflow:hidden;margin-bottom:0.4rem;}
        .ticker{white-space:nowrap;display:inline-block;animation:tick 22s linear infinite;font-family:'Fredoka One',cursive;font-size:1.2rem;color:#ffd700;text-shadow:0 0 8px #ffd700;}
        @keyframes tick{from{transform:translateX(100vw)}to{transform:translateX(-100%)}}
        .banner-name{font-family:'Fredoka One',cursive;font-size:3.2rem;color:transparent;-webkit-text-stroke:2px #ffd700;text-shadow:0 0 12px #ffd700,0 0 30px #ffd700aa;}
        .banner-date{font-size:1.1rem;letter-spacing:3px;color:#00f0ff;text-shadow:0 0 8px #00f0ff;margin-top:0.4rem;}
        .nav-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(192,64,255,0.2);}
        .nav-btn{padding:1.4rem 1rem;background:rgba(5,0,15,0.95);border:none;color:#fff;font-family:'Fredoka One',cursive;font-size:1.4rem;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:0.4rem;}
        .nav-btn.active{background:rgba(20,0,50,0.98);}
        .nav-btn .ico{font-size:2rem;}
        .content{flex:1;padding:1.5rem;position:relative;z-index:2;}
        .info-card{background:rgba(15,0,40,0.9);border:1px solid rgba(192,64,255,0.35);border-radius:16px;padding:1.5rem;margin-bottom:1rem;}
        .info-row{display:flex;flex-direction:column;gap:0.3rem;padding:1rem 0;border-bottom:1px solid rgba(255,255,255,0.08);}
        .info-row:last-child{border-bottom:none;}
        .info-label{font-size:0.8rem;letter-spacing:3px;text-transform:uppercase;color:#c040ff;text-shadow:0 0 8px #c040ff88;font-family:'Fredoka One',cursive;}
        .info-val{color:#fff;line-height:1.6;font-size:1.15rem;}
        .panel-title{font-family:'Fredoka One',cursive;font-size:2.8rem;margin-bottom:1.25rem;}
        .rsvp-card{background:rgba(15,0,40,0.9);border:1px solid rgba(192,64,255,0.35);border-radius:20px;padding:2rem;text-align:center;}
        .rsvp-input{width:100%;padding:1rem 1.25rem;border-radius:12px;border:2px solid #c040ff66;background:rgba(0,0,0,0.6);color:#fff;font-family:'Space Mono',monospace;font-size:1.1rem;margin:1rem 0;outline:none;}
        .btn-yes{width:100%;padding:1.3rem 1.5rem;border:3px solid #7fff7f;border-radius:14px;background:transparent;font-family:'Fredoka One',cursive;font-size:1.5rem;color:#fff;cursor:pointer;box-shadow:0 0 18px #7fff7f88;text-shadow:0 0 10px #7fff7f;margin-bottom:1rem;animation:yesp 2.5s ease-in-out infinite;}
        @keyframes yesp{0%,100%{box-shadow:0 0 18px #7fff7f88;}50%{box-shadow:0 0 35px #7fff7fcc;}}
        .btn-no{width:100%;padding:1.3rem 1.5rem;border:3px solid #ff6688;border-radius:14px;background:transparent;font-family:'Fredoka One',cursive;font-size:1.3rem;color:#ccc;cursor:pointer;box-shadow:0 0 12px #ff668855;text-shadow:0 0 8px #ff6688aa;}
        .back-btn{width:100%;max-width:380px;padding:1.2rem 2rem;background:transparent;border:3px solid #c040ff;border-radius:50px;font-family:'Fredoka One',cursive;font-size:1.8rem;color:#fff;cursor:pointer;box-shadow:0 0 18px #c040ff88;text-shadow:0 0 10px #c040ff;}
        .host-box{background:rgba(15,0,40,0.95);border:2px solid #c040ff;border-radius:20px;padding:2rem;width:100%;max-width:400px;}
        .host-input{width:100%;padding:0.85rem 1rem;border-radius:12px;border:2px solid #c040ff66;background:rgba(0,0,0,0.6);color:#fff;font-family:'Space Mono',monospace;font-size:0.95rem;margin-bottom:1rem;outline:none;}
        .host-btn-enter{width:100%;padding:0.9rem;background:transparent;border:2px solid #c040ff;border-radius:50px;font-family:'Fredoka One',cursive;font-size:1.2rem;color:#fff;cursor:pointer;text-shadow:0 0 10px #c040ff;}
        .dash{width:100%;max-width:500px;padding:1.5rem;}
        .dash-title{font-family:'Fredoka One',cursive;font-size:2rem;text-align:center;margin-bottom:1.5rem;color:transparent;-webkit-text-stroke:2px #ffd700;text-shadow:0 0 15px #ffd700;}
        .stat-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;}
        .stat-box{background:rgba(15,0,40,0.85);border-radius:16px;padding:1rem;text-align:center;border:1px solid rgba(255,255,255,0.08);}
        .stat-num{font-family:'Fredoka One',cursive;font-size:3rem;line-height:1;}
        .stat-lab{font-size:0.62rem;letter-spacing:2px;color:#aaa;margin-top:0.25rem;}
        .list-card{background:rgba(15,0,40,0.85);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:1.25rem;margin-bottom:1.5rem;}
        .list-card h3{font-family:'Fredoka One',cursive;font-size:1.3rem;margin-bottom:0.75rem;color:#00f0ff;text-shadow:0 0 10px #00f0ff;}
        .list-item{display:flex;justify-content:space-between;align-items:center;padding:0.7rem 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:0.9rem;color:#ddd;}
        .list-item:last-child{border-bottom:none;}
        .list-time{font-size:0.6rem;color:#555;margin-top:2px;}
        .badge-y{background:rgba(127,255,127,0.12);color:#7fff7f;border:1px solid rgba(127,255,127,0.35);padding:3px 12px;border-radius:20px;font-size:0.75rem;}
        .badge-n{background:rgba(255,102,136,0.08);color:#ff6688;border:1px solid rgba(255,102,136,0.25);padding:3px 12px;border-radius:20px;font-size:0.75rem;}
        .edit-section{margin-top:1.5rem;}
        .edit-title{font-family:'Fredoka One',cursive;font-size:1.6rem;color:#ffd700;text-shadow:0 0 12px #ffd700;margin-bottom:1rem;}
        .edit-field{display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1rem;}
        .edit-label{font-size:0.7rem;letter-spacing:2px;color:#c040ff;font-family:'Fredoka One',cursive;text-transform:uppercase;}
        .save-btn{width:100%;padding:1rem;background:transparent;border:3px solid #7fff7f;border-radius:50px;font-family:'Fredoka One',cursive;font-size:1.3rem;color:#fff;cursor:pointer;box-shadow:0 0 18px #7fff7f88;text-shadow:0 0 10px #7fff7f;margin-top:0.5rem;}
        .save-confirm{text-align:center;color:#7fff7f;font-family:'Fredoka One',cursive;font-size:1rem;text-shadow:0 0 8px #7fff7f;margin-top:0.5rem;}
        .host-link{font-family:'Fredoka One',cursive;font-size:1rem;color:#c040ff88;background:transparent;border:none;cursor:pointer;text-decoration:underline;text-shadow:0 0 8px #c040ff55;}
        .empty{color:#555;font-size:0.85rem;text-align:center;padding:1.5rem;}
        .stars-wrap{position:fixed;inset:0;pointer-events:none;z-index:1;}
        .st{position:absolute;background:#fff;border-radius:50%;animation:twink ease-in-out infinite alternate;}
        @keyframes twink{from{opacity:.05}to{opacity:.9}}
        .bubbles-wrap{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;}
        .bubble{position:absolute;border-radius:50%;animation:rise linear infinite;}
        @keyframes rise{0%{transform:translateY(0);opacity:0.6;}100%{transform:translateY(-110vh);opacity:0;}}
      `}</style>

      {/* Background layers */}
      <canvas id="bgCanvas" ref={bgRef}/>
      <canvas id="floorCanvas" ref={floorRef}/>
      <div className="stars-wrap" id="stars-wrap"/>
      <div className="bubbles-wrap" id="bubbles-wrap"/>

      {/* ===== INTRO ===== */}
      <div className={`screen above ${screen === 'intro' ? 'active' : ''}`} id="intro" style={{alignItems:'center',padding:'1rem 1rem 2rem',overflow:'hidden'}}>
        <canvas ref={ballRef} width={220} height={195} style={{display:'block',margin:'0 auto'}}/>
        <div style={{lineHeight:1,marginBottom:'0.2rem'}}>
          <div className="nt-lets">LET'S</div>
          <div className="nt-roll">ROLL</div>
        </div>
        <div className="nt-party">and Party!</div>
        <img src={skateDataUrl} alt="Neon roller skate" className="skate-img"/>
        <div className="nt-name">🎂 Lilly's 12th 🎂</div>
        <button className="enter-btn" onClick={() => setScreen('main')}>✉ Open Your Invite</button>
        <button onClick={goHost} style={{fontFamily:'Fredoka One,cursive',fontSize:'0.85rem',color:'#c040ff88',background:'transparent',border:'none',cursor:'pointer',textDecoration:'underline',marginTop:'0.8rem',paddingBottom:'1.5rem'}}>🔐 Host access</button>
      </div>

      {/* ===== MAIN ===== */}
      <div className={`screen above ${screen === 'main' ? 'active' : ''}`} id="main">
        <div className="top-bar">
          <div className="ticker-wrap"><span className="ticker">{details.ticker}</span></div>
          <div className="banner-name">{details.party_name}</div>
          <div className="banner-date">{details.banner_datetime}</div>
        </div>
        <div className="nav-grid">
          <button className={`nav-btn ${panel === 'details' ? 'active' : ''}`} onClick={() => setPanel('details')} style={{color:'#ff2d78',textShadow:'0 0 8px #ff2d78'}}>
            <span className="ico">📍</span>Details
          </button>
          <button className={`nav-btn ${panel === 'rsvp' ? 'active' : ''}`} onClick={() => setPanel('rsvp')} style={{color:'#7fff7f',textShadow:'0 0 8px #7fff7f'}}>
            <span className="ico">✅</span>Click here to RSVP
          </button>
        </div>
        <div className="content">
          {/* Details panel */}
          {panel === 'details' && (
            <div>
              <div className="panel-title" style={{color:'transparent',WebkitTextStroke:'2px #ff2d78',textShadow:'0 0 12px #ff2d78,0 0 30px #ff2d7888'}}>Party Details 📍</div>
              <div className="info-card">
                <div className="info-row"><span className="info-label">When</span><span className="info-val">{details.detail_when}</span></div>
                <div className="info-row"><span className="info-label">Where</span><span className="info-val">{details.detail_where}</span></div>
                <div className="info-row"><span className="info-label">Contact</span><span className="info-val">{details.detail_contact}</span></div>
                <div className="info-row"><span className="info-label">Food</span><span className="info-val">{details.detail_food}</span></div>
                <div className="info-row"><span className="info-label">Skates</span><span className="info-val">{details.detail_skates}</span></div>
              </div>
            </div>
          )}
          {/* RSVP panel */}
          {panel === 'rsvp' && (
            <div>
              <div className="panel-title" style={{color:'transparent',WebkitTextStroke:'2px #7fff7f',textShadow:'0 0 12px #7fff7f88'}}>RSVP 🎉</div>
              {!rsvpDone ? (
                <div className="rsvp-card">
                  <p style={{fontSize:'0.95rem',color:'#c0a0ff',marginBottom:'0.25rem'}}>Will you be joining us on the rink?</p>
                  <p style={{fontSize:'0.8rem',color:'#7060aa'}}>Let us know so we can save your spot! 🛼</p>
                  <input className="rsvp-input" placeholder="Your name..." value={rsvpName} onChange={e => setRsvpName(e.target.value)}/>
                  {rsvpErr && <p style={{color:'#ff4444',fontSize:'0.8rem',marginBottom:'0.5rem'}}>Please enter your name first!</p>}
                  <button className="btn-yes" onClick={() => submitRSVP('yes')} disabled={loading}>🛼 I Will Be There!</button>
                  <button className="btn-no" onClick={() => submitRSVP('no')} disabled={loading}>💔 Unfortunately, I Can't Make It</button>
                </div>
              ) : (
                <div style={{textAlign:'center',padding:'2rem 1rem'}}>
                  <div style={{fontSize:'3.5rem'}}>{rsvpDone === 'yes' ? '🛼' : '💔'}</div>
                  <div style={{fontFamily:'Fredoka One,cursive',fontSize:'1.9rem',margin:'0.75rem 0 0.5rem',color:rsvpDone==='yes'?'transparent':'#ff6688',WebkitTextStroke:rsvpDone==='yes'?'2px #7fff7f':'none',textShadow:rsvpDone==='yes'?'0 0 15px #7fff7f':'0 0 15px #ff668888'}}>
                    {rsvpDone === 'yes' ? `See you on the rink, ${rsvpName}!` : `We'll miss you, ${rsvpName}!`}
                  </div>
                  <p style={{color:'#00f0ff',fontSize:'0.9rem',textShadow:'0 0 8px #00f0ff'}}>
                    {rsvpDone === 'yes' ? 'Get those disco moves ready 🕺✨' : 'Hope to catch you next time 💙'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{textAlign:'center',padding:'1.5rem 1rem 3rem',position:'relative',zIndex:2,display:'flex',flexDirection:'column',gap:'1rem',alignItems:'center'}}>
          <button className="back-btn" onClick={() => setScreen('intro')}>← Back</button>
          <button onClick={goHost} className="host-link">🔐 Host login</button>
        </div>
      </div>

      {/* ===== HOST ===== */}
      <div className={`screen ${screen === 'host' ? 'active' : ''}`} style={{background:'radial-gradient(ellipse at 50% 20%,#150040,#05000f)',alignItems:'center',justifyContent:'center',padding:'2rem'}}>
        {!authed ? (
          <div className="host-box above">
            <h2 style={{fontFamily:'Fredoka One,cursive',fontSize:'2rem',textAlign:'center',marginBottom:'1.5rem',color:'transparent',WebkitTextStroke:'2px #c040ff',textShadow:'0 0 15px #c040ff'}}>Host Login 🔐</h2>
            <input className="host-input" type="password" placeholder="Password..." value={hostPw} onChange={e => setHostPw(e.target.value)} onKeyDown={e => e.key==='Enter' && hostLogin()}/>
            <button className="host-btn-enter" onClick={hostLogin}>Enter</button>
            {hostErr && <p style={{color:'#ff4444',fontSize:'0.8rem',textAlign:'center',marginTop:'0.5rem'}}>Wrong password</p>}
            <button onClick={() => setScreen('main')} style={{display:'block',margin:'1.5rem auto 0',color:'#c040ff',fontFamily:'Fredoka One,cursive',fontSize:'1.1rem',background:'transparent',border:'none',cursor:'pointer',textDecoration:'underline',textShadow:'0 0 8px #c040ff88'}}>← Back</button>
          </div>
        ) : (
          <div className="dash above">
            <div className="dash-title">🎂 RSVP Dashboard</div>
            <div className="stat-row">
              <div className="stat-box"><div className="stat-num" style={{color:'#7fff7f',textShadow:'0 0 15px #7fff7f'}}>{yesCount}</div><div className="stat-lab">WILL BE THERE 🛼</div></div>
              <div className="stat-box"><div className="stat-num" style={{color:'#ff6688',textShadow:'0 0 15px #ff6688'}}>{noCount}</div><div className="stat-lab">CAN'T MAKE IT 💔</div></div>
            </div>
            <div className="list-card">
              <h3>Guest Responses</h3>
              {rsvps.length === 0 ? <p className="empty">No RSVPs yet — share that QR code! 🎉</p> : rsvps.map((r, i) => (
                <div key={i} className="list-item">
                  <span>{r.name}</span>
                  <div style={{textAlign:'right'}}>
                    <span className={r.coming === 'yes' ? 'badge-y' : 'badge-n'}>{r.coming === 'yes' ? '🛼 Coming' : '💔 Can\'t make it'}</span>
                    <div className="list-time">{r.created_at ? new Date(r.created_at).toLocaleString('en-AU') : ''}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={clearRsvps} style={{background:'transparent',border:'1px solid rgba(255,68,68,0.35)',color:'#ff4444',borderRadius:'8px',padding:'0.5rem 1rem',fontSize:'0.75rem',cursor:'pointer',letterSpacing:'1px',marginBottom:'2rem',display:'block'}}>CLEAR ALL RSVPs</button>

            {/* Edit details */}
            <div className="edit-section">
              <div className="edit-title">✏️ Edit Party Details</div>
              {[
                {key:'party_name', label:'Party Name', placeholder:"e.g. 🎂 Lilly's 12th Birthday! 🎂"},
                {key:'banner_datetime', label:'Date & Time (banner)', placeholder:'e.g. SATURDAY · 19 JULY 2025 · 7:00PM'},
                {key:'detail_when', label:'When (details card)', placeholder:'e.g. Saturday 19th July 2025 · 7:00pm – 10:00pm'},
                {key:'detail_where', label:'Where', placeholder:'e.g. Rollerworld SA · 123 Skate St, Adelaide SA 5000'},
                {key:'detail_contact', label:'Contact', placeholder:"e.g. Sarah (Lilly's Mum) · 0400 000 000"},
                {key:'detail_food', label:'Food', placeholder:'e.g. Pizza & cake included · Text Sarah re dietary needs'},
                {key:'detail_skates', label:'Skates', placeholder:'e.g. Hire included — just bring your socks & best moves'},
                {key:'ticker', label:'Scrolling ticker text', placeholder:'🛼 Rollerskating Disco Party · Saturday 19 July...'},
              ].map(f => (
                <div key={f.key} className="edit-field">
                  <label className="edit-label">{f.label}</label>
                  <input className="host-input" style={{marginBottom:0}} placeholder={f.placeholder} value={editForm[f.key] || ''} onChange={e => setEditForm({...editForm,[f.key]:e.target.value})}/>
                </div>
              ))}
              <button className="save-btn" onClick={saveDetails}>💾 Save Changes</button>
              {saveMsg && <div className="save-confirm">✅ Saved! Changes are live on the invite.</div>}
            </div>
            <button onClick={() => setScreen('main')} style={{display:'block',margin:'2rem auto 0',color:'#c040ff',fontFamily:'Fredoka One,cursive',fontSize:'1.1rem',background:'transparent',border:'none',cursor:'pointer',textDecoration:'underline',textShadow:'0 0 8px #c040ff88'}}>← Back to invite</button>
          </div>
        )}
      </div>

      <StarsBubbles/>
    </>
  )
}

function StarsBubbles() {
  useEffect(() => {
    const sw = document.getElementById('stars-wrap')
    const bw = document.getElementById('bubbles-wrap')
    if (!sw || !bw) return
    for (let i = 0; i < 90; i++) {
      const s = document.createElement('div'); s.className = 'st'
      const sz = Math.random() * 2 + 0.5
      Object.assign(s.style, { width: sz + 'px', height: sz + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', animationDelay: Math.random() * 4 + 's', animationDuration: (1.5 + Math.random() * 3) + 's' })
      sw.appendChild(s)
    }
    const cols = ['rgba(0,212,255,','rgba(255,16,160,','rgba(192,64,255,','rgba(255,215,0,','rgba(127,255,127,']
    for (let i = 0; i < 20; i++) {
      const b = document.createElement('div'); b.className = 'bubble'
      const sz = Math.random() * 32 + 8, c = cols[Math.floor(Math.random() * cols.length)]
      Object.assign(b.style, { width: sz + 'px', height: sz + 'px', left: Math.random() * 100 + '%', bottom: '-50px', border: `2px solid ${c}0.4)`, background: `radial-gradient(circle at 30% 30%,${c}0.2),${c}0.04))`, animationDuration: (8 + Math.random() * 14) + 's', animationDelay: Math.random() * 12 + 's' })
      bw.appendChild(b)
    }
  }, [])
  return null
}
