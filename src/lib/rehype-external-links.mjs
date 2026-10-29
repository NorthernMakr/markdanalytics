// Build step for all Markdown content (posts, practice pages, site notes).
// Every link to another website:
//   - opens in a new window (target="_blank", rel="noopener noreferrer")
//   - says where it goes: the destination domain is shown, and screen readers
//     hear "opens in a new window, <domain>"
// Links that start a list item (further-reading lists) show the domain as text,
// e.g. "Install the Web SDK  experienceleague.adobe.com ↗". Links inside a
// sentence show a ↗ marker, with the domain in the tooltip and for screen
// readers, so prose stays readable.

const OWN_HOSTS = ['markdanalytics.ca', 'www.markdanalytics.ca'];

const text = (value) => ({ type: 'text', value });
const span = (className, children, extra = {}) => ({
  type: 'element', tagName: 'span', properties: { className, ...extra }, children,
});

function isFirstInListItem(node, parent) {
  if (!parent || parent.tagName !== 'li') {
    // Markdown can wrap list content in <p> inside <li>
    return false;
  }
  const first = parent.children.find((c) => !(c.type === 'text' && !c.value.trim()));
  return first === node;
}

// French content (src/content/*/fr/ and *.fr.md files) gets French wording.
const isFrench = (file) => /[\\/]fr[\\/]|\.fr\.mdx?$/.test(String(file?.path ?? file?.history?.[0] ?? ''));

export default function rehypeExternalLinks() {
  return (tree, file) => {
    const fr = isFrench(file);
    const newWin = fr ? 'ouvre une nouvelle fenêtre' : 'opens in a new window';
    const walk = (node, parent, grandparent) => {
      if (node.type === 'element' && node.tagName === 'a') {
        const href = String(node.properties?.href ?? '');
        if (/^https?:\/\//i.test(href)) {
          let host;
          try { host = new URL(href).hostname; } catch { host = ''; }
          if (host && !OWN_HOSTS.includes(host)) {
            const domain = host.replace(/^www\./, '');
            const listStyle = isFirstInListItem(node, parent) ||
              (parent?.tagName === 'p' && isFirstInListItem(node, parent) === false && grandparent?.tagName === 'li' &&
               parent.children.find((c) => !(c.type === 'text' && !c.value.trim())) === node);

            node.properties.target = '_blank';
            node.properties.rel = ['noopener', 'noreferrer'];
            node.properties.className = [...(node.properties.className ?? []), 'ext', listStyle ? 'ext-listed' : 'ext-inline'];
            node.properties.title = fr ? `Ouvre ${domain} dans une nouvelle fenêtre` : `Opens ${domain} in a new window`;
            node.children.push(
              ...(listStyle ? [span(['ext-domain'], [text(domain)])] : []),
              span(['ext-icon'], [text('↗')], { ariaHidden: 'true' }),
              span(['visually-hidden'], [text(listStyle ? ` (${newWin})` : ` (${newWin}, ${domain})`)]),
            );
          }
        }
      }
      for (const child of node.children ?? []) walk(child, node, parent);
    };
    walk(tree, null, null);
  };
}
