export function isCategoryActive(cat: any, date: Date = new Date()): boolean {
  if (!cat.schedule_enabled) return true;
  const day = date.getDay();
  const days: number[] = cat.schedule_days ?? [0, 1, 2, 3, 4, 5, 6];
  if (!days.includes(day)) return false;
  if (!cat.schedule_from || !cat.schedule_until) return true;
  const [fh, fm] = (cat.schedule_from as string).split(":").map(Number);
  const [uh, um] = (cat.schedule_until as string).split(":").map(Number);
  const nowMins = date.getHours() * 60 + date.getMinutes();
  const fromMins = fh * 60 + fm;
  const untilMins = uh * 60 + um;
  return nowMins >= fromMins && nowMins <= untilMins;
}
