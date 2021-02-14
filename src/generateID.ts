let count = 0;

export default function generateID(): string {
  return (count++).toString(36);
}
