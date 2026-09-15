/** @type {import('tailwindcss').Config} */
// WeGen design tokens — marca oficial: verde WeGen + dourado (ondas do logo).
// `brand` = verde primário (era o azul Evolight do protótipo). `green` = verde
// vivo de economia/sucesso. `solar` = dourado (ondas, estrelas, energia limpa).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primária — Verde WeGen (ancorado no verde exato do logo: #264A03)
        brand: {
          50: '#ECF3E1',
          100: '#CEE2B6',
          200: '#A6C382',
          300: '#79A048',
          500: '#35630D',
          600: '#264A03',
          700: '#1C3A02',
          800: '#142B02',
          900: '#0E2103',
        },
        // Acento — Economia (verde vivo / esmeralda)
        green: {
          50: '#E7F7EF',
          100: '#BFEAD3',
          500: '#15B86A',
          600: '#0E9457',
        },
        // Acento — Dourado (ondas do logo / energia / estrelas)
        solar: {
          50: '#FFF6DE',
          400: '#FFC233',
          500: '#FBA919',
          600: '#B7791F',
        },
        // Neutros — Slate
        slate: {
          50: '#F6F8FB',
          100: '#EDF1F6',
          200: '#DEE5EE',
          300: '#C4CEDB',
          400: '#94A2B5',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          900: '#0F172A',
        },
        // Semântica — erro
        red: {
          50: '#FDEDED',
          500: '#E5484D',
          600: '#C7383C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(20,51,10,.06)',
        md: '0 4px 16px rgba(20,51,10,.08)',
        lg: '0 12px 32px rgba(20,51,10,.12)',
        card: '0 1px 2px rgba(20,51,10,.06)',
        'card-hover': '0 4px 16px rgba(20,51,10,.10)',
        bar: '0 -8px 24px rgba(20,51,10,.25)',
        modal: '0 24px 64px rgba(20,51,10,.35)',
      },
      maxWidth: {
        container: '1200px',
      },
    },
  },
  plugins: [],
}
