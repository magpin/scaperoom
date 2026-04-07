import { Icon } from '../components/ui/Icon'
import { GameHUD } from '../components/game/GameHUD'
import { FragmentsPanel } from '../components/game/FragmentsPanel'
import { ProgressBar } from '../components/ui/ProgressBar'
import type { ReadingQuestion } from '../types/game'

type Feedback = {
  kind: 'correct' | 'incorrect'
  message: string
} | null

interface QuestionScreenProps {
  question: ReadingQuestion
  questionIndex: number
  totalQuestions: number
  selectedOptionId: string | null
  feedback: Feedback
  score: number
  elapsedSeconds: number
  keyFragments: string[]
  onSelectOption: (optionId: string) => void
  onSubmitAnswer: () => void
  onNextLevel: () => void
  onViewResult: () => void
}

export function QuestionScreen({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionId,
  feedback,
  score,
  elapsedSeconds,
  keyFragments,
  onSelectOption,
  onSubmitAnswer,
  onNextLevel,
  onViewResult,
}: QuestionScreenProps) {
  const isFinalLevel = questionIndex === totalQuestions - 1
  const isCorrect = feedback?.kind === 'correct'
  
  return (
    <div className="question-screen slide-up">
      {/* HUD */}
      <GameHUD
        currentLevel={questionIndex + 1}
        totalLevels={totalQuestions}
        score={score}
        elapsedSeconds={elapsedSeconds}
        keyFragments={keyFragments}
      />
      
      {/* Progress */}
      <div className="question-progress">
        <div className="question-progress__header">
          <span className="question-progress__count">
            Reto {questionIndex + 1} de {totalQuestions}
          </span>
        </div>
        <ProgressBar current={questionIndex + 1} total={totalQuestions} />
      </div>
      
      {/* Fragments Panel */}
      <FragmentsPanel fragments={keyFragments} totalFragments={totalQuestions} />
      
      {/* Question Card */}
      <div className="question-card game-card">
        <div className="question-card__header">
          <div className="question-card__level-icon">
            <Icon name="target" size={20} />
          </div>
          <h2 className="question-card__prompt">{question.prompt}</h2>
        </div>
        
        <div className="options-list">
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id
            let optionClass = 'option-card'
            
            if (isSelected) {
              optionClass += ' option-card--selected'
            }
            if (feedback && isSelected) {
              optionClass += feedback.kind === 'correct' 
                ? ' option-card--correct' 
                : ' option-card--incorrect'
            }
            
            return (
              <button
                key={option.id}
                className={optionClass}
                onClick={() => onSelectOption(option.id)}
                disabled={isCorrect}
                type="button"
              >
                <span className="option-card__letter">{option.id.toUpperCase()}</span>
                <p className="option-card__text">{option.text}</p>
              </button>
            )
          })}
        </div>
        
        {/* Feedback Panel */}
        {feedback && (
          <div className={`feedback-panel feedback-panel--${feedback.kind} scale-in`}>
            <p className="feedback-panel__title">
              {feedback.kind === 'correct' ? (
                <>
                  <Icon name="check" size={18} />
                  Correcto
                </>
              ) : (
                <>
                  <Icon name="x" size={18} />
                  Intenta de nuevo
                </>
              )}
            </p>
            <p className="feedback-panel__message">{feedback.message}</p>
            {feedback.kind === 'correct' && (
              <div className="feedback-panel__fragment">
                <Icon name="key" size={16} />
                Fragmento desbloqueado: <strong>{question.keyFragment}</strong>
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="question-actions">
          {isCorrect ? (
            isFinalLevel ? (
              <button 
                className="btn btn--success btn--lg btn--full" 
                onClick={onViewResult}
                type="button"
              >
                <Icon name="trophy" size={20} />
                Ver Resultado Final
              </button>
            ) : (
              <button 
                className="btn btn--primary btn--lg btn--full" 
                onClick={onNextLevel}
                type="button"
              >
                <Icon name="arrow-right" size={20} />
                Continuar al Nivel {questionIndex + 2}
              </button>
            )
          ) : (
            <button 
              className="btn btn--primary btn--lg btn--full" 
              onClick={onSubmitAnswer}
              disabled={!selectedOptionId}
              type="button"
            >
              <Icon name="check" size={20} />
              Verificar Respuesta
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
