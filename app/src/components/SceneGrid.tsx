import { SCENE_LIST } from '@/domain/scenes.ts'
import type { SceneId } from '@/domain/types.ts'

export function SceneGrid({ onPick, testPrefix }: { onPick: (id: SceneId) => void; testPrefix: string }) {
  return (
    <div className="grid grid-cols-2 items-stretch gap-2">
      {SCENE_LIST.map((scene) => (
        <button
          key={scene.id}
          type="button"
          data-testid={`${testPrefix}${scene.id}`}
          className="flex h-full min-h-14 items-center gap-1.5 rounded-[14px] border border-[#eadfd3] bg-white px-3 py-2 text-left text-[13px] leading-snug font-bold"
          onClick={() => onPick(scene.id)}
        >
          <span className="shrink-0 text-lg" aria-hidden>
            {scene.icon}
          </span>
          <span className="line-clamp-2">{scene.title}</span>
        </button>
      ))}
    </div>
  )
}
