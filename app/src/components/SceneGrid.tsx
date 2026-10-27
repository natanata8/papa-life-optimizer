import { Icon } from '@/components/icons.tsx'
import { SCENE_LIST } from '@/domain/scenes.ts'
import { sceneIcon } from '@/domain/taskIcon.ts'
import type { SceneId } from '@/domain/types.ts'

export function SceneGrid({ onPick, testPrefix }: { onPick: (id: SceneId) => void; testPrefix: string }) {
  return (
    <div className="grid grid-cols-2 items-stretch gap-2">
      {SCENE_LIST.map((scene) => (
        <button
          key={scene.id}
          type="button"
          data-testid={`${testPrefix}${scene.id}`}
          className="hare-card flex h-full min-h-[88px] flex-col items-center justify-center gap-1.5 px-3 py-2 text-center text-[13px] leading-snug font-bold"
          onClick={() => onPick(scene.id)}
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
            <Icon name={sceneIcon(scene.id)} size={20} />
          </span>
          <span className="line-clamp-2">{scene.title}</span>
        </button>
      ))}
    </div>
  )
}
