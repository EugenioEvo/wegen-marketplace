import logoGreen from '../assets/wegen-logo.png'
import logoLight from '../assets/wegen-logo-light.png'

// Logo oficial da WeGen (arquivo enviado pelo cliente). `dark` usa a variante
// de wordmark branco, para superfícies escuras (footer, cards escuros).
export default function Logo({ dark = false, height = 34, className = '' }) {
  return (
    <img
      src={dark ? logoLight : logoGreen}
      alt="WeGen"
      style={{
        height: height + 'px',
        width: 'auto',
        display: 'block',
        // num flex-col, align-items:stretch esticaria o PNG na largura — travar
        alignSelf: 'flex-start',
        flex: 'none',
        objectFit: 'contain',
      }}
      className={className}
    />
  )
}
