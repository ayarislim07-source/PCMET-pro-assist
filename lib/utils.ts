export const categoryLabels: Record<string, string> = {
  langues: 'Langues', premiers_secours: 'Premiers secours',
  informatique: 'Informatique', formation_continue: 'Formation continue',
};

export const statusLabels: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée', completed: 'Terminée',
  cancelled: 'Annulée', rejected: 'Rejetée',
};

export const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const paymentStatusLabels: Record<string, string> = {
  pending: 'En attente', paid: 'Payé', refunded: 'Remboursé', failed: 'Échec',
};

export const appointmentStatusLabels: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé', completed: 'Terminé',
};

export const languageLabels: Record<string, string> = {
  allemand: 'Allemand', francais: 'Français', anglais: 'Anglais', italien: 'Italien',
};

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date));

export const formatDateTime = (date: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));

export const generateReceiptNumber = () =>
  'PCMET-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

export const generateCertificateNumber = () =>
  'CERT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
