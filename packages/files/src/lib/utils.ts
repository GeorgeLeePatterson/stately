export function cn(...classes: Array<string | number | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
