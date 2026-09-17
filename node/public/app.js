document.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('scan-btn');
  const stopBtn = document.getElementById('stop-global');
  const groupForm = document.getElementById('group-form');
  const saveSettingsBtn = document.getElementById('save-settings');
  const preparePromoBtn = document.getElementById('prepare-promo');

  if (scanBtn) {
    scanBtn.addEventListener('click', async () => {
      const response = await fetch('/api/scan', { method: 'POST' });
      const data = await response.json();
      alert(data.success ? `Scan terminé : ${data.count} prospect(s) trouvé(s).` : data.message);
      window.location.reload();
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', async () => {
      const response = await fetch('/api/stop', { method: 'POST' });
      const data = await response.json();
      alert(data.message || 'STOP GLOBAL activé.');
    });
  }

  if (groupForm) {
    groupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(groupForm);
      const payload = {
        group: {
          name: formData.get('name'),
          url: formData.get('url'),
          enabled: formData.get('enabled') === 'on',
          allowPromotion: formData.get('allowPromotion') === 'on',
        },
      };

      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      alert(data.success ? 'Groupe ajouté.' : data.message);
      window.location.reload();
    });
  }

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async () => {
      const scanInterval = document.getElementById('scan-interval')?.value;
      const globalStop = document.getElementById('global-stop')?.checked;
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanInterval, globalStop }),
      });
      const data = await response.json();
      alert(data.success ? 'Paramètres enregistrés.' : data.message);
    });
  }

  if (preparePromoBtn) {
    preparePromoBtn.addEventListener('click', async () => {
      const text = document.getElementById('promo-text')?.value;
      const response = await fetch('/api/promotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      alert(data.success ? `Promotion préparée : ${data.publication.text}` : data.message);
    });
  }

  document.querySelectorAll('.reply').forEach((button) => {
    button.addEventListener('click', async () => {
      const postId = button.dataset.id;
      const res = await fetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      alert(data.reply || data.message);
    });
  });

  document.querySelectorAll('.publish').forEach((button) => {
    button.addEventListener('click', async () => {
      const confirmed = window.confirm('Confirmez-vous la publication ?');
      if (!confirmed) return;
      const postId = button.dataset.id;
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      alert(data.message || 'Action validée.');
      window.location.reload();
    });
  });
});
