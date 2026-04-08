const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRoomCode(length = 6): string {
  let code = ''
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * ROOM_ALPHABET.length)
    code += ROOM_ALPHABET[index]
  }
  return code
}

export function buildFinalCode(fragments: string[]): string {
  return fragments.join(' - ')
}
