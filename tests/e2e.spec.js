const { test, expect } = require('@playwright/test');

test.describe('Vivere Guest Registry E2E', () => {
    test('receptionist can login, create, find, and check in a guest', async ({ page }) => {
        // Masuk ke URL lokal (diatur jalan di background pada port 8080 saat pipeline CI)
        await page.goto('http://localhost:8080');
        await page.evaluate(() => localStorage.clear());
        await page.reload();

        // Pastikan judulnya benar
        await expect(page).toHaveTitle(/Vivere Hotel/);

        await page.fill('#loginUsername', 'receptionist01');
        await page.fill('#loginPassword', 'password123');
        await page.click('button[type="submit"]');

        await expect(page.locator('.app-header')).toContainText('receptionist');
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

        const row = page.locator('tr', { hasText: 'Mr. Anderson' });
        await expect(row).toBeVisible();

        await row.locator('[data-action="open-guest"]').click();
        await page.click('[data-guest-action="check-in"]');
        await expect(page.locator('#detailDrawer')).toContainText('Checked In');
    });
});
