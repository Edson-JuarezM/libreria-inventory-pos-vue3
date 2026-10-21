const COVER_COLORS = ['#0f766e', '#9a3412', '#1d4ed8', '#7c3aed', '#be123c', '#475569']

const escapeXml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function wrapTitle(title, max = 14) {
  const lines = []
  let line = ''
  for (const word of title.split(' ')) {
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length > max && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 5)
}

function buildCover(title, color) {
  const lines = wrapTitle(title)
  const startY = 140 - (lines.length - 1) * 14
  const text = lines
    .map(
      (line, i) =>
        `<text x="100" y="${startY + i * 28}" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#ffffff">${escapeXml(line)}</text>`,
    )
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280"><rect width="200" height="280" fill="${color}"/><rect x="14" y="14" width="172" height="252" fill="none" stroke="#ffffff" stroke-opacity="0.5"/>${text}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const BOOKS = [
  { id: 9001, title: 'Cien años de soledad', author: 'Gabriel García Márquez', isbn: '978-99954-1-001-1', price: 120, stock: 12, minStock: 3, categoryId: 9101, category: 'Novelas' },
  { id: 9002, title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', isbn: '978-99954-1-002-8', price: 150, stock: 8, minStock: 3, categoryId: 9101, category: 'Novelas' },
  { id: 9003, title: 'Cálculo de una variable', author: 'James Stewart', isbn: '978-99954-1-003-5', price: 380, stock: 5, minStock: 2, categoryId: 9102, category: 'Textos universitarios' },
  { id: 9004, title: 'Código limpio', author: 'Robert C. Martin', isbn: '978-99954-1-004-2', price: 290, stock: 3, minStock: 3, categoryId: 9103, category: 'Ingeniería' },
  { id: 9005, title: 'La historia del arte', author: 'E. H. Gombrich', isbn: '978-99954-1-005-9', price: 260, stock: 6, minStock: 2, categoryId: 9104, category: 'Arte' },
  { id: 9006, title: 'Cuaderno universitario 100 hojas', author: '', isbn: '', price: 18, stock: 40, minStock: 10, categoryId: 9105, category: 'Papelería' },
]

export const SAMPLE_BOOKS = BOOKS.map((book, i) => ({
  ...book,
  synopsis: '',
  image: buildCover(book.title, COVER_COLORS[i]),
  local: true,
}))
