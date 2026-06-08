const { test, expect } = require('@playwright/test');

test.describe('Vivere Guest Registry E2E', () => {
    test('User can register and remove a guest', async ({ page }) => {
        // Masuk ke URL lokal (diatur jalan di background pada port 8080 saat pipeline CI)
        await page.goto('http://localhost:8080');

        // Pastikan judulnya benar
        await expect(page).toHaveTitle(/Vivere Hotel/);

        // Simulasi input nama tamu
        const inputField = page.locator('#guestName');
        await inputField.fill('Mr. Anderson');
        
        // Simulasi klik tombol Register
        await page.click('#addBtn');

        // Verifikasi tamu muncul di dalam list
        const listItem = page.locator('ul#guestList li').first();
        await expect(listItem).toContainText('Mr. Anderson');

        // Simulasi klik hapus
        const removeBtn = listItem.locator('button.btn-danger');
        await removeBtn.click();

        // Verifikasi list kembali kosong
        await expect(page.locator('ul#guestList li')).toHaveCount(0);
        await expect(page.locator('.empty-state')).toBeVisible();
    });
});