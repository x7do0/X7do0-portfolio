# Contact links

Contact links are stored in both localized content files:

- `src/X7do0.Portfolio/Content/portfolio.ar.json`
- `src/X7do0.Portfolio/Content/portfolio.en.json`

Each link has a stable `id` in addition to its translated label:

```json
{
  "id": "linkedin",
  "label": "Connect on LinkedIn",
  "url": "https://www.linkedin.com/in/example",
  "kind": "secondary"
}
```

## Why the identifier matters

The visible label can change between languages, but the identifier must remain the same. Runtime validation, bilingual consistency checks, and `/readinessz` use the identifier rather than the array position or translated label.

This means links can be reordered or new links can be inserted without breaking release-readiness checks.

## Current reserved identifiers

- `email`
- `linkedin`
- `github`
- `youtube`
- `instagram`

Additional identifiers can be added when new contact methods are approved. Every identifier must:

1. Be non-empty.
2. Be unique across both `primaryLinks` and `socialLinks` in one language file.
3. Appear in the same group and order in both language files.

A link is treated as enabled only when its `url` is not empty. Keep unapproved links present with an empty URL so the bilingual structure remains aligned and the readiness report can identify what is still missing.
