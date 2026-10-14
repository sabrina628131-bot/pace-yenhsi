// Detects whether the classroom API exists. Static hosts (for example GitHub Pages) return 404 for /api/classroom,
// so the cloud-only links and the submit button are hidden. The offline practice features keep working either way.
(async () => {
  let cloud = false;
  try {
    const r = await fetch('api/classroom?op=me', { cache: 'no-store' });
    cloud = r.status !== 404;
  } catch {
    cloud = false;
  }
  document.documentElement.dataset.cloud = cloud ? 'on' : 'off';
})();
