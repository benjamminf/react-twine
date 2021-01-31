let count = 0;

export default function generateID(): string {
  return `id${count++}`;
}
