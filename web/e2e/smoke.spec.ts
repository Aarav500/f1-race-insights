import { test, expect } from '@playwright/test'

/**
 * F1 Race Insights - Smoke Tests
 * 
 * These tests verify critical UI flows work without errors:
 * 1. Home page loads
 * 2. Race predictions work
 * 3. Race explorer works
 * 4. Counterfactual page works
 *  5. Backtest page doesn't crash
 * 6. Navigation works
 * 
 * Prerequisites: API and Web services must be running (docker-compose up)
 */

test.describe('F1 Race Insights Smoke Tests', () => {
    // Capture console errors and failed network requests
    let consoleErrors: string[] = []
    let networkErrors: { url: string, status: number }[] = []

    test.beforeEach(async ({ page }) => {
        // Reset error arrays
        consoleErrors = []
        networkErrors = []

        // Listen for console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text())
            }
        })

        // Listen for failed requests
        page.on('response', response => {
            const status = response.status()
            const url = response.url()

            // Track 4xx/5xx errors, but allow expected 404s
            if (status >= 400) {
                // Expected 404: backtest report may not exist
                const isExpected404 = status === 404 && url.includes('/backtest')
                if (!isExpected404) {
                    networkErrors.push({ url, status })
                }
            }
        })
    })

    test.afterEach(async () => {
        // Fail test if there were console errors or unexpected network failures
        expect(consoleErrors, `Console errors found: ${consoleErrors.join(', ')}`).toHaveLength(0)
        expect(networkErrors, `Network errors found: ${JSON.stringify(networkErrors)}`).toHaveLength(0)
    })

    test('home page loads without errors', async ({ page }) => {
        await page.goto('/')

        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle')

        // Check for key elements
        await expect(page.locator('h1')).toContainText('F1 Race Insights')

        // Verify RacePicker is present (not hardcoded race link)
        const racePickerLabel = page.locator('label:has-text("Try Predictions - Select a Race")')
        await expect(racePickerLabel).toBeVisible()

        // Verify season and race dropdowns exist
        const selects = await page.locator('select').count()
        expect(selects).toBeGreaterThanOrEqual(2) // Should have at least season + race selects

        // Ensure no hardcoded localhost:8000 links exist
        const localhostLinks = await page.locator('a[href*="localhost:8000"]').count()
        expect(localhostLinks).toBe(0)
    })

    test('race predictions page works', async ({ page }) => {
        await page.goto('/race/2024_01')

        // Wait for predictions to load
        await page.waitForLoadState('networkidle')

        // Check page loaded
        await expect(page.locator('h1')).toContainText('Race Predictions')

        // Models dropdown should be populated
        const modelSelect = page.locator('select')
        await expect(modelSelect).toBeVisible()
        const options = await modelSelect.locator('option').count()
        expect(options).toBeGreaterThan(1) // Should have models loaded from API

        // Wait for prediction data to render
        await expect(page.locator('text=Win Probability').or(page.locator('text=Loading'))).toBeVisible({ timeout: 10000 })
    })

    test('race explorer works', async ({ page }) => {
        await page.goto('/race-explorer')

        await page.waitForLoadState('networkidle')

        // Check page loaded
        await expect(page.locator('h1')).toContainText('Race Explorer')

        // Models dropdown should be populated
        const modelSelect = page.locator('select')
        const options = await modelSelect.locator('option').count()
        expect(options).toBeGreaterThan(1)

        // Try making a prediction
        await page.click('button:has-text("Get Predictions")')

        // Should either show data or error, but not crash
        await page.waitForTimeout(2000)
    })

    test('counterfactual page works', async ({ page }) => {
        await page.goto('/counterfactual/2024_01/VER')

        await page.waitForLoadState('networkidle')

        // Check page loaded
        await expect(page.locator('h1')).toContainText('Counterfactual Analysis')

        // Models dropdown should be populated (filtered for counterfactual support)
        const modelSelect = page.locator('select').first()
        await expect(modelSelect).toBeVisible()
        const options = await modelSelect.locator('option').count()
        expect(options).toBeGreaterThan(0)
    })

    test('backtest page loads and shows data or error', async ({ page }) => {
        await page.goto('/backtest')

        await page.waitForLoadState('networkidle')

        // Check page loaded
        await expect(page.locator('h1')).toContainText('Backtest')

        // Should show either:
        // 1. Model Comparison table with data
        // 2. Error message about missing backtest report
        const hasTable = await page.locator('table').count() > 0
        const hasError = await page.locator('text=/backtest report/i').count() > 0

        expect(hasTable || hasError).toBe(true)

        // If table exists, verify it has content
        if (hasTable) {
            const rows = await page.locator('tbody tr').count()
            expect(rows).toBeGreaterThan(0)
        }
    })

    test('navigation and back button work', async ({ page }) => {
        // Start at home
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // Navigate to race predictions
        await page.click('text=Try Predictions')
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL(/\/race\//)

        // Use back button
        await page.goBack()
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL('/')

        // Navigate forward again
        await page.goForward()
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL(/\/race\//)
    })
})
