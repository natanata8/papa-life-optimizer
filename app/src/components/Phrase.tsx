import { phraseChunks } from '@/domain/freed.ts'

export function Phrase({ text }: { text: string }) {
  return (
    <>
      {phraseChunks(text).map((chunk, index) => (
        <span key={`${index}-${chunk}`} className="whitespace-nowrap">
          {chunk}
        </span>
      ))}
    </>
  )
}
