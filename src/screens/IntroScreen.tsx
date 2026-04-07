interface IntroScreenProps {
  onFinished: () => void
}

export function IntroScreen({ onFinished }: IntroScreenProps) {
  return (
    <section className="intro-screen" aria-label="Intro de la aplicacion">
      <video
        className="intro-screen__video"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={onFinished}
        onError={onFinished}
      >
        <source src="/multimedia/intro-escape-room.mp4" type="video/mp4" />
        Tu navegador no soporta video HTML5.
      </video>
    </section>
  )
}