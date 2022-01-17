export function findParentByTag(
  el: HTMLElement | null,
  tag: string
): HTMLElement | null {
  if (!el || el.tagName === tag) {
    return el;
  } else {
    return findParentByTag(el.parentElement, tag);
  }
}
