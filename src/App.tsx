import { Helmet, HelmetProvider } from 'react-helmet-async'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import ParallaxHero from './components/sections/ParallaxHero'
import Article from './content/article.mdx'
import { Anim, Fx, Graph, Media } from './components/directives'
import ParallaxSlowDown from './components/utils/ParallaxSlowDown'
import ChatInterface from './components/interactive/ChatInterface'
import EliasController from './components/elias/EliasController'
import EliasCue from './components/elias/EliasCue'

function App() {
  useSmoothScroll()

  return (
    <HelmetProvider>
      <Helmet>
        <title>Dead Internet Theory - Long Read</title>
        <meta name="description" content="Dead Internet Theory: En dykk ned i teorien om at det meste av innholdet på internett allerede er generert av AI-er og bots." />
        <meta property="og:title" content="Dead Internet Theory - Long Read" />
        <meta property="og:description" content="Dead Internet Theory: En dykk ned i teorien om at det meste av innholdet på internett allerede er generert av AI-er og bots." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://example.com" />
        <meta property="og:image" content="https://example.com/og-image.jpg" />
      </Helmet>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <ParallaxHero />
        <main className="prose-longread px-4 py-16">
          <Article components={{ Anim, Fx, Graph, Media, EliasCue, ParallaxSlowDown, ChatInterface }} />
        </main>
        <EliasController />
      </div>
    </HelmetProvider>
  )
}

export default App