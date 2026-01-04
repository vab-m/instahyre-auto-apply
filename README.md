# Instahyre Auto Apply - Chrome Extension

🚀 Automatically apply to multiple jobs on Instahyre with a single click. Save hours in your job search!

## Features

- **One-Click Auto Apply**: Apply to all matching jobs automatically
- **Smart Skip**: Skips jobs you've already applied to
- **Progress Tracking**: Real-time stats showing applied, skipped, and total jobs
- **Configurable Delay**: Set custom delays between applications
- **Auto-Scroll**: Automatically loads more jobs as you go
- **Beautiful UI**: Modern, dark-themed popup interface

## Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `instahyre-auto-apply-extension` folder
6. The extension icon will appear in your toolbar!

## Usage

1. Go to [Instahyre Opportunities](https://instahyre.com/candidate/opportunities/?matching=true)
2. Login to your account
3. Click the extension icon in your browser toolbar
4. Configure your settings (delay, auto-scroll, etc.)
5. Click **Start Auto Apply**
6. Watch as it applies to jobs automatically!

## Settings

| Setting | Description |
|---------|-------------|
| **Delay** | Time to wait between each application (1-10 seconds) |
| **Skip Applied** | Skip jobs you've already applied to |
| **Auto-Scroll** | Automatically scroll to load more jobs |

## Publishing to Chrome Web Store

### Prerequisites
1. A [Google Developer Account](https://chrome.google.com/webstore/devconsole/) ($5 one-time fee)
2. Icons in required sizes (16x16, 32x32, 48x48, 128x128 PNG)
3. Promotional images (optional but recommended)

### Steps to Publish

1. **Create Icons**: Place PNG icons in the `icons/` folder:
   - `icon16.png` (16x16 pixels)
   - `icon32.png` (32x32 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

2. **Zip the Extension**:
   ```bash
   cd instahyre-auto-apply-extension
   zip -r ../instahyre-auto-apply.zip . -x "*.DS_Store" -x "README.md"
   ```

3. **Upload to Chrome Web Store**:
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Click **New Item**
   - Upload your ZIP file
   - Fill in the required information:
     - **Name**: Instahyre Auto Apply
     - **Description**: Automatically apply to multiple jobs on Instahyre with one click
     - **Category**: Productivity
     - **Language**: English

4. **Add Store Listing Assets**:
   - Screenshot of the extension in action (1280x800 or 640x400)
   - Small promo tile (440x280)
   - Marquee promo tile (1400x560) - optional

5. **Submit for Review**:
   - Click **Submit for Review**
   - Wait 1-3 days for Google's review

## Privacy Policy (Required for Publishing)

Create a privacy policy page that states:
- What data the extension collects (none, it only runs locally)
- How data is used (only for automating clicks on the user's browser)
- No data is transmitted to external servers

You can host this on GitHub Pages or any website.

## Disclaimer

This extension is for educational and personal use. Use responsibly and in accordance with Instahyre's terms of service. The developers are not responsible for any account restrictions that may result from automated activity.

## Support

If you find this helpful, consider:
- ⭐ Starring this repository
- 📢 Sharing with fellow job seekers
- 🐛 Reporting bugs or suggesting features

---

Made with ❤️ for job seekers everywhere
