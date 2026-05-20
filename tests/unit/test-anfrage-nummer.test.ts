import { generateAnfrageNummer } from '@/lib/anfrage/anfrage-nummer'

function createMockPayload(existingAnfragen: Array<{ anfrage_nummer: string }>) {
  return {
    find: jest.fn(() =>
      Promise.resolve({
        docs: existingAnfragen,
        totalDocs: existingAnfragen.length,
      })
    ),
  }
}

describe('generateAnfrageNummer', () => {
  it('generates ANF-YYYY-001 for first anfrage of the year', async () => {
    const mockPayload = createMockPayload([])
    const nummer = await generateAnfrageNummer(mockPayload as any)
    const year = new Date().getFullYear()
    expect(nummer).toBe(`ANF-${year}-001`)
  })

  it('increments from last existing number', async () => {
    const year = new Date().getFullYear()
    const mockPayload = createMockPayload([
      { anfrage_nummer: `ANF-${year}-005` },
    ])
    const nummer = await generateAnfrageNummer(mockPayload as any)
    expect(nummer).toBe(`ANF-${year}-006`)
  })

  it('pads number to 3 digits', async () => {
    const year = new Date().getFullYear()
    const mockPayload = createMockPayload([
      { anfrage_nummer: `ANF-${year}-099` },
    ])
    const nummer = await generateAnfrageNummer(mockPayload as any)
    expect(nummer).toBe(`ANF-${year}-100`)
  })

  it('handles numbers beyond 999', async () => {
    const year = new Date().getFullYear()
    const mockPayload = createMockPayload([
      { anfrage_nummer: `ANF-${year}-1234` },
    ])
    const nummer = await generateAnfrageNummer(mockPayload as any)
    expect(nummer).toBe(`ANF-${year}-1235`)
  })
})
