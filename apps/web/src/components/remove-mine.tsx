'use client'

import { useRouter } from 'next/navigation'
import { api } from '~/lib/api'

export function RemoveMine({ ladder }: { ladder: string }) {
  const router = useRouter()
  const remove = async () => {
    if (!confirm('remove your solution? this can’t be undone.')) return
    const res = await api.ladders[':id'].solutions.mine
      .$delete({ param: { id: ladder } })
      .catch(() => null)
    if (res?.ok) router.refresh()
  }
  return (
    <button
      type="button"
      onClick={remove}
      className="hover:text-ink ml-auto underline-offset-4 hover:underline"
    >
      remove yours
    </button>
  )
}
