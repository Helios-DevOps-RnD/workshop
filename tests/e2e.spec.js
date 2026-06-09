const { test, expect } = require('@playwright/test');

const APP_URL = process.env.E2E_BASE_URL || 'http://localhost:8080';

async function resetApp(page) {
    await page.goto(APP_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page).toHaveTitle(/Vivere Hotel/);
}

async function loginAs(page, username, password) {
    await page.fill('#loginUsername', username);
    await page.fill('#loginPassword', password);
    await page.click('button[type="submit"]');
}

async function loginAsReceptionist(page) {
    await loginAs(page, 'receptionist01', 'password123');
    await expect(page.locator('.app-header')).toContainText('receptionist');
}

async function loginAsAdmin(page) {
    await loginAs(page, 'admin01', 'admin123');
    await expect(page.locator('.app-header')).toContainText('admin');
}

function guestManagementPanel(page) {
    return page.locator('.panel', { hasText: 'Guest Management' });
}

function guestRow(page, text) {
    return page.locator('tbody tr', { hasText: text });
}

test.describe('Vivere Guest Registry E2E', () => {
    test.beforeEach(async ({ page }) => {
        await resetApp(page);
    });

    test('rejects invalid login and keeps the user on the login screen', async ({ page }) => {
        await loginAs(page, 'receptionist01', 'wrong-password');

        await expect(page.locator('.alert-error')).toContainText('Invalid username or password.');
        await expect(page.locator('#loginForm')).toBeVisible();
        await expect(page.locator('.app-header')).toHaveCount(0);
    });

    test('receptionist can create, find, and move a guest through the front-desk lifecycle', async ({ page }) => {
        await loginAsReceptionist(page);

        await page.click('#newGuestBtn');
        await page.fill('input[name="name"]', 'Mr. Anderson');
        await page.fill('input[name="room"]', '1901');
        await page.fill('input[name="checkInDate"]', '2026-06-13');
        await page.fill('input[name="checkOutDate"]', '2026-06-15');
        await page.fill('textarea[name="notes"]', 'Matrix conference arrival.');
        await page.click('#createGuestForm button[type="submit"]');

        await expect(page.locator('#detailDrawer')).toContainText('Mr. Anderson');
        await page.click('#closeDetailBtn');
        await page.fill('#searchInput', 'Mr. Anderson');
        await expect(guestRow(page, 'Mr. Anderson')).toBeVisible();

        await guestRow(page, 'Mr. Anderson').locator('[data-action="open-guest"]').click();
        await page.click('[data-guest-action="check-in"]');
        await expect(page.locator('#detailDrawer')).toContainText('Checked In');

        await page.selectOption('#detailFlagType', 'Payment Issue');
        await page.click('[data-guest-action="flag"]');
        await expect(page.locator('#detailDrawer')).toContainText('Flagged');
        await expect(page.locator('#detailDrawer')).toContainText('Payment Issue');

        await page.click('[data-guest-action="resolve-flag"]');
        await expect(page.locator('#detailDrawer')).toContainText('Checked In');
        await page.click('[data-guest-action="check-out"]');
        await expect(page.locator('#detailDrawer')).toContainText('Checked Out');
    });

    test('shows application validation errors when creating an invalid reservation', async ({ page }) => {
        await loginAsReceptionist(page);

        await page.click('#newGuestBtn');
        await page.fill('input[name="name"]', 'Invalid Date Guest');
        await page.fill('input[name="room"]', '221B');
        await page.fill('input[name="checkInDate"]', '2026-06-15');
        await page.fill('input[name="checkOutDate"]', '2026-06-10');
        await page.click('#createGuestForm button[type="submit"]');

        await expect(page.locator('#createGuestErrors')).toContainText('Check-out date cannot be before check-in date.');
        await expect(page.locator('#createGuestForm')).toBeVisible();
        await expect(page.locator('#detailDrawer')).not.toHaveClass(/open/);
    });

    test('filters by status and search text, then sorts visible guests by room', async ({ page }) => {
        await loginAsReceptionist(page);

        await page.selectOption('#statusFilter', 'Checked In');
        await expect(guestManagementPanel(page).locator('.panel-heading p')).toContainText('2 visible records');
        await expect(guestRow(page, 'Arief Nugroho')).toBeVisible();
        await expect(guestRow(page, 'Nadia Pratama')).toBeVisible();
        await expect(guestRow(page, 'Maya Santoso')).toHaveCount(0);

        await page.fill('#searchInput', 'Nadia');
        await expect(guestManagementPanel(page).locator('.panel-heading p')).toContainText('1 visible records');
        await expect(guestRow(page, 'Nadia Pratama')).toBeVisible();
        await expect(guestRow(page, 'Arief Nugroho')).toHaveCount(0);

        await page.selectOption('#statusFilter', 'All');
        await page.fill('#searchInput', '');
        await page.selectOption('#sortSelect', 'room');
        await expect(page.locator('tbody tr').first()).toContainText('Budi Laksana');
        await expect(page.locator('tbody tr').first()).toContainText('0605');
    });

    test('admin can view audit logs, toggle training mode, archive, and reset demo data', async ({ page }) => {
        await loginAsAdmin(page);

        await expect(page.locator('#toggleModeBtn')).toBeVisible();
        await expect(page.locator('#resetDemoBtn')).toBeVisible();

        await page.click('#auditToggleBtn');
        await expect(page.locator('.audit-panel')).toBeVisible();
        await expect(page.locator('.audit-panel')).toContainText('LOGIN_SUCCESS');

        await page.click('#toggleModeBtn');
        await expect(page.locator('#modeIndicator')).toContainText('Security Training Mode');
        await expect(page.locator('.alert-warning')).toContainText('Security Training Mode');

        await guestRow(page, 'Daniel Hartono').locator('[data-action="open-guest"]').click();
        await expect(page.locator('[data-guest-action="archive"]')).toBeVisible();
        await expect(page.locator('[data-guest-action="delete"]')).toBeVisible();
        await page.click('[data-guest-action="archive"]');
        await page.click('#closeDetailBtn');
        await page.fill('#searchInput', 'Daniel Hartono');
        await expect(guestManagementPanel(page).locator('.panel-heading p')).toContainText('0 visible records');

        await page.click('#resetDemoBtn');
        await expect(page.locator('#modeIndicator')).toContainText('Security Training Mode');
        await expect(guestManagementPanel(page).locator('.panel-heading p')).toContainText('1 visible records');
        await expect(guestRow(page, 'Daniel Hartono')).toBeVisible();
    });

    test('normal mode escapes saved notes, while training mode renders the unsafe demo payload as HTML', async ({ page }) => {
        const payload = '<img src=x onerror="window.__vivereXss = true">';

        await loginAsReceptionist(page);
        await guestRow(page, 'Arief Nugroho').locator('[data-action="open-guest"]').click();
        await page.fill('#detailNoteInput', payload);
        await page.click('[data-guest-action="save-note"]');

        await expect(page.locator('#guestNotePreview img')).toHaveCount(0);
        await expect(page.locator('#guestNotePreview')).toContainText(payload);
        await expect(page.evaluate(() => window.__vivereXss === true)).resolves.toBe(false);

        await page.click('#closeDetailBtn');
        await page.click('#logoutBtn');
        await loginAsAdmin(page);
        await page.click('#toggleModeBtn');
        await guestRow(page, 'Arief Nugroho').locator('[data-action="open-guest"]').click();

        await expect(page.locator('#guestNotePreview img')).toHaveCount(1);
        await expect(page.locator('#guestNotePreview img')).toHaveAttribute('onerror', 'window.__vivereXss = true');
    });
});
