import { ListGroup, ListRow } from './list-group'

/** Temporary body for screens whose content lands in a later build phase. */
export function ComingSoon({ phase, items }: { phase: number; items: string[] }) {
  return (
    <ListGroup title={`Arrives in phase ${phase}`}>
      {items.map((item) => (
        <ListRow key={item} title={item} />
      ))}
    </ListGroup>
  )
}
