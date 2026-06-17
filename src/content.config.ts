import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Schema for a single public source backing a record.
// Every record should be traceable to a public URL; the timestamp pins the
// exact moment in a video/stream when one is available.
const sourceSchema = z.object({
	// Human-readable label for the source (e.g. video/article title, channel).
	title: z.string(),
	// Public URL of the source. Must be publicly accessible.
	url: z.string().url(),
	// Optional video/stream timestamp such as "1:23:45" or "12:30".
	timestamp: z.string().optional(),
});

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		// Extend Starlight's default frontmatter with optional archive-record fields.
		// All fields are optional so existing pages (about.md, principles.md, etc.)
		// keep validating and building without any changes.
		schema: docsSchema({
			extend: z.object({
				// ISO date the recorded event/statement actually took place (YYYY-MM-DD).
				// Use z.coerce.date() so a plain ISO string in frontmatter is parsed safely.
				recordDate: z.coerce.date().optional(),

				// One or more public sources backing this record.
				sources: z.array(sourceSchema).optional(),

				// Verification lifecycle state. Exactly these three values are allowed.
				// 보류(held) -> 검토중(under review) -> 확인됨(confirmed).
				verification: z.enum(['확인됨', '검토중', '보류']).optional(),

				// Free-form classification tags for the record.
				// Named `recordTags` to avoid clashing with any reserved/built-in key.
				recordTags: z.array(z.string()).optional(),

				// Slugs or titles of related records for cross-linking.
				related: z.array(z.string()).optional(),
			}),
		}),
	}),
};
