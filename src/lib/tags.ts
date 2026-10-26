/** Keep human-readable labels; match whitespace/case variants as one shared tag. */
export function normalizeTags(values: readonly string[] = []): string[] {
  const seen=new Set<string>();
  return values.map(value=>value.normalize('NFC').trim().replace(/\s+/g,' ')).filter(value=>{
    const key=value.toLocaleLowerCase('en-AU');
    if(!value||seen.has(key))return false;
    seen.add(key);return true;
  });
}
export const tagKey=(value:string)=>value.normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-AU');
export const tagHref=(value:string)=>'/tags?tag='+encodeURIComponent(value);
