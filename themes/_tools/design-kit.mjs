// Shared helpers for the uplift design references.
export const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------------------------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------------------------

/** Image slot. In the empty reference it becomes a labelled placeholder showing the crop. */
export function pic(ctx, file, alt, ratio = '3/2', focal = '50% 50%', cls = '') {
  if (ctx.empty) return `<div class="slot ${cls}" style="aspect-ratio:${ratio}"><span>${esc(alt)}<br><small>${ratio.replace('/', ':')}</small></span></div>`;
  return `<figure class="pic ${cls}" style="aspect-ratio:${ratio}"><img src="images/${file}.jpg" alt="${esc(alt)}" style="object-position:${focal}"></figure>`;
}

/** Text that only exists once the tenant has written it; the empty reference shows a hint. */
export const txt = (ctx, value, hint) => (ctx.empty ? `<span class="hint">${esc(hint)}</span>` : esc(value));

