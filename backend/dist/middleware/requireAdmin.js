import { getUserByPrivyDid } from '../modules/users/users.service.js';
/**
 * Dipasang SETELAH requirePrivyAuth (butuh req.privyUserId sudah terisi).
 * Untuk kompetisi ini, admin ditentukan lewat kolom users.is_admin yang
 * di-set MANUAL langsung di database (tidak ada UI pendaftaran admin) --
 * cukup untuk demo, tapi di production sebaiknya ada alur terpisah yang
 * lebih formal (mis. invite khusus, role-based access control).
 */
export async function requireAdmin(req, res, next) {
    if (!req.privyUserId) {
        return res.status(401).json({ error: 'Belum login' });
    }
    const user = await getUserByPrivyDid(req.privyUserId);
    if (!user?.isAdmin) {
        return res.status(403).json({ error: 'Bukan admin' });
    }
    next();
}
