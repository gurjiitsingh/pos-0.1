export function isStoreOpenToday(schedule: any[]) {
  const todayName = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  const today = schedule.find(d => d.day === todayName);
  if (!today || !today.isOpen) {
    return { open: false };
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const amStart = toMinutes(today.amOpen);
  const amEnd = toMinutes(today.amClose);

  if (today.fullDay) {
    return {
      open: nowMinutes >= amStart && nowMinutes <= amEnd,
      nextOpen: today.amOpen,
    };
  }

  const pmStart = toMinutes(today.pmOpen);
  const pmEnd = toMinutes(today.pmClose);

  const open =
    (nowMinutes >= amStart && nowMinutes <= amEnd) ||
    (nowMinutes >= pmStart && nowMinutes <= pmEnd);

  return {
    open,
    nextOpen:
      nowMinutes < amStart
        ? today.amOpen
        : nowMinutes < pmStart
        ? today.pmOpen
        : null,
  };
}
