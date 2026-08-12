# Bulk Resource Upload Automation

This directory contains the automated batch processing pipeline for bulk downloading PDF/resource files, uploading them to Supabase Storage, and populating the `resources` database table.

---

## 1. Environment Setup

The upload script uses the **Supabase Service Role Key** to perform administrative uploads to Supabase Storage and insert rows into the database without requiring client authentication.

### Obtaining your `SUPABASE_SERVICE_ROLE_KEY`:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project -> **Project Settings** (gear icon at bottom left) -> **API**.
3. Under **Project API Keys**, find **`service_role`** (Secret). Click to reveal and copy it.

### Setting your `.env.local`:
Add the key to your local `.env.local` file (this file is already listed in `.gitignore`):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!CAUTION]
> **SECURITY WARNING**: The `service_role` key bypasses Row Level Security (RLS). **NEVER** expose this key in client-side React code, and **NEVER** commit it to public or private version control repositories.

---

## 2. Resource Manifest Format (`resource-manifest.json`)

Populate `scripts/resource-manifest.json` with an array of resource objects you want to upload:

```json
[
  {
    "title": "JEE Advanced 2025 Paper 1",
    "description": "Official Paper 1 question paper with answer key and section breakdown",
    "category": "previous_papers",
    "exam_tag": "JEE",
    "source_url": "https://example.com/direct-file-link.pdf",
    "file_type": "pdf",
    "thumbnail_url": null
  }
]
```

### Supported Categories:
- `roadmaps`
- `notes`
- `previous_papers`
- `templates`
- `tools`

### Supported Exam Tags:
- `JEE`
- `NEET`
- `GATE`
- `UPSC`
- `General`

---

## 3. Running the Bulk Upload

Run the script from your project root:

```bash
npm run upload-resources
```

*(or directly via Node)*:

```bash
node scripts/bulk-upload-resources.js
```

---

## How It Works

1. **Local Staging**: Downloads files from `source_url` into `scripts/tmp-downloads/` to prevent data loss if a network error occurs mid-batch.
2. **Resume Safety**: Skips redownloading files if they already exist locally in `tmp-downloads/`.
3. **Storage Upload**: Uploads each local file to the public Supabase Storage bucket **`resources`**.
4. **Database Sync**: Checks if a row with the exact `title` already exists in the `resources` database table. If not present, creates a new record linked to the storage public URL.
5. **Batch Resilience**: Logs individual item progress (`✅ Uploaded`, `ℹ️ Skipped`, `❌ Failed`) and continues processing the remaining batch if any single download fails. Prints a full summary report upon completion.
